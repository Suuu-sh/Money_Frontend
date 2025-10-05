'use client'

import { useState, useEffect, useCallback } from 'react'
import { Budget, BudgetRequest } from '../../types'
import { fetchBudget, createBudget, updateBudget } from '../../lib/api'
import { validateBudgetForm } from '../../lib/validation'
import ErrorAlert from '../common/ErrorAlert'
import { CurrencyDollarIcon, CheckIcon } from '@heroicons/react/24/outline'

interface BudgetSettingsProps {
  onBudgetUpdated?: () => void
}

export default function BudgetSettings({ onBudgetUpdated }: BudgetSettingsProps) {
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const loadCurrentBudget = useCallback(async () => {
    try {
      setLoading(true)
      const budget = await fetchBudget(currentYear, currentMonth)
      setCurrentBudget(budget)
      setAmount(budget.amount.toString())
    } catch (error: any) {
      if (error.response?.status !== 404) {
        setError('予算データの取得に失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }, [currentMonth, currentYear])

  useEffect(() => {
    loadCurrentBudget()
  }, [loadCurrentBudget])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const budgetAmount = parseFloat(amount)
    
    // バリデーション
    const validationErrors = validateBudgetForm({
      year: currentYear,
      month: currentMonth,
      amount: budgetAmount
    })
    
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0])
      return
    }

    try {
      setSaving(true)
      setError(null)
      
      const budgetRequest: BudgetRequest = {
        year: currentYear,
        month: currentMonth,
        amount: budgetAmount
      }

      if (currentBudget) {
        // 更新
        await updateBudget(currentBudget.id, budgetRequest)
      } else {
        // 新規作成
        await createBudget(budgetRequest)
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
      // 予算データを再読み込み
      await loadCurrentBudget()
      
      // 親コンポーネントに更新を通知
      if (onBudgetUpdated) {
        onBudgetUpdated()
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        setError('この月の予算は既に設定されています')
      } else {
        setError('予算の保存に失敗しました')
      }
    } finally {
      setSaving(false)
    }
  }

  const formatAmount = (amount: number) => {
    // 数値の精度問題を回避するため、整数に丸める
    const roundedAmount = Math.round(amount)
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(roundedAmount)
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <CurrencyDollarIcon className="w-6 h-6 mr-2 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-900">
          {currentYear}年{currentMonth}月の予算設定
        </h2>
      </div>

      {/* 現在の予算表示 */}
      {currentBudget && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-blue-600 mb-1">現在の予算</div>
          <div className="text-2xl font-bold text-blue-800">
            {formatAmount(currentBudget.amount)}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="budget-amount" className="block text-sm font-medium text-gray-700 mb-2">
            月次予算金額
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">¥</span>
            </div>
            <input
              type="number"
              id="budget-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="金額を入力"
              min="0"
              step="1000"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            固定費と変動費を含む月間の総予算を設定してください
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center text-sm text-green-600">
              <CheckIcon className="w-4 h-4 mr-2" />
              予算が正常に保存されました
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                保存中...
              </>
            ) : (
              <>
                <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                {currentBudget ? '予算を更新' : '予算を設定'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* 予算設定のヒント */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">予算設定のコツ</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 手取り収入の80-90%を目安に設定しましょう</li>
          <li>• 固定費（家賃、光熱費など）を先に差し引いて考えましょう</li>
          <li>• 緊急時の備えとして10-20%は余裕を持たせましょう</li>
        </ul>
      </div>
    </div>
  )
}
