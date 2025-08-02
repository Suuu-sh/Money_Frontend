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

  // 16進数カラーコードをRGBAに変換する関数
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">カテゴリ別予算</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">カテゴリ別予算設定</h2>
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
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">カテゴリ別予算が設定されていません</p>
          <button
            onClick={onAddBudget}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            最初の予算を設定する
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {analysis.sort((a, b) => {
            // CategorySelectorと同じ順序を適用
            const getCategoryOrder = (categoryName: string) => {
              const expenseOrder = [
                '食費', '住居費', '光熱費', '通信費', '交通費', 
                '医療費', '日用品', '衣服費', '美容費', '教育費', 
                '娯楽費', '交際費', '投資費', 'その他支出'
              ];
              const index = expenseOrder.indexOf(categoryName);
              return index === -1 ? 999 : index;
            };
            
            const orderA = getCategoryOrder(a.categoryName);
            const orderB = getCategoryOrder(b.categoryName);
            return orderA - orderB;
          }).map((item) => {
            const budget = budgets.find(b => b.categoryId === item.categoryId)
            
            // 取引履歴からのみ使用済み金額を計算（固定費から生成された取引も含む）
            const totalSpent = item.spentAmount
            const remaining = item.budgetAmount - totalSpent
            const utilization = item.budgetAmount > 0 ? (totalSpent / item.budgetAmount) * 100 : 0
            const isOverBudget = totalSpent > item.budgetAmount
            
            return (
              <div 
                key={item.categoryId} 
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg transition-all duration-200 hover:shadow-md"
                style={{ backgroundColor: hexToRgba(item.categoryColor, 0.08) }}
              >
                {/* 第一列：基本情報 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: item.categoryColor }}
                    />
                    <div className="flex items-center space-x-6">
                      <span className="text-base font-semibold text-gray-900 dark:text-white">{item.categoryName}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {item.transactionCount}件の取引
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">予算</span>
                        <span className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(item.budgetAmount)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">使用済み</span>
                        <span className={`text-base font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                          {formatCurrency(totalSpent)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">使用率</span>
                      <span className={`text-xl font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {Math.round(utilization)}%
                      </span>
                    </div>
                    {budget && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onEditBudget(budget)}
                          className="p-2 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
                          title="編集"
                        >
                          <PencilIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                          title="削除"
                        >
                          <TrashIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 第二列：プログレスバー */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-4 shadow-inner">
                    <div
                      className={`h-4 rounded-full transition-all duration-700 shadow-sm ${getProgressColor(utilization, isOverBudget)}`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>
                  {remaining < 0 && (
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium whitespace-nowrap">
                      ⚠️ {formatCurrency(Math.abs(remaining))}超過
                    </span>
                  )}
                </div>
                
                {isOverBudget && (
                  <div className="mt-2 text-right">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      ⚠️ 予算を{formatCurrency(Math.abs(remaining))}超過
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}