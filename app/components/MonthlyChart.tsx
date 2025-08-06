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
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-lg">月別収支推移</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">({selectedYear}年)</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="text-sm border-0 bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
          <select
            value={selectedMonth || ''}
            onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
            className="text-sm border-0 bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <option value="">全月表示</option>
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
            <h5 className="font-medium text-gray-900 dark:text-white">{selectedYear}年{selectedMonth}月</h5>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-green-50 dark:bg-green-900 p-3 rounded">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">収入</p>
              <p className="text-sm font-bold text-green-700 dark:text-green-300">
                {formatCompactAmount(selectedMonthData.totalIncome)}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900 p-3 rounded">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">支出</p>
              <p className="text-sm font-bold text-red-700 dark:text-red-300">
                {formatCompactAmount(selectedMonthData.totalExpense)}
              </p>
            </div>
            <div className={`p-3 rounded ${selectedMonthData.balance >= 0 ? 'bg-blue-50 dark:bg-blue-900' : 'bg-orange-50 dark:bg-orange-900'}`}>
              <p className={`text-xs font-medium ${selectedMonthData.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                収支
              </p>
              <p className={`text-sm font-bold ${selectedMonthData.balance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
                {formatCompactAmount(selectedMonthData.balance)}
              </p>
            </div>
          </div>

          {/* 詳細情報 */}
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>収入:</span>
              <span className="font-medium">{formatAmount(selectedMonthData.totalIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span>支出:</span>
              <span className="font-medium">{formatAmount(selectedMonthData.totalExpense)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-1">
              <span>収支:</span>
              <span className={`font-medium ${selectedMonthData.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatAmount(selectedMonthData.balance)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // 年間表示（おしゃれなカード形式）
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">まだデータがありません</p>
            </div>
          ) : (
            <>
              <div className={`grid gap-3 ${showAll ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
                {(showAll ? data : data.slice(0, 8)).map((item) => (
                  <div 
                    key={item.month} 
                    className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500"
                    onClick={() => setSelectedMonth(item.month)}
                  >
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg mx-auto group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300">
                        <span className="text-white text-xs font-bold">{item.month}</span>
                      </div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{getMonthName(item.month)}</p>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">収支</p>
                        <p className={`text-sm font-bold ${item.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCompactAmount(item.balance)}
                        </p>
                      </div>
                      {/* 収入・支出のミニ表示 */}
                      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 pt-1 border-t border-gray-200 dark:border-gray-600">
                        <span className="text-green-500">↑{formatCompactAmount(item.totalIncome)}</span>
                        <span className="text-red-500">↓{formatCompactAmount(item.totalExpense)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {data.length > 8 && !showAll && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    すべて表示
                  </button>
                </div>
              )}
              
              {showAll && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAll(false)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
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