'use client'

import { useState, useEffect } from 'react'
import { Transaction, Category, FixedExpense } from '../../types'
import { fetchTransactions, fetchCategories, fetchFixedExpenses } from '../../lib/api'
import { ChartPieIcon, TrendingUpIcon, TrendingDownIcon } from '@heroicons/react/24/outline'

interface CategorySpendingData {
  categoryId: number
  categoryName: string
  categoryColor: string
  currentMonth: number
  previousMonth: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  transactionCount: number
  averagePerTransaction: number
  percentage: number
}

export default function CategoryAnalysis() {
  const [categoryData, setCategoryData] = useState<CategorySpendingData[]>([])
  const [fixedExpensesTotal, setFixedExpensesTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [totalSpending, setTotalSpending] = useState(0)

  useEffect(() => {
    loadCategoryData()
  }, [])

  const loadCategoryData = async () => {
    try {
      setLoading(true)
      const [transactions, categories, fixedExpenses] = await Promise.all([
        fetchTransactions(),
        fetchCategories(),
        fetchFixedExpenses()
      ])

      const now = new Date()
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      const previousNextMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // 固定費合計を計算
      const activeFixedExpenses = fixedExpenses.filter(fe => fe.isActive)
      const fixedTotal = activeFixedExpenses.reduce((sum, fe) => sum + fe.amount, 0)
      setFixedExpensesTotal(fixedTotal)

      // カテゴリ別支出を集計
      const categoryMap = new Map<number, CategorySpendingData>()
      
      // カテゴリを初期化
      categories.forEach(category => {
        categoryMap.set(category.id, {
          categoryId: category.id,
          categoryName: category.name,
          categoryColor: category.color,
          currentMonth: 0,
          previousMonth: 0,
          trend: 'stable',
          trendPercentage: 0,
          transactionCount: 0,
          averagePerTransaction: 0,
          percentage: 0
        })
      })

      // 取引データを集計
      transactions
        .filter(t => t.type === 'expense' && t.categoryId)
        .forEach(transaction => {
          const transactionDate = new Date(transaction.date)
          const data = categoryMap.get(transaction.categoryId!)
          
          if (data) {
            // 今月のデータ
            if (transactionDate >= currentMonth && transactionDate < nextMonth) {
              data.currentMonth += transaction.amount
              data.transactionCount += 1
            }
            
            // 先月のデータ
            if (transactionDate >= previousMonth && transactionDate < previousNextMonth) {
              data.previousMonth += transaction.amount
            }
          }
        })

      // トレンドと平均を計算
      let totalCurrentSpending = fixedTotal
      categoryMap.forEach(data => {
        totalCurrentSpending += data.currentMonth
        
        // 平均取引金額
        data.averagePerTransaction = data.transactionCount > 0 
          ? data.currentMonth / data.transactionCount 
          : 0

        // トレンド計算
        if (data.previousMonth > 0) {
          const percentage = ((data.currentMonth - data.previousMonth) / data.previousMonth) * 100
          data.trendPercentage = percentage
          
          if (percentage > 5) {
            data.trend = 'up'
          } else if (percentage < -5) {
            data.trend = 'down'
          } else {
            data.trend = 'stable'
          }
        }
      })

      setTotalSpending(totalCurrentSpending)

      // パーセンテージを計算
      categoryMap.forEach(data => {
        data.percentage = totalCurrentSpending > 0 
          ? (data.currentMonth / totalCurrentSpending) * 100 
          : 0
      })

      // データをソート（支出額の多い順）
      const sortedData = Array.from(categoryMap.values())
        .filter(data => data.currentMonth > 0 || data.previousMonth > 0)
        .sort((a, b) => b.currentMonth - a.currentMonth)

      setCategoryData(sortedData)
    } catch (error) {
      console.error('カテゴリ分析データの取得に失敗しました:', error)
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

  const getTopCategories = () => categoryData.slice(0, 5)
  const getGrowingCategories = () => categoryData
    .filter(data => data.trend === 'up')
    .sort((a, b) => b.trendPercentage - a.trendPercentage)
    .slice(0, 3)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* カテゴリ別支出ランキング */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <ChartPieIcon className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">カテゴリ別支出ランキング</h3>
        </div>

        <div className="space-y-4">
          {/* 固定費を最初に表示 */}
          {fixedExpensesTotal > 0 && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🏠</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">固定費</h4>
                  <p className="text-sm text-gray-500">
                    {((fixedExpensesTotal / totalSpending) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{formatCurrency(fixedExpensesTotal)}</div>
                <div className="text-sm text-gray-500">固定</div>
              </div>
            </div>
          )}

          {getTopCategories().map((data, index) => (
            <div key={data.categoryId} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-400 w-6">#{index + 1}</span>
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: data.categoryColor }}
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{data.categoryName}</h4>
                  <p className="text-sm text-gray-500">
                    {data.percentage.toFixed(1)}% • {data.transactionCount}件
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{formatCurrency(data.currentMonth)}</div>
                <div className="flex items-center space-x-1">
                  {data.trend === 'up' && <TrendingUpIcon className="w-3 h-3 text-red-500" />}
                  {data.trend === 'down' && <TrendingDownIcon className="w-3 h-3 text-green-500" />}
                  <span className={`text-xs ${
                    data.trend === 'up' ? 'text-red-600' : 
                    data.trend === 'down' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {data.trend === 'stable' ? '変化なし' : 
                     `${data.trendPercentage > 0 ? '+' : ''}${data.trendPercentage.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 支出増加カテゴリ */}
      {getGrowingCategories().length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUpIcon className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">支出増加カテゴリ</h3>
          </div>

          <div className="space-y-3">
            {getGrowingCategories().map((data) => (
              <div key={data.categoryId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: data.categoryColor }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{data.categoryName}</h4>
                    <p className="text-sm text-gray-500">
                      前月: {formatCurrency(data.previousMonth)} → 今月: {formatCurrency(data.currentMonth)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <TrendingUpIcon className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-red-600">
                      +{data.trendPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    +{formatCurrency(data.currentMonth - data.previousMonth)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* カテゴリ別詳細分析 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">カテゴリ別詳細分析</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">カテゴリ</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">今月支出</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">前月比</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">取引数</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">平均単価</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((data) => (
                <tr key={data.categoryId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: data.categoryColor }}
                      />
                      <span className="text-sm font-medium text-gray-900">{data.categoryName}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-gray-900">
                    {formatCurrency(data.currentMonth)}
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end space-x-1">
                      {data.trend === 'up' && <TrendingUpIcon className="w-3 h-3 text-red-500" />}
                      {data.trend === 'down' && <TrendingDownIcon className="w-3 h-3 text-green-500" />}
                      <span className={`text-xs ${
                        data.trend === 'up' ? 'text-red-600' : 
                        data.trend === 'down' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {data.trend === 'stable' ? '±0%' : 
                         `${data.trendPercentage > 0 ? '+' : ''}${data.trendPercentage.toFixed(1)}%`}
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-gray-600">
                    {data.transactionCount}件
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-gray-600">
                    {data.averagePerTransaction > 0 ? formatCurrency(data.averagePerTransaction) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}