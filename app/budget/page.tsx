'use client'

import { useState, useEffect } from 'react'
import { BudgetAnalysis, FixedExpense } from '../types'
import { fetchBudgetAnalysis } from '../lib/api'
import BudgetOverview from '../components/budget/BudgetOverview'
import BudgetProgress from '../components/budget/BudgetProgress'
import BudgetAlerts from '../components/budget/BudgetAlerts'
import BudgetSettings from '../components/budget/BudgetSettings'
import FixedExpensesList from '../components/budget/FixedExpensesList'
import FixedExpenseModal from '../components/budget/FixedExpenseModal'
import BudgetHistory from '../components/budget/BudgetHistory'
import { CurrencyDollarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

export default function BudgetPage() {
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null)

  useEffect(() => {
    loadBudgetAnalysis()
  }, [])

  const loadBudgetAnalysis = async () => {
    try {
      setLoading(true)
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      
      const data = await fetchBudgetAnalysis(year, month)
      setAnalysis(data)
    } catch (error) {
      console.error('予算分析データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <CurrencyDollarIcon className="w-8 h-8 mr-3" />
                予算管理
              </h1>
              <p className="mt-2 text-gray-600">
                月次予算と固定費を設定して、計画的な家計管理を行いましょう
              </p>
            </div>
            <button className="btn-secondary flex items-center">
              <Cog6ToothIcon className="w-4 h-4 mr-2" />
              設定
            </button>
          </div>
        </div>

        {/* アラート表示 */}
        <div className="mb-6">
          <BudgetAlerts analysis={analysis} />
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム: 予算概要 */}
          <div className="lg:col-span-1">
            <BudgetOverview />
          </div>

          {/* 中央カラム: 予算進捗 */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">予算進捗</h2>
              {analysis ? (
                <BudgetProgress analysis={analysis} />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  予算データを読み込み中...
                </div>
              )}
            </div>
          </div>

          {/* 右カラム: 設定エリア */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* 予算設定 */}
              <BudgetSettings onBudgetUpdated={loadBudgetAnalysis} />

              {/* 固定費管理 */}
              <FixedExpensesList 
                onAddExpense={() => setShowExpenseModal(true)}
                onEditExpense={(expense) => {
                  setEditingExpense(expense)
                  setShowExpenseModal(true)
                }}
                onExpensesUpdated={loadBudgetAnalysis}
              />
            </div>
          </div>
        </div>

        {/* 予算履歴セクション */}
        <div className="mt-12">
          <BudgetHistory />
        </div>
      </div>

      {/* 固定費モーダル */}
      <FixedExpenseModal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false)
          setEditingExpense(null)
        }}
        expense={editingExpense}
        onSaved={() => {
          loadBudgetAnalysis()
          setEditingExpense(null)
        }}
      />
    </div>
  )
}