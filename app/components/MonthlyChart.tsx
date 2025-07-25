'use client'

import { useState, useEffect } from 'react'
import { MonthlySummary } from '../types'
import { fetchMonthlySummary } from '../lib/api'

export default function MonthlyChart() {
  const [data, setData] = useState<MonthlySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)

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

  const formatCompactAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `¥${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `¥${(amount / 1000).toFixed(0)}K`
    }
    return `¥${amount.toLocaleString()}`
  }

  const getMonthName = (month: number) => {
    return `${month}月`
  }

  // フィルタリングされたデータ
  const filteredData = selectedMonth 
    ? data.filter(item => item.month === selectedMonth)
    : data

  const selectedMonthData = selectedMonth ? data.find(item => item.month === selectedMonth) : null

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h4 className="font-medium text-gray-900 text-sm">収支データ</h4>
        <div className="flex space-x-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
          <select
            value={selectedMonth || ''}
            onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">全月</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>{month}月</option>
            ))}
          </select>
        </div>
      </div>

      {selectedMonthData ? (
        // 単月表示
        <div className="space-y-3">
          <div className="text-center">
            <h5 className="font-medium text-gray-900">{selectedYear}年{selectedMonth}月</h5>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-green-50 p-3 rounded">
              <p className="text-xs text-green-600 font-medium">収入</p>
              <p className="text-sm font-bold text-green-700">
                {formatCompactAmount(selectedMonthData.totalIncome)}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <p className="text-xs text-red-600 font-medium">支出</p>
              <p className="text-sm font-bold text-red-700">
                {formatCompactAmount(selectedMonthData.totalExpense)}
              </p>
            </div>
            <div className={`p-3 rounded ${selectedMonthData.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <p className={`text-xs font-medium ${selectedMonthData.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                収支
              </p>
              <p className={`text-sm font-bold ${selectedMonthData.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {formatCompactAmount(selectedMonthData.balance)}
              </p>
            </div>
          </div>

          {/* 詳細情報 */}
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>収入:</span>
              <span className="font-medium">{formatAmount(selectedMonthData.totalIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span>支出:</span>
              <span className="font-medium">{formatAmount(selectedMonthData.totalExpense)}</span>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span>収支:</span>
              <span className={`font-medium ${selectedMonthData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(selectedMonthData.balance)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // 年間表示（コンパクト）
        <div className="space-y-2">
          {data.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">データがありません</p>
          ) : (
            <>
              <div className={`grid gap-2 ${showAll ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'}`}>
                {(showAll ? data : data.slice(0, 6)).map((item) => (
                  <div 
                    key={item.month} 
                    className="bg-gray-50 p-2 rounded text-center cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setSelectedMonth(item.month)}
                  >
                    <p className="text-xs font-medium text-gray-700">{getMonthName(item.month)}</p>
                    <p className={`text-xs font-bold ${item.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCompactAmount(item.balance)}
                    </p>
                  </div>
                ))}
              </div>
              
              {data.length > 6 && !showAll && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="text-xs text-primary-600 hover:text-primary-700 underline"
                  >
                    すべて表示
                  </button>
                </div>
              )}
              
              {showAll && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAll(false)}
                    className="text-xs text-primary-600 hover:text-primary-700 underline"
                  >
                    折りたたむ
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}