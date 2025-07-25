'use client'

import { useState, useEffect } from 'react'
import { CategoryBudgetAnalysis } from '../../types'
import { fetchCategoryBudgetAnalysis } from '../../lib/api'
import { ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function CategoryBudgetOverview() {
  const [analysis, setAnalysis] = useState<CategoryBudgetAnalysis[]>([])
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

      const data = await fetchCategoryBudgetAnalysis(year, month)
      setAnalysis(data)
    } catch (error) {
      console.error('カテゴリ別予算分析の取得に失敗しました:', error)
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
  const totalSpent = analysis.reduce((sum, item) => sum + item.spentAmount, 0)
  const totalRemaining = analysis.reduce((sum, item) => sum + item.remainingAmount, 0)
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
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">カテゴリ別予算概要</h2>
      
      {/* サマリー統計 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">総予算</p>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalBudget)}</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-orange-600 font-medium">使用済み</p>
          <p className="text-2xl font-bold text-orange-900">{formatCurrency(totalSpent)}</p>
        </div>
        
        <div className={`p-4 rounded-lg ${totalRemaining >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`text-sm font-medium ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            残り予算
          </p>
          <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            {formatCurrency(totalRemaining)}
          </p>
        </div>
      </div>

      {/* アラート */}
      {(overBudgetCategories.length > 0 || warningCategories.length > 0) && (
        <div className="space-y-3 mb-6">
          {overBudgetCategories.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <h3 className="font-medium text-red-800">予算超過</h3>
              </div>
              <div className="space-y-1">
                {overBudgetCategories.map((item) => (
                  <p key={item.categoryId} className="text-sm text-red-700">
                    {item.categoryIcon} {item.categoryName}: {formatCurrency(Math.abs(item.remainingAmount))}超過
                  </p>
                ))}
              </div>
            </div>
          )}

          {warningCategories.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-800">予算残り僅か</h3>
              </div>
              <div className="space-y-1">
                {warningCategories.map((item) => (
                  <p key={item.categoryId} className="text-sm text-yellow-700">
                    {item.categoryIcon} {item.categoryName}: {Math.round(item.utilizationRate)}%使用済み
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* トップカテゴリ */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">使用率の高いカテゴリ</h3>
        <div className="space-y-2">
          {analysis
            .sort((a, b) => b.utilizationRate - a.utilizationRate)
            .slice(0, 5)
            .map((item) => (
              <div key={item.categoryId} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: item.categoryColor }}
                  >
                    {item.categoryIcon}
                  </div>
                  <span className="text-sm text-gray-700">{item.categoryName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.isOverBudget 
                          ? 'bg-red-500' 
                          : item.utilizationRate >= 80 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(item.utilizationRate, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {Math.round(item.utilizationRate)}%
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}