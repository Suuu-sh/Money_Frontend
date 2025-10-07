"use client"

/**
 * FixedTransactionsPage manages recurring income and expenses.
 *  - Fetches categories and passes them into the fixed expense/income modals.
 *  - After modal interactions, `handleBudgetUpdated` reloads the list to
 *    surface fresh data.
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FixedExpense, FixedTransaction, Category } from '../types'
import { fetchCategories } from '../lib/api'
import Header from '../components/Header'
import TabNavigation from '../components/TabNavigation'
import AddTransactionModal from '../components/AddTransactionModal'
import SettingsModal from '../components/SettingsModal'
import FixedTransactionsList from '../components/budget/FixedTransactionsList'
import FixedTransactionModal from '../components/budget/FixedTransactionModal'
import { DocumentChartBarIcon } from '@heroicons/react/24/outline'
import FixedExpenseModal from '../components/budget/FixedExpenseModal'


export default function FixedTransactionsPage() {
  const router = useRouter()
  // Category data, modal state, and refresh triggers for recurring items
  const [categories, setCategories] = useState<Category[]>([])
  const [budgetUpdateTrigger, setBudgetUpdateTrigger] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<FixedTransaction | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Load categories required when editing recurring items
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [categoriesData] = await Promise.all([
        fetchCategories()
      ])
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to fetch recurring transaction data:', error)
      if (error instanceof Error && error.message.includes('401')) {
        localStorage.removeItem('token')
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    // Enforce authentication before showing the page
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadData()
  }, [loadData, router])

  const handleTransactionAdded = () => {
    setIsAddModalOpen(false)
    loadData()
  }

  const handleBudgetUpdated = () => {
    // When a modal saves changes, trigger child list refresh
    setBudgetUpdateTrigger(prev => prev + 1)
  }



  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onAddTransaction={() => setIsAddModalOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <TabNavigation />
      
      <main className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">


        {/* Recurring income/expense management */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <FixedTransactionsList 
              key={`fixed-transactions-${budgetUpdateTrigger}`}
              onAddTransaction={() => setShowTransactionModal(true)}
              onEditTransaction={(transaction) => {
                setEditingTransaction(transaction)
                setShowTransactionModal(true)
              }}
              onTransactionsUpdated={handleBudgetUpdated}
            />
          </div>
        </div>
      </main>

      {/* Fixed expense modal */}
      <FixedExpenseModal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false)
          setEditingExpense(null)
        }}
        expense={editingExpense}
        onSaved={() => {
          handleBudgetUpdated()
          setEditingExpense(null)
        }}
      />

      {/* Recurring transaction modal */}
      <FixedTransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false)
          setEditingTransaction(null)
        }}
        transaction={editingTransaction}
        onSave={() => {
          handleBudgetUpdated()
          setEditingTransaction(null)
        }}
      />

      {/* Quick-add transaction modal */}
      {isAddModalOpen && (
        <AddTransactionModal
          categories={categories}
          onClose={() => setIsAddModalOpen(false)}
          onTransactionAdded={handleTransactionAdded}
        />
      )}

      {/* Settings modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}
