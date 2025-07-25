'use client'

import { useState, useEffect } from 'react'
import { CategorySummary } from '../types'
import { fetchCategorySummary } from '../lib/api'

export default function Analytics() {
  const [expenseSummary, setExpenseSummary] = useState<CategorySummary[]>([])
  const [incomeSummary, setIncomeSummary] = useState<CategorySummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [expenseData, incomeData] = await Promise.all([
        fetchCategorySummary({ type: 'expense' }),
        fetchCategorySummary({ type: 'income' })
      ])
      setExpenseSummary(expenseData)
      setIncomeSummary(incomeData)
    } catch (error) {
      console.error('分析データ取得エラー:', error)
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
      </div>
    )
  }

  const totalExpense = expenseSummary.reduce((sum, item) => sum + item.totalAmount, 0)
  const totalIncome = incomeSummary.reduce((sum, item) => sum + item.totalAmount, 0)

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">📈 分析</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 支出分析 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💸 支出カテゴリ別</h3>
          {expenseSummary.length === 0 ? (
            <p className="text-gray-500 text-center py-8">支出データがありません</p>
          ) : (
            <div className="space-y-4">
              {expenseSummary.map((item) => (
                <div key={item.categoryId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: item.categoryColor }}
                      >
                        <span>{item.categoryIcon}</span>
                      </div>
                      <span className="font-medium">{item.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-expense-600">
                        {formatAmount(item.totalAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {totalExpense > 0 ? Math.round((item.totalAmount / totalExpense) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-expense-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${totalExpense > 0 ? (item.totalAmount / totalExpense) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 収入分析 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 収入カテゴリ別</h3>
          {incomeSummary.length === 0 ? (
            <p className="text-gray-500 text-center py-8">収入データがありません</p>
          ) : (
            <div className="space-y-4">
              {incomeSummary.map((item) => (
                <div key={item.categoryId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: item.categoryColor }}
                      >
                        <span>{item.categoryIcon}</span>
                      </div>
                      <span className="font-medium">{item.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-income-600">
                        {formatAmount(item.totalAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {totalIncome > 0 ? Math.round((item.totalAmount / totalIncome) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-income-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${totalIncome > 0 ? (item.totalAmount / totalIncome) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}