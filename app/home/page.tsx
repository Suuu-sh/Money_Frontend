'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Dashboard from '../components/Dashboard'
import TransactionList from '../components/TransactionList'
import Analytics from '../components/Analytics'
import Reports from '../components/Reports'
import Categories from '../components/Categories'
import Calendar from '../components/Calendar'
import DayTransactions from '../components/DayTransactions'
import AddTransactionModal from '../components/AddTransactionModal'
import { Transaction, Category, Stats } from '../types'
import { fetchTransactions, fetchCategories, fetchStats } from '../lib/api'

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'calendar' | 'dashboard' | 'transactions' | 'analytics' | 'categories'>('calendar')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [modalDate, setModalDate] = useState<Date | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [transactionsData, categoriesData, statsData] = await Promise.all([
        fetchTransactions({ limit: 100 }),
        fetchCategories(),
        fetchStats()
      ])
      setTransactions(transactionsData)
      setCategories(categoriesData)
      setStats(statsData)
    } catch (error) {
      console.error('データ取得エラー:', error)
      // If API call fails due to auth, redirect to login
      if (error instanceof Error && error.message.includes('401')) {
        localStorage.removeItem('token')
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionAdded = () => {
    setIsAddModalOpen(false)
    setModalDate(null)
    loadData()
  }

  const handleTransactionUpdated = () => {
    loadData()
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleAddTransactionForDate = (date: Date) => {
    setModalDate(date)
    setIsAddModalOpen(true)
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
    <div className="min-h-screen bg-gray-50">
      <Header 
        onAddTransaction={() => setIsAddModalOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
      
      {/* Desktop Layout */}
      <main className="hidden md:block h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-4">
        {activeTab === 'calendar' && (
          <div className="h-full flex gap-6">
            <div className="flex-1 min-w-0">
              <Calendar 
                transactions={transactions}
                onDateClick={handleDateClick}
                selectedDate={selectedDate}
                onAddTransaction={handleAddTransactionForDate}
              />
            </div>
            <div className="w-80 flex-shrink-0">
              <DayTransactions 
                selectedDate={selectedDate}
                transactions={transactions}
                categories={categories}
                onTransactionUpdated={handleTransactionUpdated}
                onAddTransaction={handleAddTransactionForDate}
              />
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard 
            transactions={transactions}
            categories={categories}
            stats={stats}
          />
        )}
        
        {activeTab === 'transactions' && (
          <TransactionList 
            transactions={transactions}
            categories={categories}
            onTransactionUpdated={handleTransactionUpdated}
          />
        )}
        
        {activeTab === 'analytics' && (
          <Reports />
        )}
        
        {activeTab === 'categories' && (
          <Categories 
            categories={categories}
            onCategoryUpdated={loadData}
          />
        )}
      </main>

      {/* Mobile Layout */}
      <main className="md:hidden pb-16 pt-2">
        <div className="px-4">
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <Calendar 
                transactions={transactions}
                onDateClick={handleDateClick}
                selectedDate={selectedDate}
                onAddTransaction={handleAddTransactionForDate}
              />
              <DayTransactions 
                selectedDate={selectedDate}
                transactions={transactions}
                categories={categories}
                onTransactionUpdated={handleTransactionUpdated}
                onAddTransaction={handleAddTransactionForDate}
              />
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard 
              transactions={transactions}
              categories={categories}
              stats={stats}
            />
          )}
          
          {activeTab === 'transactions' && (
            <TransactionList 
              transactions={transactions}
              categories={categories}
              onTransactionUpdated={handleTransactionUpdated}
            />
          )}
          
          {activeTab === 'analytics' && (
            <Reports />
          )}
          
          {activeTab === 'categories' && (
            <Categories 
              categories={categories}
              onCategoryUpdated={loadData}
            />
          )}
        </div>
      </main>

      {isAddModalOpen && (
        <AddTransactionModal
          categories={categories}
          onClose={() => setIsAddModalOpen(false)}
          onTransactionAdded={handleTransactionAdded}
          defaultDate={modalDate || undefined}
        />
      )}
    </div>
  )
}