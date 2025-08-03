'use client'

import { useState, useEffect } from 'react'
import { fetchTransactions, fetchFixedExpenses } from '../lib/api'
import { Transaction, FixedExpense } from '../types'

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
      
      const [transactions, fixedExpenses] = await Promise.all([
        fetchTransactions(),
        fetchFixedExpenses()
      ])
      
      // アクティブな固定支出の名前リストを作成
      const fixedExpenseNames = fixedExpenses
        .filter((expense: FixedExpense) => expense.isActive)
        .map((expense: FixedExpense) => expense.name.toLowerCase())
      
      // 今月の支出取引のみをフィルタリング（固定支出を除外）
      const currentMonthExpenses = transactions.filter((transaction: Transaction) => {
        const transactionDate = new Date(transaction.date)
        const isCurrentMonth = transactionDate.getFullYear() === year &&
                              transactionDate.getMonth() + 1 === month &&
                              transaction.type === 'expense'
        
        // 固定支出でないかチェック（取引の説明が固定支出の名前と一致しないか）
        const isNotFixedExpense = !fixedExpenseNames.some(fixedName => 
          transaction.description.toLowerCase().includes(fixedName)
        )
        
        return isCurrentMonth && isNotFixedExpense
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
      
      {dailySpending.length > 0 ? (
        <div className="relative h-64">
          {/* Y軸ラベル */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pr-2">
            <span>{formatCurrency(maxAmount)}</span>
            <span>{formatCurrency(maxAmount * 0.75)}</span>
            <span>{formatCurrency(maxAmount * 0.5)}</span>
            <span>{formatCurrency(maxAmount * 0.25)}</span>
            <span>¥0</span>
          </div>
          
          {/* グラフエリア */}
          <div className="ml-16 h-full relative">
            {/* グリッドライン */}
            <div className="absolute inset-0">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <div
                  key={ratio}
                  className="absolute w-full border-t border-gray-200 dark:border-gray-600"
                  style={{ bottom: `${ratio * 100}%` }}
                />
              ))}
            </div>
            
            {/* 折れ線グラフ */}
            <svg className="absolute inset-0 w-full h-full">
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                points={dailySpending
                  .map((data, index) => {
                    const x = (index / (dailySpending.length - 1)) * 100
                    const y = 100 - (maxAmount > 0 ? (data.amount / maxAmount) * 100 : 0)
                    return `${x}%,${y}%`
                  })
                  .join(' ')}
              />
              {/* データポイント */}
              {dailySpending.map((data, index) => {
                const x = (index / (dailySpending.length - 1)) * 100
                const y = 100 - (maxAmount > 0 ? (data.amount / maxAmount) * 100 : 0)
                return (
                  <circle
                    key={data.date}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="3"
                    fill="#3B82F6"
                    className="hover:r-4 transition-all cursor-pointer"
                  >
                    <title>{`${data.day}日: ${formatCurrency(data.amount)}`}</title>
                  </circle>
                )
              })}
            </svg>
          </div>
          
          {/* X軸ラベル */}
          <div className="ml-16 mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>1日</span>
            <span>15日</span>
            <span>月末</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">今月の支出データがありません</p>
        </div>
      )}
    </div>
  )
}