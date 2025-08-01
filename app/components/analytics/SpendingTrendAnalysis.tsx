'use client'

import { useState, useEffect } from 'react'
import { Transaction, FixedExpense } from '../../types'
import { fetchTransactions, fetchFixedExpenses } from '../../lib/api'
import { 
  ArrowTrendingDownIcon, 
  ArrowTrendingUpIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline'

interface MonthlyData {
  month: string
  spending: number
  fixedExpenses: number
  variableExpenses: number
  transactionCount: number
}

export default function SpendingTrendAnalysis() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | '12months'>('6months')

  useEffect(() => {
    loadSpendingData()
  }, [selectedPeriod])

  const loadSpendingData = async () => {
    try {
      setLoading(true)
      const [transactions, fixedExpenses] = await Promise.all([
        fetchTransactions(),
        fetchFixedExpenses()
      ])

      const now = new Date()
      const months = selectedPeriod === '3months' ? 3 : selectedPeriod === '6months' ? 6 : 12
      const monthlyMap = new Map<string, MonthlyData>()

      // 過去N ヶ月のデータを初期化
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthlyMap.set(monthKey, {
          month: monthKey,
          spending: 0,
          fixedExpenses: 0,
          variableExpenses: 0,
          transactionCount: 0
        })
      }

      // 取引データを月別に集計（固定費から自動生成された取引は除外）
      transactions
        .filter(t => t.type === 'expense')
        .filter(t => !t.description?.startsWith('固定収支:') && !t.description?.startsWith('固定支出:'))
        .forEach(transaction => {
          const date = new Date(transaction.date)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          
          if (monthlyMap.has(monthKey)) {
            const data = monthlyMap.get(monthKey)!
            data.variableExpenses += transaction.amount
            data.spending += transaction.amount
            data.transactionCount += 1
          }
        })

      // 固定費を各月に追加
      const activeFixedExpenses = fixedExpenses.filter(fe => fe.isActive)
      const totalFixedExpenses = activeFixedExpenses.reduce((sum, fe) => sum + fe.amount, 0)
      
      monthlyMap.forEach(data => {
        data.fixedExpenses = totalFixedExpenses
        data.spending += totalFixedExpenses
      })

      // 最新月が上に来るように逆順でソート
      const sortedData = Array.from(monthlyMap.values()).reverse()
      setMonthlyData(sortedData)
    } catch (error) {
      console.error('支出データの取得に失敗しました:', error)
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

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-')
    return `${year}年${parseInt(month)}月`
  }

  const calculateTrend = () => {
    if (monthlyData.length < 2) return { trend: 'stable', percentage: 0 }
    
    // データが逆順になったので、最初の2つを取得（現在月と前月）
    const current = monthlyData[0].spending  // 現在月（最新）
    const previous = monthlyData[1].spending // 前月
    
    if (previous === 0) return { trend: 'stable', percentage: 0 }
    
    const percentage = ((current - previous) / previous) * 100
    
    if (percentage > 5) return { trend: 'up', percentage }
    if (percentage < -5) return { trend: 'down', percentage }
    return { trend: 'stable', percentage }
  }

  const trend = calculateTrend()
  const averageSpending = monthlyData.length > 0 
    ? monthlyData.reduce((sum, data) => sum + data.spending, 0) / monthlyData.length 
    : 0

  const maxSpending = Math.max(...monthlyData.map(d => d.spending), 0)

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">支出トレンド分析</h3>
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="3months">過去3ヶ月</option>
            <option value="6months">過去6ヶ月</option>
            <option value="12months">過去12ヶ月</option>
          </select>
        </div>
      </div>

      {/* トレンドサマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">月平均支出</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(averageSpending)}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-4 ${
          trend.trend === 'up' ? 'bg-red-50 dark:bg-red-900' : trend.trend === 'down' ? 'bg-green-50 dark:bg-green-900' : 'bg-gray-50 dark:bg-gray-700'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                trend.trend === 'up' ? 'text-red-600 dark:text-red-400' : trend.trend === 'down' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
              }`}>
                前月比
              </p>
              <div className="flex items-center space-x-1">
                {trend.trend === 'up' && <ArrowTrendingUpIcon className="w-5 h-5 text-red-500" />}
                {trend.trend === 'down' && <ArrowTrendingDownIcon className="w-5 h-5 text-green-500" />}
                <p className={`text-xl font-bold ${
                  trend.trend === 'up' ? 'text-red-900 dark:text-red-100' : trend.trend === 'down' ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {trend.percentage > 0 ? '+' : ''}{trend.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">最高支出月</p>
              <p className="text-xl font-bold text-orange-900 dark:text-orange-100">{formatCurrency(maxSpending)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 月別支出グラフ */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">月別支出推移</h4>
        {monthlyData.map((data) => (
          <div key={data.month} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{formatMonth(data.month)}</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(data.spending)}</span>
            </div>
            
            <div className="space-y-1">
              {/* 固定費バー */}
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gray-500"
                    style={{ width: `${maxSpending > 0 ? (data.fixedExpenses / maxSpending) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  固定費: {formatCurrency(data.fixedExpenses)}
                </span>
              </div>
              
              {/* 変動費バー */}
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${maxSpending > 0 ? (data.variableExpenses / maxSpending) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  変動費: {formatCurrency(data.variableExpenses)} ({data.transactionCount}件)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 凡例 */}
      <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">固定費</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">変動費</span>
        </div>
      </div>
    </div>
  )
}