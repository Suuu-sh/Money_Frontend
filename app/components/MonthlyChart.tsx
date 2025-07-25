'use client'

import { useState, useEffect } from 'react'
import { MonthlySummary } from '../types'
import { fetchMonthlySummary } from '../lib/api'

export default function MonthlyChart() {
  const [data, setData] = useState<MonthlySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadData()
  }, [selectedYear])

  const loadData = async () => {
    try {
      setLoading(true)
      const summaryData = await fetchMonthlySummary(selectedYear)
      setData(summaryData)
    } catch (error) {
      console.error('月別データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getMonthName = (month: number) => {
    return `${month}月`
  }

  const maxAmount = Math.max(
    ...data.map(item => Math.max(item.totalIncome, item.totalExpense))
  )

  if (loading) {
    return (
      <div className="card text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-medium text-gray-900">月別収支グラフ</h4>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="input-field w-auto"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
            <option key={year} value={year}>{year}年</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.month} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">{getMonthName(item.month)}</span>
              <div className="flex space-x-4">
                <span className="text-income-600">
                  収入: {formatAmount(item.totalIncome)}
                </span>
                <span className="text-expense-600">
                  支出: {formatAmount(item.totalExpense)}
                </span>
              </div>
            </div>
            
            <div className="relative">
              {/* 収入バー */}
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-income-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${maxAmount > 0 ? (item.totalIncome / maxAmount) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              {/* 支出バー */}
              <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-expense-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${maxAmount > 0 ? (item.totalExpense / maxAmount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`text-sm font-medium ${
                item.balance >= 0 ? 'text-income-600' : 'text-expense-600'
              }`}>
                収支: {formatAmount(item.balance)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}