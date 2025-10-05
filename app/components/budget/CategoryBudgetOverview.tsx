'use client'

import { useState, useEffect } from 'react'
import { CategoryBudgetAnalysis, FixedExpense } from '../../types'
import { fetchCategoryBudgetAnalysis, fetchFixedExpenses } from '../../lib/api'
import { ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

// カテゴリ別予算のサマリーを集計し、支出状況をダッシュボード表示
export default function CategoryBudgetOverview() {
  const [analysis, setAnalysis] = useState<CategoryBudgetAnalysis[]>([])
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalysis()
  }, [])

  const loadAnalysis = async () => {
    try {
      setLoading(true)
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1

      const [analysisData, fixedExpensesData] = await Promise.all([
        fetchCategoryBudgetAnalysis(year, month),
        fetchFixedExpenses()
      ])
      
      setAnalysis(Array.isArray(analysisData) ? analysisData : [])
      setFixedExpenses(Array.isArray(fixedExpensesData) ? fixedExpensesData : [])
    } catch (error) {
      console.error('カテゴリ別予算分析の取得に失敗しました:', error)
      setAnalysis([])
      setFixedExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  // 取引履歴からのみ分析データを作成（固定費から生成された取引も含む）
  const analysisWithFixedExpenses = analysis.map(item => {
    return {
      ...item,
      // 既にitem.spentAmountには固定費から生成された取引も含まれている
      spentAmount: item.spentAmount,
      remainingAmount: item.remainingAmount,
      utilizationRate: item.utilizationRate,
      isOverBudget: item.isOverBudget,
      fixedExpenseAmount: 0 // 固定費は取引履歴に含まれているため0
    }
  })

  const totalBudget = analysisWithFixedExpenses.reduce((sum, item) => sum + item.budgetAmount, 0)
  const totalSpent = analysisWithFixedExpenses.reduce((sum, item) => sum + item.spentAmount, 0)
  const totalRemaining = totalBudget - totalSpent
  const overBudgetCategories = analysisWithFixedExpenses.filter(item => item.isOverBudget)
  const warningCategories: typeof analysisWithFixedExpenses = [] // 100%以下は正常なので警告なし

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (analysis.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">月間予算サマリー</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <ChartBarIcon className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">カテゴリ別予算を設定しましょう</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            カテゴリごとに予算を設定することで、<br />
            より詳細な支出管理ができます
          </p>
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">予算設定のメリット</p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• カテゴリごとの支出状況を把握</li>
                  <li>• 予算超過の早期発見</li>
                  <li>• 計画的な家計管理</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            右側の「予算を追加」ボタンから<br />
            カテゴリ別予算を設定してください
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">月間予算サマリー</h2>
      
      {/* サマリー統計 */}
      <div className="space-y-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">総予算</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">使用済み</p>
              <p className="text-xl font-bold text-orange-900 dark:text-orange-100">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border ${totalRemaining >= 0 ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700' : 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 border-red-200 dark:border-red-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${totalRemaining >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                残り予算
              </p>
              <p className={`text-xl font-bold ${totalRemaining >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                {formatCurrency(totalRemaining)}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${totalRemaining >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={totalRemaining >= 0 ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"} />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* アラート */}
      {(overBudgetCategories.length > 0 || warningCategories.length > 0) && (
        <div className="space-y-3 mb-6">
          {overBudgetCategories.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                <h3 className="font-medium text-red-800 text-sm">予算超過 ({overBudgetCategories.length}件)</h3>
              </div>
              <div className="space-y-1">
                {overBudgetCategories.slice(0, 3).map((item) => (
                  <p key={item.categoryId} className="text-xs text-red-700 flex items-center space-x-1">
                    <span>{item.categoryIcon}</span>
                    <span>{item.categoryName}</span>
                    <span className="font-medium">{formatCurrency(Math.abs(item.remainingAmount))}超過</span>
                  </p>
                ))}
                {overBudgetCategories.length > 3 && (
                  <p className="text-xs text-red-600">他{overBudgetCategories.length - 3}件</p>
                )}
              </div>
            </div>
          )}

          {warningCategories.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                <h3 className="font-medium text-yellow-800 text-sm">予算残り僅か ({warningCategories.length}件)</h3>
              </div>
              <div className="space-y-1">
                {warningCategories.slice(0, 3).map((item) => (
                  <p key={item.categoryId} className="text-xs text-yellow-700 flex items-center space-x-1">
                    <span>{item.categoryIcon}</span>
                    <span>{item.categoryName}</span>
                    <span className="font-medium">{Math.round(item.utilizationRate)}%使用済み</span>
                  </p>
                ))}
                {warningCategories.length > 3 && (
                  <p className="text-xs text-yellow-600">他{warningCategories.length - 3}件</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}


    </div>
  )
}
