'use client'

import { Transaction, Category, Stats } from '../types'
import StatsCards from './StatsCards'
import MonthlyChart from './MonthlyChart'
import DayTransactions from './DayTransactions'
import BudgetOverview from './budget/BudgetOverview'
import BudgetAlerts from './budget/BudgetAlerts'
import { useState, useEffect } from 'react'
import { BudgetAnalysis } from '../types'
import { fetchBudgetAnalysis } from '../lib/api'

interface DashboardProps {
  transactions: Transaction[]
  categories: Category[]
  stats: Stats | null
  selectedDate?: Date | null
  onTransactionUpdated?: () => void
  onAddTransaction?: (date: Date) => void
}

export default function Dashboard({ transactions, categories, stats, selectedDate, onTransactionUpdated, onAddTransaction }: DashboardProps) {
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(null)

  useEffect(() => {
    loadBudgetAnalysis()
  }, [])

  const loadBudgetAnalysis = async () => {
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      
      const data = await fetchBudgetAnalysis(year, month)
      setBudgetAnalysis(data)
    } catch (error: any) {
      console.error('予算データの取得に失敗しました:', error)
      console.error('エラー詳細:', error.response?.data || error.message)
      // 予算が設定されていない場合やエラーの場合はnullのまま
      setBudgetAnalysis(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        {stats && <StatsCards stats={stats} />}
      </div>

      {/* 予算アラート */}
      <BudgetAlerts analysis={budgetAnalysis} />

      {/* 予算概要と月別収支 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 予算概要 */}
        <div>
          <BudgetOverview />
        </div>
        
        {/* 月別収支（コンパクト） */}
        <div>
          <MonthlyChart />
        </div>
      </div>

      {/* 取引履歴 */}
      <div>
        <DayTransactions 
          selectedDate={selectedDate}
          transactions={transactions}
          categories={categories}
          onTransactionUpdated={onTransactionUpdated}
          onAddTransaction={onAddTransaction}
        />
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            まだ取引が記録されていません
          </h3>
          <p className="text-gray-500">
            「取引を追加」ボタンから収入や支出を記録してみましょう！
          </p>
        </div>
      )}
    </div>
  )
}