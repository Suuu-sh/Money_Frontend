'use client'

import { useState, useEffect } from 'react'
import { CategoryBudgetAnalysis, FixedExpense } from '../../types'
import { fetchCategoryBudgetAnalysis, fetchFixedExpenses } from '../../lib/api'
import { ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

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

  const totalBudget = analysis.reduce((sum, item) => sum + item.budgetAmount, 0)
  const categorySpent = analysis.reduce((sum, item) => sum + item.spentAmount, 0)
  const fixedExpensesTotal = fixedExpenses
    .filter(expense => expense.isActive)
    .reduce((sum, expense) => sum + expense.amount, 0)
  const totalSpent = categorySpent + fixedExpensesTotal
  const totalRemaining = totalBudget - totalSpent
  const overBudgetCategories = analysis.filter(item => item.isOverBudget)
  const warningCategories = analysis.filter(item => !item.isOverBudget && item.utilizationRate >= 80)

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (analysis.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">カテゴリ別予算が設定されていません</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">月間予算サマリー</h2>
      
      {/* サマリー統計 */}
      <div className="space-y-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">総予算</p>
              <p className="text-xl font-bold text-blue-900">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 font-medium">使用済み</p>
              <p className="text-xl font-bold text-orange-900">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border ${totalRemaining >= 0 ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${totalRemaining >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                残り予算
              </p>
              <p className={`text-xl font-bold ${totalRemaining >= 0 ? 'text-green-900' : 'text-red-900'}`}>
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

      {/* 使用率ランキング */}
      {(analysis.length > 0 || fixedExpensesTotal > 0) && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3 text-sm">使用率ランキング</h3>
          <div className="space-y-2">
            {(() => {
              // カテゴリ別予算分析データを準備
              const categoryItems = analysis.map(item => ({
                ...item,
                type: 'category' as const
              }))

              // 固定費を仮想カテゴリとして追加（固定費がある場合のみ）
              const fixedExpenseItems = fixedExpensesTotal > 0 ? [{
                categoryId: 'fixed-expenses',
                categoryName: '固定費',
                categoryIcon: '🏠',
                categoryColor: '#6B7280',
                budgetAmount: fixedExpensesTotal, // 固定費は予算=実際の金額
                spentAmount: fixedExpensesTotal,
                remainingAmount: 0,
                utilizationRate: 100, // 固定費は常に100%
                isOverBudget: false,
                type: 'fixed' as const
              }] : []

              // 全てのアイテムを結合してソート
              const allItems = [...categoryItems, ...fixedExpenseItems]
                .sort((a, b) => b.utilizationRate - a.utilizationRate)
                .slice(0, 5)

              return allItems.map((item, index) => (
                <div key={item.categoryId} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-xs font-bold text-gray-400 w-4">#{index + 1}</span>
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{ backgroundColor: item.categoryColor }}
                      title={item.categoryName}
                    >
                      {item.type === 'fixed' ? '🏠' : ''}
                    </div>
                    <span className="text-sm text-gray-700 font-medium truncate">
                      {item.categoryName}
                      {item.type === 'fixed' && (
                        <span className="text-xs text-gray-500 ml-1">(固定費)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          item.type === 'fixed'
                            ? 'bg-gray-500'
                            : item.isOverBudget 
                              ? 'bg-red-500' 
                              : item.utilizationRate >= 80 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(item.utilizationRate, 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium w-10 text-right ${
                      item.type === 'fixed' 
                        ? 'text-gray-600'
                        : item.isOverBudget 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                    }`}>
                      {item.type === 'fixed' ? '固定' : `${Math.round(item.utilizationRate)}%`}
                    </span>
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>
      )}
    </div>
  )
}