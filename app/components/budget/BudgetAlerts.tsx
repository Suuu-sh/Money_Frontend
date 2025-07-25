'use client'

import { useState } from 'react'
import { BudgetAnalysis } from '../../types'
import { 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline'

interface BudgetAlertsProps {
  analysis: BudgetAnalysis | null
}

export default function BudgetAlerts({ analysis }: BudgetAlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  if (!analysis) return null

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  const dismissAlert = (alertType: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertType]))
  }

  const remainingPercentage = (analysis.remainingBudget / analysis.monthlyBudget) * 100
  const alerts = []

  // 予算超過アラート
  if (analysis.remainingBudget < 0 && !dismissedAlerts.has('over-budget')) {
    alerts.push({
      id: 'over-budget',
      type: 'error',
      icon: ExclamationCircleIcon,
      title: '予算超過',
      message: `今月の予算を${formatAmount(Math.abs(analysis.remainingBudget))}超過しています。支出を見直すことをお勧めします。`,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    })
  }

  // 緊急警告（残り予算10%未満）
  if (analysis.remainingBudget > 0 && remainingPercentage < 10 && !dismissedAlerts.has('urgent-warning')) {
    alerts.push({
      id: 'urgent-warning',
      type: 'urgent',
      icon: ExclamationCircleIcon,
      title: '緊急警告',
      message: `残り予算が${remainingPercentage.toFixed(1)}%です。今月の支出を大幅に制限する必要があります。`,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    })
  }

  // 注意警告（残り予算20%未満）
  if (analysis.remainingBudget > 0 && remainingPercentage >= 10 && remainingPercentage < 20 && !dismissedAlerts.has('warning')) {
    alerts.push({
      id: 'warning',
      type: 'warning',
      icon: ExclamationTriangleIcon,
      title: '注意',
      message: `残り予算が${remainingPercentage.toFixed(1)}%です。支出ペースを調整することをお勧めします。`,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    })
  }

  // 1日あたりの使用可能金額が少ない場合の警告
  if (analysis.remainingBudget > 0 && analysis.dailyAverage < 1000 && analysis.daysRemaining > 5 && !dismissedAlerts.has('daily-limit')) {
    alerts.push({
      id: 'daily-limit',
      type: 'info',
      icon: ExclamationTriangleIcon,
      title: '1日あたりの予算制限',
      message: `1日あたりの使用可能金額は${formatAmount(analysis.dailyAverage)}です。計画的な支出を心がけましょう。`,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500'
    })
  }

  if (alerts.length === 0) return null

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`${alert.bgColor} ${alert.borderColor} border rounded-lg p-4`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <alert.icon className={`w-5 h-5 ${alert.iconColor}`} />
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-semibold ${alert.textColor}`}>
                {alert.title}
              </h3>
              <p className={`mt-1 text-sm ${alert.textColor}`}>
                {alert.message}
              </p>
            </div>
            <div className="flex-shrink-0 ml-4">
              <button
                onClick={() => dismissAlert(alert.id)}
                className={`${alert.textColor} hover:opacity-75 transition-opacity`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}