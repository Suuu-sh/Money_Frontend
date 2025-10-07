'use client'

import { useState, useEffect, useCallback } from 'react'
import { BudgetAnalysis, CategoryBudget } from '../../types'
import { fetchBudgetAnalysis, fetchCategoryBudgets } from '../../lib/api'
import { CurrencyDollarIcon, CalendarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface BudgetOverviewProps {
  currentMonth?: Date
}

// Fetch and display the monthly budget overview (progress and remaining)
export default function BudgetOverview({ currentMonth }: BudgetOverviewProps) {
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBudgetAnalysis = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Use the supplied month or fallback to the current month
      const targetDate = currentMonth || new Date()
      const year = targetDate.getFullYear()
      const month = targetDate.getMonth() + 1
      
      let data = await fetchBudgetAnalysis(year, month)

      // Compare the per-category budget sum and prefer it when larger than the API value
      try {
        const catBudgets: CategoryBudget[] = await fetchCategoryBudgets(year, month)
        const catTotal = (catBudgets || []).reduce((sum, b) => sum + (b.amount || 0), 0)

        // Full fallback when the API returns 0 or undefined
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
          // Override when the API value is smaller than the category total
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
        // Ignore failures when fetching category-specific budgets
      }

      setAnalysis(data)
      
      if (!data || data.monthlyBudget <= 0) {
        setError('No budget has been configured for this month yet')
      }
    } catch (error: any) {
      setError('Failed to fetch the budget overview')
    } finally {
      setLoading(false)
    }
  }, [currentMonth])

  useEffect(() => {
    loadBudgetAnalysis()
  }, [loadBudgetAnalysis])

  const formatAmount = (amount: number) => {
    // Round to whole yen to avoid precision artefacts
    const roundedAmount = Math.round(amount)
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(roundedAmount)
  }

  // Colour coding is based on utilisation rather than remaining budget
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
        {/* Remaining budget */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${getBudgetColor(utilization)} dark:${getBudgetColor(utilization).replace('600', '400')}`}>
            {formatAmount(analysis.remainingBudget)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Remaining balance</div>
        </div>

        {/* Budget progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Used</span>
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

        {/* Detailed breakdown */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Monthly budget</div>
            <div className="font-semibold text-gray-900 dark:text-white">{formatAmount(analysis.monthlyBudget)}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Fixed expenses</div>
            <div className="font-semibold text-gray-900 dark:text-white">{formatAmount(analysis.totalFixedExpenses)}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Spending this month</div>
            <div className="font-semibold text-gray-900 dark:text-white">{formatAmount(analysis.currentSpending)}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">1日あたり</div>
            <div className="font-semibold text-gray-900 dark:text-white">{formatAmount(analysis.dailyAverage)}</div>
          </div>
        </div>

        {/* Days remaining */}
        {analysis.daysRemaining > 0 && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {getMonthName(analysis.month)}残り {analysis.daysRemaining} 日
          </div>
        )}
      </div>
    </div>
  )
}
