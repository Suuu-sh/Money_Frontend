'use client'

import { useState, useEffect } from 'react'
import { BudgetHistory as BudgetHistoryType } from '../../types'
import { fetchBudgetHistory } from '../../lib/api'
import { ChartBarIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

function BudgetHistory() {
  const [allHistory, setAllHistory] = useState<BudgetHistoryType[]>([])
  const [selectedMonths, setSelectedMonths] = useState(3)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const data = await fetchBudgetHistory()
      setAllHistory(data)
    } catch (error) {
      setError('予算履歴の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 選択された月数分の履歴を取得
  const history = allHistory.slice(-selectedMonths)

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
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
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center text-red-600 py-8">{error}</div>
      </div>
    )
  }

  const averageSpending = calculateAverageSpending()
  const exceededMonths = getExceededMonths()

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">予算履歴</h2>
        </div>
        <select
          value={selectedMonths}
          onChange={(e) => setSelectedMonths(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={1}>過去1ヶ月</option>
          <option value={2}>過去2ヶ月</option>
          <option value={3}>過去3ヶ月</option>
          <option value={6}>過去6ヶ月</option>
        </select>
      </div>

      {history.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          予算履歴がありません
        </div>
      ) : (
        <div className="space-y-6">
          {/* サマリー統計 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-1">平均月間支出</div>
              <div className="text-xl font-bold text-blue-800">
                {formatAmount(averageSpending)}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-red-600 mb-1">予算超過月数</div>
              <div className="text-xl font-bold text-red-800">
                {exceededMonths}ヶ月
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">平均貯蓄率</div>
              <div className="text-xl font-bold text-green-800">
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
              const budgetUtilization = item.budget > 0 ? (item.actualSpending / item.budget) * 100 : 0
              const isCurrentMonth = index === history.length - 1
              
              return (
                <div
                  key={`${item.year}-${item.month}`}
                  className={`border rounded-lg p-4 ${
                    item.budgetExceeded ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  } ${isCurrentMonth ? 'ring-2 ring-blue-200' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        {getMonthName(item.year, item.month)}
                      </h3>
                      {isCurrentMonth && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          今月
                        </span>
                      )}
                      {item.budgetExceeded && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          予算超過
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.savingsRate >= 0 ? (
                        <ArrowUpIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        item.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.savingsRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* 予算 vs 実績 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">予算</div>
                      <div className="font-semibold">
                        {item.budget > 0 ? formatAmount(item.budget) : '未設定'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">実際の支出</div>
                      <div className="font-semibold">{formatAmount(item.actualSpending)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">固定費</div>
                      <div className="font-semibold">{formatAmount(item.fixedExpenses)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">使用率</div>
                      <div className={`font-semibold ${
                        budgetUtilization > 100 ? 'text-red-600' : 
                        budgetUtilization > 80 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {budgetUtilization.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* 進捗バー */}
                  {item.budget > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
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

          {/* 改善提案 */}
          {exceededMonths > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                予算管理の改善提案
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                {exceededMonths >= 3 && (
                  <li>• 過去3ヶ月以上予算を超過しています。予算額の見直しを検討してください</li>
                )}
                {averageSpending > 0 && (
                  <li>• 平均月間支出は{formatAmount(averageSpending)}です。これを基準に予算を調整してください</li>
                )}
                <li>• 固定費の見直しで月間支出を削減できる可能性があります</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BudgetHistory