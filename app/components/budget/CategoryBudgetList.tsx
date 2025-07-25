'use client'

import { useState, useEffect } from 'react'
import { Category, CategoryBudget, CategoryBudgetAnalysis } from '../../types'
import { fetchCategoryBudgets, fetchCategoryBudgetAnalysis, deleteCategoryBudget } from '../../lib/api'
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

      const [budgetsData, analysisData] = await Promise.all([
        fetchCategoryBudgets(year, month),
        fetchCategoryBudgetAnalysis(year, month)
      ])

      setBudgets(budgetsData)
      setAnalysis(analysisData)
    } catch (error) {
      console.error('カテゴリ別予算データの取得に失敗しました:', error)
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
    if (utilizationRate >= 80) return 'bg-yellow-500'
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
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">カテゴリ別予算</h2>
        <button
          onClick={onAddBudget}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>予算を追加</span>
        </button>
      </div>

      {analysis.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">カテゴリ別予算が設定されていません</p>
          <button
            onClick={onAddBudget}
            className="btn-primary mt-4"
          >
            最初の予算を設定する
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {analysis.map((item) => {
            const budget = budgets.find(b => b.categoryId === item.categoryId)
            
            return (
              <div key={item.categoryId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: item.categoryColor }}
                    >
                      {item.categoryIcon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.categoryName}</h3>
                      <p className="text-sm text-gray-500">
                        {item.transactionCount}件の取引
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {budget && (
                      <>
                        <button
                          onClick={() => onEditBudget(budget)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">予算</span>
                    <span className="font-medium">{formatCurrency(item.budgetAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">使用済み</span>
                    <span className={`font-medium ${item.isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatCurrency(item.spentAmount)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">残り</span>
                    <span className={`font-medium ${item.remainingAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(item.remainingAmount)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>進捗</span>
                      <span>{Math.round(item.utilizationRate)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(item.utilizationRate, item.isOverBudget)}`}
                        style={{ width: `${Math.min(item.utilizationRate, 100)}%` }}
                      />
                    </div>
                    {item.isOverBudget && (
                      <p className="text-xs text-red-600 mt-1">
                        予算を{formatCurrency(Math.abs(item.remainingAmount))}超過しています
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}