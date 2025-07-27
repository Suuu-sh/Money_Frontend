'use client'

import { useState } from 'react'
import Header from '../components/Header'
import TabNavigation from '../components/TabNavigation'
import SpendingTrendAnalysis from '../components/analytics/SpendingTrendAnalysis'
import IncomeTrendAnalysis from '../components/analytics/IncomeTrendAnalysis'
import CategoryAnalysis from '../components/analytics/CategoryAnalysis'
import SavingsRecommendations from '../components/analytics/SavingsRecommendations'
import FinancialInsights from '../components/analytics/FinancialInsights'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'trends' | 'categories' | 'recommendations' | 'insights'>('trends')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TabNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">財務分析</h1>
          <p className="text-gray-600">支出・収入の傾向を分析し、改善提案を確認できます</p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('trends')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'trends'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                トレンド分析
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'categories'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                カテゴリ分析
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'recommendations'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                削減提案
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'insights'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                インサイト
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'trends' && (
              <div className="space-y-6">
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
    </div>
  )
}