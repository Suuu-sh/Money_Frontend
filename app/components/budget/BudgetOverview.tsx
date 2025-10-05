'use client'

import { useState, useEffect, useCallback } from 'react'
import { BudgetAnalysis, CategoryBudget } from '../../types'
import { fetchBudgetAnalysis, fetchCategoryBudgets } from '../../lib/api'
import { CurrencyDollarIcon, CalendarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface BudgetOverviewProps {
  currentMonth?: Date
}

// 月次予算のサマリーを取得し、進捗や残額を表示
export default function BudgetOverview({ currentMonth }: BudgetOverviewProps) {
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBudgetAnalysis = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // currentMonthが指定されている場合はその月のデータを取得、なければ現在の月
      const targetDate = currentMonth || new Date()
      const year = targetDate.getFullYear()
      const month = targetDate.getMonth() + 1
      
      let data = await fetchBudgetAnalysis(year, month)

      // カテゴリ別予算の合計を常に確認し、APIのmonthlyBudgetより大きければ優先採用
      try {
        const catBudgets: CategoryBudget[] = await fetchCategoryBudgets(year, month)
        const catTotal = (catBudgets || []).reduce((sum, b) => sum + (b.amount || 0), 0)

        // フルフォールバック（API 0 or 未定義）
        if (!data || (data.monthlyBudget ?? 0) <= 0) {
          if (catTotal > 0) {
            const spend = data?.currentSpending || 0
            const remaining = catTotal - spend
            const utilization = catTotal > 0 ? (spend / catTotal) * 100 : 0
            data = {
              year,
              month,
              monthlyBudget: catTotal,
              totalFixedExpenses: data?.totalFixedExpenses || 0,
              currentSpending: spend,
              remainingBudget: remaining,
              budgetUtilization: utilization,
              daysRemaining: data?.daysRemaining || 0,
              dailyAverage: data?.dailyAverage || 0,
            }
          }
        } else if (catTotal > (data.monthlyBudget || 0)) {
          // 上書き（APIの値が小さすぎる場合）
          const spend = data.currentSpending || 0
          const remaining = catTotal - spend
          const utilization = catTotal > 0 ? (spend / catTotal) * 100 : 0
          data = {
            ...data,
            monthlyBudget: catTotal,
            remainingBudget: remaining,
            budgetUtilization: utilization,
          }
        }
      } catch (e) {
        // カテゴリ別予算取得エラー時は何もしない
      }

      setAnalysis(data)
      
      if (!data || data.monthlyBudget <= 0) {
        setError('予算が設定されていません')
      }
    } catch (error: any) {
      setError('予算データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [currentMonth])

  useEffect(() => {
    loadBudgetAnalysis()
  }, [loadBudgetAnalysis])

  const formatAmount = (amount: number) => {
    // 数値の精度問題を回避するため、整数に丸める
    const roundedAmount = Math.round(amount)
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(roundedAmount)
  }

  // 表示色は「使用率」を基準に統一（残額比ではなく）
  const getBudgetColor = (utilization: number) => {
    if (utilization >= 100) return 'text-red-600'
    if (utilization >= 90) return 'text-red-600'
    if (utilization >= 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getBudgetBgColor = (utilization: number) => {
    if (utilization >= 100) return 'bg-red-50 dark:bg-red-900'
    if (utilization >= 90) return 'bg-red-50 dark:bg-red-900'
    if (utilization >= 80) return 'bg-yellow-50 dark:bg-yellow-900'
    return 'bg-green-50 dark:bg-green-900'
  }

  const getMonthName = (month: number) => {
    const monthNames = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ]
    return monthNames[month - 1] || `${month}月`
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

  const utilization = Math.max(0, analysis.budgetUtilization || 0)
  const progressPercentage = Math.min(utilization, 100)
  const remainingPercentage = Math.max(100 - utilization, 0)

  return (
    <div className={`card ${getBudgetBgColor(utilization)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <CurrencyDollarIcon className="w-5 h-5 mr-2" />
          {getMonthName(analysis.month)}の予算
        </h3>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <CalendarIcon className="w-4 h-4 mr-1" />
          {analysis.year}年{analysis.month}月
        </div>
      </div>

      <div className="space-y-4">
        {/* 残り予算 */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${getBudgetColor(utilization)} dark:${getBudgetColor(utilization).replace('600', '400')}`}>
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
            <div className="text-gray-600 dark:text-gray-400">{getMonthName(analysis.month)}の支出</div>
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
            {getMonthName(analysis.month)}残り {analysis.daysRemaining} 日
          </div>
        )}
      </div>
    </div>
  )
}
