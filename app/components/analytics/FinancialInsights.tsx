'use client'

import { useState, useEffect } from 'react'
import { Transaction, FixedExpense } from '../../types'
import { fetchTransactions, fetchFixedExpenses } from '../../lib/api'
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface FinancialInsight {
  id: string
  type: 'positive' | 'warning' | 'info'
  title: string
  description: string
  value?: string
  trend?: 'up' | 'down' | 'stable'
  recommendation?: string
}

export default function FinancialInsights() {
  const [insights, setInsights] = useState<FinancialInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [financialHealth, setFinancialHealth] = useState<{
    score: number
    level: 'excellent' | 'good' | 'fair' | 'poor'
    factors: string[]
  }>({ score: 0, level: 'fair', factors: [] })

  useEffect(() => {
    generateInsights()
  }, [])

  const generateInsights = async () => {
    try {
      setLoading(true)
      const [transactions, fixedExpenses] = await Promise.all([
        fetchTransactions(),
        fetchFixedExpenses()
      ])

      const insights: FinancialInsight[] = []
      const now = new Date()
      
      // 過去6ヶ月のデータを分析
      const monthlyData = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.date)
          return tDate >= date && tDate < nextMonth
        })
        
        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        
        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
        
        const fixedExpensesTotal = fixedExpenses
          .filter(fe => fe.isActive)
          .reduce((sum, fe) => sum + fe.amount, 0)
        
        monthlyData.push({
          month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          income,
          expenses: expenses + fixedExpensesTotal,
          savings: income - (expenses + fixedExpensesTotal),
          transactionCount: monthTransactions.length
        })
      }

      // 1. 貯蓄率の分析
      const currentMonth = monthlyData[monthlyData.length - 1]
      if (currentMonth.income > 0) {
        const savingsRate = (currentMonth.savings / currentMonth.income) * 100
        
        if (savingsRate >= 20) {
          insights.push({
            id: 'savings-rate-excellent',
            type: 'positive',
            title: '優秀な貯蓄率',
            description: `今月の貯蓄率は${savingsRate.toFixed(1)}%です。理想的な貯蓄率を維持できています。`,
            value: `${savingsRate.toFixed(1)}%`,
            trend: 'up'
          })
        } else if (savingsRate >= 10) {
          insights.push({
            id: 'savings-rate-good',
            type: 'info',
            title: '良好な貯蓄率',
            description: `今月の貯蓄率は${savingsRate.toFixed(1)}%です。さらに向上の余地があります。`,
            value: `${savingsRate.toFixed(1)}%`,
            recommendation: '貯蓄率20%を目標に支出を見直してみましょう'
          })
        } else if (savingsRate >= 0) {
          insights.push({
            id: 'savings-rate-low',
            type: 'warning',
            title: '貯蓄率が低い',
            description: `今月の貯蓄率は${savingsRate.toFixed(1)}%です。支出の見直しが必要です。`,
            value: `${savingsRate.toFixed(1)}%`,
            recommendation: '固定費の削減や不要な支出の見直しを検討してください'
          })
        } else {
          insights.push({
            id: 'savings-rate-negative',
            type: 'warning',
            title: '支出が収入を上回っています',
            description: `今月は${Math.abs(currentMonth.savings).toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' })}の赤字です。`,
            recommendation: '緊急に支出の見直しが必要です'
          })
        }
      }

      // 2. 支出トレンドの分析
      if (monthlyData.length >= 2) {
        const recentMonths = monthlyData.slice(-2)
        const expenseChange = recentMonths[1].expenses - recentMonths[0].expenses
        const expenseChangePercent = recentMonths[0].expenses > 0 
          ? (expenseChange / recentMonths[0].expenses) * 100 
          : 0

        if (expenseChangePercent > 10) {
          insights.push({
            id: 'expense-increase',
            type: 'warning',
            title: '支出が大幅に増加',
            description: `前月比で支出が${expenseChangePercent.toFixed(1)}%増加しています。`,
            trend: 'up',
            recommendation: '支出の内訳を確認し、不要な出費を削減しましょう'
          })
        } else if (expenseChangePercent < -10) {
          insights.push({
            id: 'expense-decrease',
            type: 'positive',
            title: '支出の削減に成功',
            description: `前月比で支出が${Math.abs(expenseChangePercent).toFixed(1)}%削減されています。`,
            trend: 'down'
          })
        }
      }

      // 3. 固定費の分析
      const totalFixedExpenses = fixedExpenses
        .filter(fe => fe.isActive)
        .reduce((sum, fe) => sum + fe.amount, 0)
      
      if (currentMonth.income > 0) {
        const fixedExpenseRatio = (totalFixedExpenses / currentMonth.income) * 100
        
        if (fixedExpenseRatio > 50) {
          insights.push({
            id: 'fixed-expenses-high',
            type: 'warning',
            title: '固定費の割合が高い',
            description: `収入に対する固定費の割合が${fixedExpenseRatio.toFixed(1)}%です。`,
            value: `${fixedExpenseRatio.toFixed(1)}%`,
            recommendation: '固定費の見直しを検討してください（理想は30%以下）'
          })
        } else if (fixedExpenseRatio <= 30) {
          insights.push({
            id: 'fixed-expenses-good',
            type: 'positive',
            title: '固定費が適切',
            description: `収入に対する固定費の割合が${fixedExpenseRatio.toFixed(1)}%で理想的です。`,
            value: `${fixedExpenseRatio.toFixed(1)}%`
          })
        }
      }

      setInsights(insights)

      // 財務健全性スコアの計算
      let score = 50 // ベーススコア
      const factors = []

      if (currentMonth.income > 0) {
        const savingsRate = (currentMonth.savings / currentMonth.income) * 100
        if (savingsRate >= 20) {
          score += 25
          factors.push('優秀な貯蓄率')
        } else if (savingsRate >= 10) {
          score += 15
          factors.push('良好な貯蓄率')
        } else if (savingsRate < 0) {
          score -= 30
          factors.push('赤字状態')
        }

        const fixedExpenseRatio = (totalFixedExpenses / currentMonth.income) * 100
        if (fixedExpenseRatio <= 30) {
          score += 15
          factors.push('適切な固定費')
        } else if (fixedExpenseRatio > 50) {
          score -= 20
          factors.push('高い固定費')
        }
      }

      let level: 'excellent' | 'good' | 'fair' | 'poor' = 'fair'
      if (score >= 80) level = 'excellent'
      else if (score >= 65) level = 'good'
      else if (score < 40) level = 'poor'

      setFinancialHealth({ score, level, factors })

    } catch (error) {
      console.error('インサイト生成エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />
    }
  }

  const getHealthColor = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'text-green-600 bg-green-50'
      case 'good':
        return 'text-blue-600 bg-blue-50'
      case 'poor':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  const getHealthLabel = (level: string) => {
    switch (level) {
      case 'excellent':
        return '優秀'
      case 'good':
        return '良好'
      case 'poor':
        return '要改善'
      default:
        return '普通'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 財務健全性スコア */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">財務健全性スコア</h3>
          <ChartBarIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        </div>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{financialHealth.score}</div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(financialHealth.level)}`}>
            {getHealthLabel(financialHealth.level)}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-4">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"
            style={{ width: `${Math.min(financialHealth.score, 100)}%` }}
          />
        </div>
        
        {financialHealth.factors.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">評価要因:</p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {financialHealth.factors.map((factor, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* インサイト一覧 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">財務インサイト</h3>
        
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">分析に十分なデータがありません</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">取引データを追加してインサイトを確認しましょう</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'positive'
                    ? 'bg-green-50 dark:bg-green-900 border-green-400'
                    : insight.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-400'
                    : 'bg-blue-50 dark:bg-blue-900 border-blue-400'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{insight.title}</h4>
                      {insight.value && (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{insight.value}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{insight.description}</p>
                    {insight.recommendation && (
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 bg-opacity-50 p-2 rounded">
                        💡 {insight.recommendation}
                      </p>
                    )}
                  </div>
                  {insight.trend && (
                    <div className="flex-shrink-0">
                      {insight.trend === 'up' ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
    