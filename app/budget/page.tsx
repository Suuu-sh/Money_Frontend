"use client"

/**
 * BudgetPage centralises budget configuration and recurring transactions.
 *  - Because the view is restricted to authenticated users, the token is
 *    validated immediately after mount.
 *  - Users often inspect the overall analysis and per-category budgets
 *    together, so the page keeps their state/modals in sync and refreshes via
 *    `handleBudgetUpdated`.
 *  - Fixed expense/transaction modals also originate here, so all `show*Modal`
 *    and `editing*` state is coordinated in this component.
 * For newcomers, start by mapping each useState hook to its UI element before
 * walking the event flow.
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BudgetAnalysis, FixedExpense, FixedTransaction, Category, CategoryBudget } from '../types'
import { fetchBudgetAnalysis, fetchCategories } from '../lib/api'
import Header from '../components/Header'
import TabNavigation from '../components/TabNavigation'
import AddTransactionModal from '../components/AddTransactionModal'
import SettingsModal from '../components/SettingsModal'
import BudgetAlerts from '../components/budget/BudgetAlerts'
import FixedTransactionsList from '../components/budget/FixedTransactionsList'
import FixedTransactionModal from '../components/budget/FixedTransactionModal'
import BudgetHistory from '../components/budget/BudgetHistory'
import CategoryBudgetList from '../components/budget/CategoryBudgetList'
import CategoryBudgetModal from '../components/budget/CategoryBudgetModal'
import { DocumentChartBarIcon } from '@heroicons/react/24/outline'
import FixedExpenseModal from '../components/budget/FixedExpenseModal'

export default function BudgetPage() {
  const router = useRouter()
  // State that drives the main budget widgets
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([])
  const [budgetUpdateTrigger, setBudgetUpdateTrigger] = useState(0) // Key to force list re-render
  const [loading, setLoading] = useState(true)

  // Modal visibility and currently edited items
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<FixedTransaction | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showCategoryBudgetModal, setShowCategoryBudgetModal] = useState(false)
  const [editingCategoryBudget, setEditingCategoryBudget] = useState<CategoryBudget | null>(null)
  // Load the current month's budget analysis for the summary cards
  const loadBudgetAnalysis = useCallback(async () => {
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1

      const data = await fetchBudgetAnalysis(year, month)
      setAnalysis(data)
    } catch (error) {
      console.error('Failed to fetch budget analysis:', error)
    }
  }, [])

  // Fetch categories and budget analysis in parallel to initialise the page
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [categoriesData] = await Promise.all([
        fetchCategories()
      ])
      setCategories(categoriesData)
      await loadBudgetAnalysis()
    } catch (error) {
      console.error('Failed to fetch budget data:', error)
      if (error instanceof Error && error.message.includes('401')) {
        localStorage.removeItem('token')
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }, [loadBudgetAnalysis, router])

  useEffect(() => {
    // Guard the page: redirect unauthenticated users to the login screen
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
    // Refresh both analysis and list when a category budget changes
    setBudgetUpdateTrigger(prev => prev + 1)
    loadBudgetAnalysis()
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
        {/* Keep alert area collapsed while budget alerts are disabled */}



        {/* Main section: category budgets and historical trends */}
        <div className="flex flex-col xl:flex-row gap-6 mb-8">
          {/* Category budgets - primary column */}
          <div className="xl:w-[65%]">
            <CategoryBudgetList
              key={budgetUpdateTrigger}
              categories={categories}
              onAddBudget={() => setShowCategoryBudgetModal(true)}
              onEditBudget={(budget) => {
                setEditingCategoryBudget(budget)
                setShowCategoryBudgetModal(true)
              }}
              onBudgetUpdated={handleBudgetUpdated}
            />
          </div>

          {/* Budget history - secondary column */}
          <div className="xl:w-[35%]">
            <BudgetHistory />
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

      {/* Category budget modal */}
      <CategoryBudgetModal
        isOpen={showCategoryBudgetModal}
        onClose={() => {
          setShowCategoryBudgetModal(false)
          setEditingCategoryBudget(null)
        }}
        categories={categories}
        budget={editingCategoryBudget}
        onSaved={() => {
          handleBudgetUpdated()
          setEditingCategoryBudget(null)
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
