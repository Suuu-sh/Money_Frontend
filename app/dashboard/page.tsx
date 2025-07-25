'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import TabNavigation from '../components/TabNavigation'
import Dashboard from '../components/Dashboard'
import Calendar from '../components/Calendar'
import DayTransactions from '../components/DayTransactions'
import AddTransactionModal from '../components/AddTransactionModal'
import { Transaction, Category, Stats } from '../types'
import { fetchTransactions, fetchCategories, fetchStats } from '../lib/api'

export default function DashboardPage() {
  const router = useRouter()
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
        onLogout={handleLogout}
      />
      <TabNavigation />
      
      {/* Desktop Layout */}
      <main className="hidden md:block px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Calendar and Day Transactions */}
          <div className="flex flex-col gap-4">
            {/* Calendar - Full visibility */}
            <div className="h-[calc(60vh-80px)] min-h-[500px]">
              <Calendar 
                transactions={transactions}
                onDateClick={handleDateClick}
                selectedDate={selectedDate}
                onAddTransaction={handleAddTransactionForDate}
              />
            </div>
            
            {/* Day Transactions */}
            <div className="flex-1">
              <DayTransactions 
                selectedDate={selectedDate}
                transactions={transactions}
                categories={categories}
                onTransactionUpdated={handleTransactionUpdated}
                onAddTransaction={handleAddTransactionForDate}
              />
            </div>
          </div>
          
          {/* Right: Dashboard Stats and Overview */}
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <Dashboard 
              transactions={transactions}
              categories={categories}
              stats={stats}
            />
          </div>
        </div>
      </main>

      {/* Mobile Layout */}
      <main className="md:hidden px-4 py-4 pb-20">
        <div className="space-y-6">
          {/* Dashboard Stats */}
          <Dashboard 
            transactions={transactions}
            categories={categories}
            stats={stats}
          />
          
          {/* Compact Calendar */}
          <div className="h-96">
            <Calendar 
              transactions={transactions}
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
              onAddTransaction={handleAddTransactionForDate}
            />
          </div>
          
          {/* Day Transactions */}
          <DayTransactions 
            selectedDate={selectedDate}
            transactions={transactions}
            categories={categories}
            onTransactionUpdated={handleTransactionUpdated}
            onAddTransaction={handleAddTransactionForDate}
          />
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