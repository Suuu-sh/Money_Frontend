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

  // 動的なY軸スケールを計算
  const calculateYAxisScale = (maxValue: number) => {
    if (maxValue === 0) return { max: 10000, step: 2500 }
    
    if (maxValue <= 10000) {
      return { max: 10000, step: 2500 }
    } else if (maxValue <= 50000) {
      const max = Math.ceil(maxValue / 10000) * 10000
      return { max, step: max / 4 }
    } else if (maxValue <= 100000) {
      const max = Math.ceil(maxValue / 10000) * 10000
      return { max, step: max / 4 }
    } else {
      const max = Math.ceil(maxValue / 100000) * 100000
      return { max, step: max / 4 }
    }
  }

  const maxAmount = Math.max(...dailySpending.map(d => d.amount))
  const { max: yAxisMax, step: yAxisStep } = calculateYAxisScale(maxAmount)

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
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">日毎の支出推移</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">今月の変動支出のみ</p>
        </div>
      </div>
      
      {dailySpending.length > 0 ? (
        <div className="relative" style={{ height: '235px' }}>
          {/* Y軸ラベル */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pr-3 font-medium">
            <span>{formatCurrency(yAxisMax)}</span>
            <span>{formatCurrency(yAxisMax * 0.75)}</span>
            <span>{formatCurrency(yAxisMax * 0.5)}</span>
            <span>{formatCurrency(yAxisMax * 0.25)}</span>
            <span>¥0</span>
          </div>
          
          {/* グラフエリア */}
          <div className="ml-20 h-full relative bg-gradient-to-t from-gray-50/50 to-transparent dark:from-gray-800/50 rounded-lg">
            {/* グリッドライン */}
            <div className="absolute inset-0">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <div
                  key={ratio}
                  className="absolute w-full border-t border-gray-300 dark:border-gray-600 opacity-30"
                  style={{ bottom: `${ratio * 100}%` }}
                />
              ))}
            </div>
            
            {/* エリアチャート（グラデーション背景） */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
                  <stop offset="100%" stopColor="rgba(139, 92, 246, 0.05)" />
                </linearGradient>
              </defs>
              
              {/* エリア */}
              <polygon
                fill="url(#areaGradient)"
                points={`0,100 ${dailySpending
                  .map((data, index) => {
                    const x = (index / (dailySpending.length - 1)) * 100
                    const y = 100 - (yAxisMax > 0 ? (data.amount / yAxisMax) * 100 : 0)
                    return `${x},${y}`
                  })
                  .join(' ')} 100,100`}
              />
              
              {/* メインライン */}
              <polyline
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                points={dailySpending
                  .map((data, index) => {
                    const x = (index / (dailySpending.length - 1)) * 100
                    const y = 100 - (yAxisMax > 0 ? (data.amount / yAxisMax) * 100 : 0)
                    return `${x},${y}`
                  })
                  .join(' ')}
              />
            </svg>
            
            {/* データポイント（別のSVGで描画） */}
            <svg className="absolute inset-0 w-full h-full">
              {dailySpending.map((data, index) => {
                const x = (index / (dailySpending.length - 1)) * 100
                const y = 100 - (yAxisMax > 0 ? (data.amount / yAxisMax) * 100 : 0)
                return (
                  <g key={data.date}>
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="3"
                      fill="white"
                      stroke="#8B5CF6"
                      strokeWidth="2"
                      className="hover:r-4 transition-all cursor-pointer drop-shadow-sm"
                    />
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="1.5"
                      fill="#8B5CF6"
                      className="pointer-events-none"
                    />
                    <title>{`${data.day}日: ${formatCurrency(data.amount)}`}</title>
                  </g>
                )
              })}
            </svg>
          </div>
          
          {/* X軸ラベル */}
          <div className="ml-20 mt-2 flex justify-between text-xs text-gray-600 dark:text-gray-400 font-medium px-2">
            <span>1日</span>
            <span>15日</span>
            <span>月末</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">今月の支出データがありません</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">取引を追加すると、ここにグラフが表示されます</p>
        </div>
      )}
    </div>
  )
}