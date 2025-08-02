'use client'

import { useState, useEffect } from 'react'
import { Transaction } from '../../types'
import { fetchTransactions } from '../../lib/api'
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, BanknotesIcon } from '@heroicons/react/24/outline'

interface MonthlyIncomeData {
  month: string
  income: number
  transactionCount: number
  averagePerTransaction: number
}

export default function IncomeTrendAnalysis() {
  const [monthlyData, setMonthlyData] = useState<MonthlyIncomeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIncomeData()
  }, [])

  const loadIncomeData = async () => {
    try {
      setLoading(true)
      const transactions = await fetchTransactions()

      const now = new Date()
      const monthlyMap = new Map<string, MonthlyIncomeData>()

      // 過去3ヶ月のデータを初期化
      for (let i = 2; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthlyMap.set(monthKey, {
          month: monthKey,
          income: 0,
          transactionCount: 0,
          averagePerTransaction: 0
        })
      }

      // 収入データを月別に集計（すべての収入取引を含む）
      transactions
        .filter(t => t.type === 'income')
        .forEach(transaction => {
          const date = new Date(transaction.date)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          
          if (monthlyMap.has(monthKey)) {
            const data = monthlyMap.get(monthKey)!
            data.income += transaction.amount
            data.transactionCount += 1
          }
        })

      // 平均金額を計算
      monthlyMap.forEach(data => {
        data.averagePerTransaction = data.transactionCount > 0 ? data.income / data.transactionCount : 0
      })

      // 最新月が上に来るように逆順でソート
      const sortedData = Array.from(monthlyMap.values()).reverse()
      setMonthlyData(sortedData)
    } catch (error) {
      console.error('収入データの取得に失敗しました:', error)
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
    const current = monthlyData[0].income  // 現在月（最新）
    const previous = monthlyData[1].income // 前月
    
    if (previous === 0) return { trend: 'stable', percentage: 0 }
    
    const percentage = ((current - previous) / previous) * 100
    
    if (percentage > 5) return { trend: 'up', percentage }
    if (percentage < -5) return { trend: 'down', percentage }
    return { trend: 'stable', percentage }
  }

  const trend = calculateTrend()
  const averageIncome = monthlyData.length > 0 
    ? monthlyData.reduce((sum, data) => sum + data.income, 0) / monthlyData.length 
    : 0

  const totalIncome = monthlyData.reduce((sum, data) => sum + data.income, 0)
  const maxIncome = Math.max(...monthlyData.map(d => d.income), 0)

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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">収入トレンド分析</h3>
        <BanknotesIcon className="w-6 h-6 text-green-500" />
      </div>

      {/* 収入サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">月平均収入</p>
              <p className="text-xl font-bold text-green-900 dark:text-green-100">{formatCurrency(averageIncome)}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-4 ${
          trend.trend === 'up' ? 'bg-green-50 dark:bg-green-900' : trend.trend === 'down' ? 'bg-red-50 dark:bg-red-900' : 'bg-gray-50 dark:bg-gray-700'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                trend.trend === 'up' ? 'text-green-600 dark:text-green-400' : trend.trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
              }`}>
                前月比
              </p>
              <div className="flex items-center space-x-1">
                {trend.trend === 'up' && <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />}
                {trend.trend === 'down' && <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />}
                <p className={`text-xl font-bold ${
                  trend.trend === 'up' ? 'text-green-900 dark:text-green-100' : trend.trend === 'down' ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {trend.percentage > 0 ? '+' : ''}{trend.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">3ヶ月合計</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 月別収入グラフ */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">月別収入推移</h4>
        {monthlyData.map((data) => (
          <div key={data.month} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{formatMonth(data.month)}</span>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">{formatCurrency(data.income)}</div>
                {data.transactionCount > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {data.transactionCount}件 (平均: {formatCurrency(data.averagePerTransaction)})
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
                style={{ width: `${maxIncome > 0 ? (data.income / maxIncome) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 収入の安定性分析 */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">収入の安定性</h4>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          {(() => {
            const incomes = monthlyData.map(d => d.income).filter(i => i > 0)
            if (incomes.length === 0) {
              return <p className="text-sm text-gray-600 dark:text-gray-400">収入データが不足しています</p>
            }

            const average = incomes.reduce((sum, income) => sum + income, 0) / incomes.length
            const variance = incomes.reduce((sum, income) => sum + Math.pow(income - average, 2), 0) / incomes.length
            const standardDeviation = Math.sqrt(variance)
            const coefficientOfVariation = average > 0 ? (standardDeviation / average) * 100 : 0

            let stabilityLevel = '安定'
            let stabilityColor = 'text-green-600 dark:text-green-400'
            
            if (coefficientOfVariation > 30) {
              stabilityLevel = '不安定'
              stabilityColor = 'text-red-600 dark:text-red-400'
            } else if (coefficientOfVariation > 15) {
              stabilityLevel = 'やや不安定'
              stabilityColor = 'text-yellow-600 dark:text-yellow-400'
            }

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">収入の安定性</span>
                  <span className={`text-sm font-medium ${stabilityColor}`}>{stabilityLevel}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  変動係数: {coefficientOfVariation.toFixed(1)}% 
                  {coefficientOfVariation < 15 && ' (安定した収入です)'}
                  {coefficientOfVariation >= 15 && coefficientOfVariation <= 30 && ' (やや変動があります)'}
                  {coefficientOfVariation > 30 && ' (収入の変動が大きいです)'}
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}