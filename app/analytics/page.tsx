'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import TabNavigation from '../components/TabNavigation'
import AddTransactionModal from '../components/AddTransactionModal'
import SettingsModal from '../components/SettingsModal'
import SpendingTrendAnalysis from '../components/analytics/SpendingTrendAnalysis'
import IncomeTrendAnalysis from '../components/analytics/IncomeTrendAnalysis'
import SpendingPrediction from '../components/analytics/SpendingPrediction'
import CategoryAnalysis from '../components/analytics/CategoryAnalysis'
import SavingsRecommendations from '../components/analytics/SavingsRecommendations'
import FinancialInsights from '../components/analytics/FinancialInsights'
import { Category } from '../types'
import { fetchCategories } from '../lib/api'

export default function AnalyticsPage() {
  const router = useRouter()
  // 画面全体で扱うタブとモーダルの状態をまとめて管理
  const [activeTab, setActiveTab] = useState<'trends' | 'categories' | 'recommendations' | 'insights'>('trends')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // カテゴリ候補を取得して分析コンポーネントに渡す
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
    // ローカルストレージのトークンを確認し、未ログインならログイン画面へ遷移
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        {/* タブナビゲーション */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('trends')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'trends'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                トレンド分析
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'categories'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                カテゴリ分析
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'recommendations'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                削減提案
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'insights'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                インサイト
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'trends' && (
              // トレンド分析タブでは時系列・予測系コンポーネントをまとめて表示
              <div className="space-y-6">
                <SpendingPrediction />
                <SpendingTrendAnalysis />
                <IncomeTrendAnalysis />
              </div>
            )}
            
            {activeTab === 'categories' && (
              // カテゴリ別詳細分析
              <CategoryAnalysis />
            )}
            
            {activeTab === 'recommendations' && (
              // 支出削減のための提案群
              <SavingsRecommendations />
            )}
            
            {activeTab === 'insights' && (
              // AIインサイトのまとめ
              <FinancialInsights />
            )}
          </div>
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
