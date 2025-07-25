'use client'

import { Transaction, Category, Stats } from '../types'
import StatsCards from './StatsCards'
import RecentTransactions from './RecentTransactions'
import MonthlyChart from './MonthlyChart'
import BudgetOverview from './budget/BudgetOverview'
import BudgetAlerts from './budget/BudgetAlerts'
import { useState, useEffect } from 'react'
import { BudgetAnalysis } from '../types'
import { fetchBudgetAnalysis } from '../lib/api'

interface DashboardProps {
  transactions: Transaction[]
  categories: Category[]
  stats: Stats | null
}

export default function Dashboard({ transactions, categories, stats }: DashboardProps) {
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(null)
  const recentTransactions = transactions.slice(0, 10)

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
    } catch (error) {
      // 予算が設定されていない場合は無視
      console.log('予算データが見つかりません')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>ダッシュボード</span>
        </h2>
        
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

      {/* 最近の取引 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>最近の取引</span>
        </h3>
        <RecentTransactions transactions={recentTransactions} />
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