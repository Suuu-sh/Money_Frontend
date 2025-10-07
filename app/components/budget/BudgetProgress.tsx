'use client'

import { BudgetAnalysis } from '../../types'

interface BudgetProgressProps {
  analysis: BudgetAnalysis
}

// Render budget consumption progress and remaining balance summary
export default function BudgetProgress({ analysis }: BudgetProgressProps) {
  const formatAmount = (amount: number) => {
    // Round to whole yen for consistent formatting
    const roundedAmount = Math.round(amount)
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(roundedAmount)
  }

  const progressPercentage = Math.min((analysis.budgetUtilization || 0), 100)
  
  const getProgressColor = () => {
    if (progressPercentage > 90) return 'bg-red-500'
    if (progressPercentage > 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getTextColor = () => {
    if (analysis.remainingBudget < 0) return 'text-red-600'
    const percentage = (analysis.remainingBudget / analysis.monthlyBudget) * 100
    if (percentage < 10) return 'text-red-600'
    if (percentage < 20) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-4">
      {/* Main progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Budget usage</span>
          <span className={`text-sm font-semibold ${getTextColor()}`}>
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>¥0</span>
          <span>{formatAmount(analysis.monthlyBudget)}</span>
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className="space-y-3">
        {/* Fixed expenses */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600">固定費</span>
          </div>
          <span className="text-sm font-medium">{formatAmount(analysis.totalFixedExpenses)}</span>
        </div>

        {/* Variable spending (this month) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              analysis.currentSpending > (analysis.monthlyBudget - analysis.totalFixedExpenses) * 0.8 
                ? 'bg-red-400' : 'bg-blue-400'
            }`}></div>
            <span className="text-sm text-gray-600">変動費</span>
          </div>
          <span className="text-sm font-medium">{formatAmount(analysis.currentSpending)}</span>
        </div>

        {/* Remaining budget */}
        <div className="flex items-center justify-between border-t pt-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              analysis.remainingBudget > 0 ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className="text-sm font-semibold text-gray-700">残り予算</span>
          </div>
          <span className={`text-sm font-bold ${getTextColor()}`}>
            {formatAmount(analysis.remainingBudget)}
          </span>
        </div>
      </div>

      {/* Allowance per remaining day */}
      {analysis.daysRemaining > 0 && analysis.remainingBudget > 0 && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {formatAmount(analysis.dailyAverage)}
            </div>
            <div className="text-xs text-blue-500">
              Daily allowance (remaining {analysis.daysRemaining} days)
            </div>
          </div>
        </div>
      )}

      {/* Budget overrun warnings withheld per current spec */}
    </div>
  )
}
