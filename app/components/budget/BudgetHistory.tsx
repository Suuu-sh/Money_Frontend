'use client'

import { useState, useEffect } from 'react'
import { BudgetHistory as BudgetHistoryType, CategoryBudget } from '../../types'
import { fetchBudgetHistory, fetchCategoryBudgets } from '../../lib/api'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import SectionHeader from '../common/SectionHeader'

function BudgetHistory() {
  const [allHistory, setAllHistory] = useState<BudgetHistoryType[]>([])
  const [selectedMonths, setSelectedMonths] = useState(3)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const data = await fetchBudgetHistory()
      console.log('Budget History Data:', data) // デバッグ用
      setAllHistory(data)
      
      // 現在の月のカテゴリ別予算を取得
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1

      // カテゴリ別予算を取得
      try {
        const categoryBudgetData = await fetchCategoryBudgets(currentYear, currentMonth)
        setCategoryBudgets(categoryBudgetData)
      } catch (error) {
        console.log('カテゴリ別予算が設定されていません')
        setCategoryBudgets([])
      }
    } catch (error) {
      console.error('Budget History Error:', error) // デバッグ用
      setError('予算履歴の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // カテゴリ別予算の合計を計算
  const getTotalCategoryBudget = () => {
    return categoryBudgets.reduce((total, budget) => total + budget.amount, 0)
  }



  // 選択された月数分の履歴を取得（新しい順に並び替え）
  const history = allHistory.slice(-selectedMonths).reverse()

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

  const getMonthName = (year: number, month: number) => {
    return `${year}年${month}月`
  }

  const calculateAverageSpending = () => {
    const validHistory = history.filter(h => h.actualSpending > 0)
    if (validHistory.length === 0) return 0
    return validHistory.reduce((sum, h) => sum + h.actualSpending, 0) / validHistory.length
  }

  const getExceededMonths = () => {
    return history.filter(h => h.budgetExceeded).length
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-600 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center text-red-600 dark:text-red-400 py-8">{error}</div>
      </div>
    )
  }

  const averageSpending = calculateAverageSpending()
  const exceededMonths = getExceededMonths()

  return (
    <div className="card p-0 overflow-hidden">
      <SectionHeader
        title="予算履歴"
        rightSlot={(
          <select
            value={selectedMonths}
            onChange={(e) => setSelectedMonths(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={1}>過去1ヶ月</option>
            <option value={2}>過去2ヶ月</option>
            <option value={3}>過去3ヶ月</option>
            <option value={6}>過去6ヶ月</option>
          </select>
        )}
      />
      <div className="p-6">

      {history.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          予算履歴がありません
        </div>
      ) : (
        <div className="space-y-6">
          {/* サマリー統計 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
              <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">平均月間支出</div>
              <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
                {formatAmount(averageSpending)}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900 rounded-lg p-4">
              <div className="text-sm text-red-600 dark:text-red-400 mb-1">予算超過月数</div>
              <div className="text-xl font-bold text-red-800 dark:text-red-200">
                {exceededMonths}ヶ月
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
              <div className="text-sm text-green-600 dark:text-green-400 mb-1">平均貯蓄率</div>
              <div className="text-xl font-bold text-green-800 dark:text-green-200">
                {history.length > 0 
                  ? (history.reduce((sum, h) => sum + h.savingsRate, 0) / history.length).toFixed(1)
                  : '0.0'
                }%
              </div>
            </div>
          </div>

          {/* 月別履歴 */}
          <div className="space-y-3">
            {history.map((item, index) => {
              const isCurrentMonth = index === 0
              const currentBudget = (isCurrentMonth && categoryBudgets.length > 0)
                ? getTotalCategoryBudget()
                : item.budget
              const budgetUtilization = currentBudget > 0 ? (item.actualSpending / currentBudget) * 100 : 0
              // 現在月に限り、バックエンド値の代わりに前面で算出した予算で貯蓄率を再計算
              const localSavingsRate = currentBudget > 0 ? ((currentBudget - item.actualSpending) / currentBudget) * 100 : item.savingsRate
              
              return (
                <div
                  key={`${item.year}-${item.month}`}
                  className={`border rounded-lg p-4 border-gray-200 dark:border-gray-700 ${isCurrentMonth ? 'ring-2 ring-blue-200 dark:ring-blue-700' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {getMonthName(item.year, item.month)}
                      </h3>
                      {isCurrentMonth && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          今月
                        </span>
                      )}
                      {/* 予算超過バッジは非表示（仕様変更） */}
                    </div>
                    <div className="flex items-center space-x-2">
                      {localSavingsRate >= 0 ? (
                        <ArrowUpIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        localSavingsRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {localSavingsRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* 予算 vs 実績 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">予算</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {isCurrentMonth && categoryBudgets.length > 0 
                          ? formatAmount(getTotalCategoryBudget())
                          : item.budget > 0 
                            ? formatAmount(item.budget) 
                            : '未設定'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">実際の支出</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{formatAmount(item.actualSpending)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">固定費</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{formatAmount(item.fixedExpenses)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">使用率</div>
                      <div className={`font-semibold ${
                        budgetUtilization > 100 ? 'text-red-600 dark:text-red-400' : 
                        budgetUtilization > 80 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {budgetUtilization.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* 進捗バー */}
                  {currentBudget > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            budgetUtilization > 100 ? 'bg-red-500' :
                            budgetUtilization > 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 改善提案セクションは非表示（仕様変更） */}
        </div>
      )}


      </div>
    </div>
  )
}

export default BudgetHistory
