"use client"

/**
 * HomePage は DashboardPage と同じ構成ですが、ルート `/home` 用に分けています。
 *  - 認証／データ取得ロジックは共通化しており、初学者でも分かりやすいように
 *    `loadData` で必要な API をひとまとめにしています。
 *  - カレンダーと統計パネルを同じ画面で扱うため、レイアウトはダッシュボードと
 *    同様に PC 用とモバイル用で構造を分けています。
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import TabNavigation from '../components/TabNavigation'
import Dashboard from '../components/Dashboard'
import Calendar from '../components/Calendar'
import DayTransactions from '../components/DayTransactions'
import AddTransactionModal from '../components/AddTransactionModal'
import EditTransactionModal from '../components/EditTransactionModal'
import SettingsModal from '../components/SettingsModal'
import { Transaction, Category, Stats } from '../types'
import { fetchTransactions, fetchCategories, fetchStats } from '../lib/api'

export default function HomePage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()) // デフォルトで今日の日付を選択
  const [modalDate, setModalDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date()) // 今日の日付

  const loadData = useCallback(async (month?: Date) => {
    try {
      setLoading(true)
      
      // 月が指定されている場合は、その月のデータを取得
      let params: Parameters<typeof fetchTransactions>[0] = { limit: 100 }
      if (month) {
        const startDate = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0]
        const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0]
        params = { ...params, startDate, endDate }
      }
      
      const [transactionsData, categoriesData, statsData] = await Promise.all([
        fetchTransactions(params),
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
  }, [router])

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    // 初回読み込み時に今月のデータを取得
    loadData(new Date())
  }, [loadData, router])

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month)
    loadData(month)
  }

  const handleTransactionAdded = () => {
    setIsAddModalOpen(false)
    setModalDate(null)
    loadData()
  }

  const handleTransactionUpdated = () => {
    setIsEditModalOpen(false)
    setEditingTransaction(null)
    loadData()
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsEditModalOpen(true)
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onAddTransaction={() => setIsAddModalOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <TabNavigation />
      
      {/* Desktop Layout */}
      <main className="hidden md:block px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Calendar */}
          <div className="flex flex-col">
            {/* Calendar - Full visibility */}
            <div className="h-[calc(100vh-200px)] min-h-[600px]">
              <Calendar 
                transactions={transactions}
                onDateClick={handleDateClick}
                selectedDate={selectedDate}
                onAddTransaction={handleAddTransactionForDate}
                onMonthChange={handleMonthChange}
                currentMonth={currentMonth}
              />
            </div>
          </div>
          
          {/* Right: Dashboard Stats and Overview */}
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <Dashboard 
              transactions={transactions}
              categories={categories}
              stats={stats}
              selectedDate={selectedDate}
              currentMonth={currentMonth}
              onTransactionUpdated={handleTransactionUpdated}
              onAddTransaction={handleAddTransactionForDate}
              onEditTransaction={handleEditTransaction}
            />
          </div>
        </div>
      </main>

      {/* Mobile Layout */}
      <main className="md:hidden px-4 pt-4 pb-20">
        <div className="space-y-6">
          {/* Dashboard Stats */}
          <Dashboard 
            transactions={transactions}
            categories={categories}
            stats={stats}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            onTransactionUpdated={handleTransactionUpdated}
            onAddTransaction={handleAddTransactionForDate}
            onEditTransaction={handleEditTransaction}
          />
          
          {/* Compact Calendar */}
          <div className="h-96">
            <Calendar 
              transactions={transactions}
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
              onAddTransaction={handleAddTransactionForDate}
              onMonthChange={handleMonthChange}
              currentMonth={currentMonth}
            />
          </div>
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

      {isEditModalOpen && editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          categories={categories}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingTransaction(null)
          }}
          onTransactionUpdated={handleTransactionUpdated}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}
