'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import TabNavigation from '../components/TabNavigation'
import AddTransactionModal from '../components/AddTransactionModal'
import SettingsModal from '../components/SettingsModal'
import ReportsView from '../components/reports/ReportsView'
import { Category } from '../types'
import { fetchCategories } from '../lib/api'

export default function ReportsPage() {
  const router = useRouter()
  // レポート表示で利用するカテゴリやモーダル状態を保持
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // カテゴリ一覧を取得し、モーダルやフィルタに利用
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const categoriesData = await fetchCategories()
      setCategories(categoriesData)
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
    // トークンが無ければログイン画面へ遷移し、あればデータを読み込む
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
      
      <main className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          {/* ページヘッダー */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">レポート</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              月別の予算と実績を比較して、支出状況を確認できます
            </p>
          </div>

          {/* 月次レポート本体 */}
          <ReportsView />
        </div>
      </main>

      {/* 取引追加モーダル */}
      {isAddModalOpen && (
        <AddTransactionModal
          categories={categories}
          onClose={() => setIsAddModalOpen(false)}
          onTransactionAdded={handleTransactionAdded}
        />
      )}

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}
