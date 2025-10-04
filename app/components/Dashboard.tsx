'use client'

import { Transaction, Category, Stats } from '../types'
import StatsCards from './StatsCards'
import MonthlyChart from './MonthlyChart'
import DayTransactions from './DayTransactions'
import DailySpendingChart from './DailySpendingChart'
import BudgetOverview from './budget/BudgetOverview'
import { useState, useEffect } from 'react'
import { BudgetAnalysis } from '../types'
import { fetchBudgetAnalysis } from '../lib/api'

interface DashboardProps {
  transactions: Transaction[]
  categories: Category[]
  stats: Stats | null
  selectedDate?: Date | null
  currentMonth?: Date
  onTransactionUpdated?: () => void
  onAddTransaction?: (date: Date) => void
  onEditTransaction?: (transaction: Transaction) => void
}

export default function Dashboard({ transactions, categories, stats, selectedDate, currentMonth, onTransactionUpdated, onAddTransaction, onEditTransaction }: DashboardProps) {
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(null)

  useEffect(() => {
    loadBudgetAnalysis()
  }, [currentMonth])

  const loadBudgetAnalysis = async () => {
    try {
      // currentMonthが指定されている場合はその月のデータを取得、なければ現在の月
      const targetDate = currentMonth || new Date()
      const year = targetDate.getFullYear()
      const month = targetDate.getMonth() + 1
      
      const data = await fetchBudgetAnalysis(year, month)
      setBudgetAnalysis(data)
    } catch (error: any) {
      console.error('予算データの取得に失敗しました:', error)
      console.error('エラー詳細:', error.response?.data || error.message)
      // 予算が設定されていない場合やエラーの場合はnullのまま
      setBudgetAnalysis(null)
    }
  }

  // 現在表示されている取引から月別統計を計算
  const calculateMonthlyStats = (): Stats => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    return {
      totalIncome: income,
      totalExpense: expense,
      currentBalance: income - expense,
      thisMonthIncome: income,
      thisMonthExpense: expense,
      transactionCount: transactions.length
    }
  }

  // 表示用の統計データ（月別データがある場合はそれを使用、なければ全体統計）
  const displayStats = transactions.length > 0 ? calculateMonthlyStats() : stats

  return (
    <div className="space-y-8">
      {/* 予算アラートは表示しない（仕様変更） */}

      {/* 予算概要と日毎支出チャートを横並びに配置 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 予算概要 */}
        <div>
          <BudgetOverview currentMonth={currentMonth} />
        </div>

        {/* 日毎支出チャート */}
        <div>
          <DailySpendingChart />
        </div>
      </div>

      {/* 取引履歴 - 予算ブロックの下に配置 */}
      <div className="w-full">
        <DayTransactions 
          selectedDate={selectedDate}
          transactions={transactions}
          categories={categories}
          onTransactionUpdated={onTransactionUpdated}
          onAddTransaction={onAddTransaction}
          onEditTransaction={onEditTransaction}
        />
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            まだ取引が記録されていません
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            「取引を追加」ボタンから収入や支出を記録してみましょう！
          </p>
        </div>
      )}
    </div>
  )
}
