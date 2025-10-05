'use client'

import { Stats } from '../types'

interface StatsCardsProps {
  stats: Stats
}

export default function StatsCards({ stats }: StatsCardsProps) {
  // 日本円の表示形式へ統一
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  // 4種類のカード定義をまとめて生成
  const cards = [
    {
      title: '収入',
      value: formatAmount(stats.thisMonthIncome),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'bg-income-500',
      textColor: 'text-income-600',
    },
    {
      title: '支出',
      value: formatAmount(stats.thisMonthExpense),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-expense-500',
      textColor: 'text-expense-600',
    },
    {
      title: '収支',
      value: formatAmount(stats.thisMonthIncome - stats.thisMonthExpense),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: stats.thisMonthIncome - stats.thisMonthExpense >= 0 ? 'bg-income-500' : 'bg-expense-500',
      textColor: stats.thisMonthIncome - stats.thisMonthExpense >= 0 ? 'text-income-600' : 'text-expense-600',
    },
    {
      title: '残高',
      value: formatAmount(stats.currentBalance),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: stats.currentBalance >= 0 ? 'bg-income-500' : 'bg-expense-500',
      textColor: stats.currentBalance >= 0 ? 'text-income-600' : 'text-expense-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex flex-col items-center text-center">
            <div className={`${card.color} rounded-lg p-2 mb-2 text-white`}>
              {card.icon}
            </div>
            <div className="w-full">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
              <p className={`text-sm font-bold ${card.textColor} dark:${card.textColor.replace('600', '400')} break-all`}>{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
