'use client'

import { useState, useEffect } from 'react'
import { Transaction, FixedExpense } from '../../types'
import { fetchTransactions, fetchFixedExpenses } from '../../lib/api'
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface PredictionData {
  currentSpending: number
  predictedTotal: number
  dailyAverage: number
  remainingDays: number
  confidence: 'high' | 'medium' | 'low'
  trend: 'increasing' | 'decreasing' | 'stable'
  weeklyPattern: number[]
  monthlyProgress: number
}

export default function SpendingPrediction() {
  const [prediction, setPrediction] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    calculatePrediction()
  }, [selectedMonth])

  const calculatePrediction = async () => {
    try {
      setLoading(true)
      
      const [year, month] = selectedMonth.split('-').map(Number)
      const currentDate = new Date()
      const isCurrentMonth = year === currentDate.getFullYear() && month === currentDate.getMonth() + 1
      
      // 今月のデータを取得
      const startOfMonth = new Date(year, month - 1, 1)
      const endOfMonth = new Date(year, month, 0)
      const today = isCurrentMonth ? currentDate : endOfMonth
      
      const [transactions, fixedExpenses] = await Promise.all([
        fetchTransactions({
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0]
        }),
        fetchFixedExpenses()
      ])

      // 固定費から自動生成された取引を除外（予測計算用）
      const expenseTransactions = transactions
        .filter(t => t.type === 'expense')
        .filter(t => !t.description?.startsWith('固定収支:') && !t.description?.startsWith('固定支出:'))
      
      // 固定費の合計を計算
      const activeFixedExpenses = fixedExpenses.filter(fe => fe.isActive && fe.type === 'expense')
      const totalFixedExpenses = activeFixedExpenses.reduce((sum, fe) => sum + fe.amount, 0)
      
      // 現在までの支出（変動費のみ）
      const currentSpending = expenseTransactions
        .filter(t => new Date(t.date) <= today)
        .reduce((sum, t) => sum + t.amount, 0)
      
      // 現在までの支出（固定費込み）
      const currentSpendingWithFixed = currentSpending + totalFixedExpenses

      // 日別支出データを作成
      const dailySpending = new Map<string, number>()
      const daysInMonth = endOfMonth.getDate()
      const currentDay = isCurrentMonth ? today.getDate() : daysInMonth
      
      // 全日を初期化
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        dailySpending.set(dateKey, 0)
      }
      
      // 実際の支出を設定
      expenseTransactions.forEach(transaction => {
        const dateKey = transaction.date.split('T')[0]
        dailySpending.set(dateKey, (dailySpending.get(dateKey) || 0) + transaction.amount)
      })

      // 週別パターンを分析（過去3ヶ月のデータを使用）
      const threeMonthsAgo = new Date(year, month - 4, 1)
      const historicalTransactions = await fetchTransactions({
        startDate: threeMonthsAgo.toISOString().split('T')[0],
        endDate: startOfMonth.toISOString().split('T')[0]
      })

      const weeklyPattern = calculateWeeklyPattern(
        historicalTransactions
          .filter(t => t.type === 'expense')
          .filter(t => !t.description?.startsWith('固定収支:') && !t.description?.startsWith('固定支出:'))
      )
      
      // 予測計算
      const predictionResult = calculateMonthlyPrediction(
        dailySpending,
        currentDay,
        daysInMonth,
        weeklyPattern,
        isCurrentMonth
      )

      setPrediction({
        currentSpending,
        predictedTotal: predictionResult.predictedTotal,
        dailyAverage: predictionResult.dailyAverage,
        remainingDays: daysInMonth - currentDay,
        confidence: predictionResult.confidence,
        trend: predictionResult.trend,
        weeklyPattern,
        monthlyProgress: (currentDay / daysInMonth) * 100
      })

    } catch (error) {
      console.error('予測計算エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateWeeklyPattern = (transactions: Transaction[]): number[] => {
    const weeklySpending = [0, 0, 0, 0, 0, 0, 0] // 日曜日から土曜日
    const weeklyCounts = [0, 0, 0, 0, 0, 0, 0]

    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const dayOfWeek = date.getDay()
      weeklySpending[dayOfWeek] += transaction.amount
      weeklyCounts[dayOfWeek]++
    })

    // 平均を計算
    return weeklySpending.map((total, index) => 
      weeklyCounts[index] > 0 ? total / weeklyCounts[index] : 0
    )
  }

  const calculateMonthlyPrediction = (
    dailySpending: Map<string, number>,
    currentDay: number,
    daysInMonth: number,
    weeklyPattern: number[],
    isCurrentMonth: boolean
  ) => {
    const spentDays = Array.from(dailySpending.entries())
      .slice(0, currentDay)
      .map(([date, amount]) => ({ date, amount }))

    const totalSpent = spentDays.reduce((sum, day) => sum + day.amount, 0)
    const spendingDays = spentDays.filter(day => day.amount > 0)
    
    // 複数の予測手法を使用
    const predictions: number[] = []
    
    // 1. 単純な日平均ベース
    if (currentDay > 0) {
      const dailyAverage = totalSpent / currentDay
      predictions.push(dailyAverage * daysInMonth)
    }
    
    // 2. 支出のあった日のみの平均ベース
    if (spendingDays.length > 0) {
      const activeDayAverage = totalSpent / spendingDays.length
      const estimatedActiveDays = Math.max(spendingDays.length, daysInMonth * 0.6) // 最低60%の日に支出があると仮定
      predictions.push(activeDayAverage * estimatedActiveDays)
    }
    
    // 3. 週別パターンベース（過去データがある場合）
    if (weeklyPattern.some(p => p > 0) && isCurrentMonth) {
      let weeklyPrediction = 0
      const today = new Date()
      
      for (let day = currentDay + 1; day <= daysInMonth; day++) {
        const futureDate = new Date(today.getFullYear(), today.getMonth(), day)
        const dayOfWeek = futureDate.getDay()
        weeklyPrediction += weeklyPattern[dayOfWeek] || 0
      }
      
      predictions.push(totalSpent + weeklyPrediction)
    }
    
    // 4. トレンドベース予測
    if (spentDays.length >= 7) {
      const recentDays = spentDays.slice(-7)
      const earlierDays = spentDays.slice(-14, -7)
      
      if (earlierDays.length > 0) {
        const recentAverage = recentDays.reduce((sum, day) => sum + day.amount, 0) / recentDays.length
        const earlierAverage = earlierDays.reduce((sum, day) => sum + day.amount, 0) / earlierDays.length
        
        const trendMultiplier = earlierAverage > 0 ? recentAverage / earlierAverage : 1
        const trendPrediction = (totalSpent / currentDay) * daysInMonth * trendMultiplier
        predictions.push(trendPrediction)
      }
    }
    
    // 予測値の統合（中央値を使用）
    predictions.sort((a, b) => a - b)
    const predictedTotal = predictions.length > 0 
      ? predictions[Math.floor(predictions.length / 2)]
      : totalSpent

    // 信頼度の計算
    let confidence: 'high' | 'medium' | 'low' = 'low'
    if (currentDay >= 15) confidence = 'high'
    else if (currentDay >= 7) confidence = 'medium'
    
    // トレンドの判定
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (spentDays.length >= 7) {
      const recent = spentDays.slice(-3).reduce((sum, day) => sum + day.amount, 0) / 3
      const earlier = spentDays.slice(-7, -4).reduce((sum, day) => sum + day.amount, 0) / 3
      
      if (recent > earlier * 1.2) trend = 'increasing'
      else if (recent < earlier * 0.8) trend = 'decreasing'
    }

    return {
      predictedTotal: Math.max(predictedTotal, totalSpent), // 予測は現在の支出以上
      dailyAverage: currentDay > 0 ? totalSpent / currentDay : 0,
      confidence,
      trend
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 dark:text-green-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      default: return 'text-red-600 dark:text-red-400'
    }
  }

  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case 'high': return '高精度'
      case 'medium': return '中精度'
      default: return '低精度'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />
      case 'decreasing': return <ArrowTrendingDownIcon className="w-4 h-4 text-green-500" />
      default: return <ChartBarIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'increasing': return '増加傾向'
      case 'decreasing': return '減少傾向'
      default: return '安定'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          予測データを取得できませんでした
        </div>
      </div>
    )
  }

  const remainingBudget = prediction.predictedTotal - prediction.currentSpending
  const isOverspending = prediction.predictedTotal > prediction.currentSpending * 1.5

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">支出予測</h3>
        <div className="flex items-center space-x-2">
          <CalendarDaysIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {Array.from({ length: 3 }, (_, i) => {
              const date = new Date()
              date.setMonth(date.getMonth() - i)
              const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              const label = `${date.getFullYear()}年${date.getMonth() + 1}月`
              return <option key={value} value={value}>{label}</option>
            })}
          </select>
        </div>
      </div>

      {/* 予測サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
          <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">現在の支出</div>
          <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(prediction.currentSpending)}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            月の{prediction.monthlyProgress.toFixed(0)}%経過
          </div>
        </div>

        <div className={`rounded-lg p-4 ${
          isOverspending ? 'bg-red-50 dark:bg-red-900' : 'bg-green-50 dark:bg-green-900'
        }`}>
          <div className={`text-sm mb-1 ${
            isOverspending ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}>
            月末予測
          </div>
          <div className={`text-xl font-bold ${
            isOverspending ? 'text-red-900 dark:text-red-100' : 'text-green-900 dark:text-green-100'
          }`}>
            {formatCurrency(prediction.predictedTotal)}
          </div>
          <div className={`text-xs mt-1 flex items-center space-x-1 ${
            isOverspending ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}>
            <span className={getConfidenceColor(prediction.confidence)}>
              {getConfidenceText(prediction.confidence)}
            </span>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">日平均支出</div>
          <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
            {formatCurrency(prediction.dailyAverage)}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center space-x-1">
            {getTrendIcon(prediction.trend)}
            <span>{getTrendText(prediction.trend)}</span>
          </div>
        </div>
      </div>

      {/* 予測の詳細 */}
      <div className="space-y-4">
        {/* 進捗バー */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">月の進捗</span>
            <span className="text-gray-900 dark:text-white">{prediction.monthlyProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
              style={{ width: `${Math.min(prediction.monthlyProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* 支出予測バー */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">支出予測</span>
            <span className="text-gray-900 dark:text-white">
              {formatCurrency(prediction.currentSpending)} / {formatCurrency(prediction.predictedTotal)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                prediction.currentSpending / prediction.predictedTotal > 0.8
                  ? 'bg-gradient-to-r from-red-400 to-red-600'
                  : 'bg-gradient-to-r from-green-400 to-green-600'
              }`}
              style={{ width: `${Math.min((prediction.currentSpending / prediction.predictedTotal) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* 警告メッセージ */}
        {isOverspending && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  支出ペースが高めです
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  現在のペースで支出を続けると、月末までに{formatCurrency(prediction.predictedTotal)}になる予測です。
                  残り{prediction.remainingDays}日で{formatCurrency(Math.max(0, remainingBudget))}の支出が見込まれます。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 予測の説明 */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">予測について</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>• 過去3ヶ月の支出パターンと現在の傾向を分析して予測しています</p>
            <p>• 月の経過日数が多いほど予測精度が向上します</p>
            <p>• 週別の支出パターン（過去3ヶ月）も考慮されています</p>
            <p className={getConfidenceColor(prediction.confidence)}>
              • 現在の予測精度: {getConfidenceText(prediction.confidence)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}