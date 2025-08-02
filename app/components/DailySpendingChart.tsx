'use client'

import { useState, useEffect } from 'react'
import { fetchTransactions } from '../lib/api'
import { Transaction } from '../types'

interface DailySpending {
  date: string
  amount: number
  day: number
}

export default function DailySpendingChart() {
  const [dailySpending, setDailySpending] = useState<DailySpending[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDailySpending()
  }, [])

  const loadDailySpending = async () => {
    try {
      setLoading(true)
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      
      const transactions = await fetchTransactions()
      
      // 今月の支出取引のみをフィルタリング
      const currentMonthExpenses = transactions.filter((transaction: Transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate.getFullYear() === year &&
               transactionDate.getMonth() + 1 === month &&
               transaction.amount < 0 // 支出のみ
      })

      // 日毎にグループ化
      const dailyData: { [key: number]: number } = {}
      currentMonthExpenses.forEach((transaction: Transaction) => {
        const day = new Date(transaction.date).getDate()
        dailyData[day] = (dailyData[day] || 0) + Math.abs(transaction.amount)
      })

      // 今月の日数を取得
      const daysInMonth = new Date(year, month, 0).getDate()
      const dailySpendingData: DailySpending[] = []

      for (let day = 1; day <= daysInMonth; day++) {
        dailySpendingData.push({
          date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
          amount: dailyData[day] || 0,
          day
        })
      }

      setDailySpending(dailySpendingData)
    } catch (error) {
      console.error('日毎支出データの取得に失敗しました:', error)
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

  const maxAmount = Math.max(...dailySpending.map(d => d.amount))

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">日毎の支出</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">日毎の支出</h3>
      
      <div className="space-y-2">
        {dailySpending.map((data) => (
          <div key={data.date} className="flex items-center space-x-3">
            <div className="w-8 text-xs text-gray-500 dark:text-gray-400 text-right">
              {data.day}日
            </div>
            <div className="flex-1 relative">
              <div className="bg-gray-100 dark:bg-gray-700 rounded h-6 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded transition-all duration-500 ease-out flex items-center justify-end pr-2"
                  style={{ width: maxAmount > 0 ? `${(data.amount / maxAmount) * 100}%` : '0%' }}
                >
                  {data.amount > 0 && (
                    <span className="text-xs text-white font-medium">
                      {formatCurrency(data.amount)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {dailySpending.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">今月の支出データがありません</p>
        </div>
      )}
    </div>
  )
}