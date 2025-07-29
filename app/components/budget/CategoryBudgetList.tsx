'use client'

import { useState, useEffect } from 'react'
import { Category, CategoryBudget, CategoryBudgetAnalysis, FixedExpense } from '../../types'
import { fetchCategoryBudgets, fetchCategoryBudgetAnalysis, deleteCategoryBudget, fetchFixedExpenses } from '../../lib/api'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface CategoryBudgetListProps {
  categories: Category[]
  onAddBudget: () => void
  onEditBudget: (budget: CategoryBudget) => void
  onBudgetUpdated: () => void
}

export default function CategoryBudgetList({ 
  categories, 
  onAddBudget, 
  onEditBudget, 
  onBudgetUpdated 
}: CategoryBudgetListProps) {
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [analysis, setAnalysis] = useState<CategoryBudgetAnalysis[]>([])
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBudgets()
  }, [])

  const loadBudgets = async () => {
    try {
      setLoading(true)
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1

      const [budgetsData, analysisData, fixedExpensesData] = await Promise.all([
        fetchCategoryBudgets(year, month),
        fetchCategoryBudgetAnalysis(year, month),
        fetchFixedExpenses()
      ])

      setBudgets(Array.isArray(budgetsData) ? budgetsData : [])
      setAnalysis(Array.isArray(analysisData) ? analysisData : [])
      setFixedExpenses(Array.isArray(fixedExpensesData) ? fixedExpensesData : [])
    } catch (error) {
      console.error('カテゴリ別予算データの取得に失敗しました:', error)
      setBudgets([])
      setAnalysis([])
      setFixedExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この予算設定を削除しますか？')) return

    try {
      await deleteCategoryBudget(id)
      await loadBudgets()
      onBudgetUpdated()
    } catch (error) {
      console.error('予算の削除に失敗しました:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const getProgressColor = (utilizationRate: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'bg-red-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">カテゴリ別予算</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">カテゴリ別予算設定</h2>
        <button
          onClick={onAddBudget}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>予算を追加</span>
        </button>
      </div>

      {analysis.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">カテゴリ別予算が設定されていません</p>
          <button
            onClick={onAddBudget}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            最初の予算を設定する
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {analysis.sort((a, b) => b.budgetAmount - a.budgetAmount).map((item) => {
            const budget = budgets.find(b => b.categoryId === item.categoryId)
            
            // 取引履歴からのみ使用済み金額を計算（固定費から生成された取引も含む）
            const totalSpent = item.spentAmount
            const remaining = item.budgetAmount - totalSpent
            const utilization = item.budgetAmount > 0 ? (totalSpent / item.budgetAmount) * 100 : 0
            const isOverBudget = totalSpent > item.budgetAmount
            
            return (
              <div key={item.categoryId} className="bg-gray-50 rounded-md p-2 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <div 
                      className="w-5 h-5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.categoryColor }}
                      title={item.categoryName}
                    >
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{item.categoryName}</p>
                      <p className="text-xs text-gray-500">
                        {item.transactionCount}件
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {budget && (
                      <>
                        <button
                          onClick={() => onEditBudget(budget)}
                          className="text-gray-400 hover:text-primary-600 p-1 rounded hover:bg-white transition-colors"
                          title="編集"
                        >
                          <PencilIcon className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-white transition-colors"
                          title="削除"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 mb-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5">予算</p>
                    <p className="font-medium text-gray-900 text-xs">{formatCurrency(item.budgetAmount)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5">使用済み</p>
                    <p className={`font-medium text-xs ${isOverBudget ? 'text-red-600' : 'text-orange-600'}`}>
                      {formatCurrency(totalSpent)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5">残り</p>
                    <p className={`font-medium text-xs ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(remaining)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>使用率</span>
                    <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-700'}`}>
                      {Math.round(utilization)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(utilization, isOverBudget)}`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>
                  {isOverBudget && (
                    <p className="text-xs text-red-600 font-medium">
                      ⚠️ 予算を{formatCurrency(Math.abs(remaining))}超過
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}