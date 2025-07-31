'use client'

import { useState, useEffect } from 'react'
import { BudgetAnalysis } from '../../types'
import { fetchBudgetAnalysis } from '../../lib/api'
import { CurrencyDollarIcon, CalendarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface BudgetOverviewProps {
  currentMonth?: Date
}

export default function BudgetOverview({ currentMonth }: BudgetOverviewProps) {
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBudgetAnalysis()
  }, [currentMonth])

  const loadBudgetAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)
      // currentMonthが指定されている場合はその月のデータを取得、なければ現在の月
      const targetDate = currentMonth || new Date()
      const year = targetDate.getFullYear()
      const month = targetDate.getMonth() + 1
      
      const data = await fetchBudgetAnalysis(year, month)
      setAnalysis(data)
      
      // 月次予算もカテゴリ別予算も設定されていない場合のみエラーメッセージを表示
      if (data.monthlyBudget === 0) {
        setError('予算が設定されていません')
      }
    } catch (error: any) {
      setError('予算データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  const getBudgetColor = (remainingBudget: number, monthlyBudget: number) => {
    if (remainingBudget < 0) return 'text-red-600'
    const percentage = (remainingBudget / monthlyBudget) * 100
    if (percentage < 10) return 'text-red-600'
    if (percentage < 20) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getBudgetBgColor = (remainingBudget: number, monthlyBudget: number) => {
    if (remainingBudget < 0) return 'bg-red-50 dark:bg-red-900'
    const percentage = (remainingBudget / monthlyBudget) * 100
    if (percentage < 10) return 'bg-red-50 dark:bg-red-900'
    if (percentage < 20) return 'bg-yellow-50 dark:bg-yellow-900'
    return 'bg-green-50 dark:bg-green-900'
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (!analysis) return null

  const progressPercentage = Math.min((analysis.budgetUtilization || 0), 100)
  const remainingPercentage = Math.max(100 - progressPercentage, 0)

  return (
    <div className={`card ${getBudgetBgColor(analysis.remainingBudget, analysis.monthlyBudget)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <CurrencyDollarIcon className="w-5 h-5 mr-2" />
          今月の予算
        </h3>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <CalendarIcon className="w-4 h-4 mr-1" />
          {analysis.year}年{analysis.month}月
        </div>
      </div>

      <div className="space-y-4">
        {/* 残り予算 */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${getBudgetColor(analysis.remainingBudget, analysis.monthlyBudget)} dark:${getBudgetColor(analysis.remainingBudget, analysis.monthlyBudget).replace('600', '400')}`}>
            {formatAmount(analysis.remainingBudget)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">残り使用可能金額</div>
        </div>

        {/* 予算進捗バー */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>使用済み</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                progressPercentage > 90 ? 'bg-red-500' :
                progressPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* 詳細情報 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-400">月次予算</div>
            <div className="font-semibold text-gray-900 dark:text-white">{formatAmount(analysis.monthlyBudget)}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">固定費</div>
            <div className="font-semibold text-gray-900 dark:text-white">{formatAmount(analysis.totalFixedExpenses)}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">今月の支出</div>
            <div className="font-semibold text-gray-900 dark:text-white">{formatAmount(analysis.currentSpending)}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">1日あたり</div>
            <div className="font-semibold text-gray-900 dark:text-white">{formatAmount(analysis.dailyAverage)}</div>
          </div>
        </div>

        {/* 残り日数 */}
        {analysis.daysRemaining > 0 && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            今月残り {analysis.daysRemaining} 日
          </div>
        )}
      </div>
    </div>
  )
}