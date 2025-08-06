'use client'

import { useState, useEffect } from 'react'
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
  const [activeTab, setActiveTab] = useState<'trends' | 'categories' | 'recommendations' | 'insights'>('trends')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

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
  }

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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Financial Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Analyze your financial data in detail and get insights for smart money management</p>
        </div>

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
              <div className="space-y-6">
                <SpendingPrediction />
                <SpendingTrendAnalysis />
                <IncomeTrendAnalysis />
              </div>
            )}
            
            {activeTab === 'categories' && (
              <CategoryAnalysis />
            )}
            
            {activeTab === 'recommendations' && (
              <SavingsRecommendations />
            )}
            
            {activeTab === 'insights' && (
              <FinancialInsights />
            )}
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <AddTransactionModal
          categories={categories}
          onClose={() => setIsAddModalOpen(false)}
          onTransactionAdded={handleTransactionAdded}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}