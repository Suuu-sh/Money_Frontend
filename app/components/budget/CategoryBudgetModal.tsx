'use client'

import { useState, useEffect } from 'react'
import { Category, CategoryBudget } from '../../types'
import { createCategoryBudget, updateCategoryBudget } from '../../lib/api'
import { XMarkIcon } from '@heroicons/react/24/outline'
import CategorySelector from '../CategorySelector'

interface CategoryBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  budget?: CategoryBudget | null
  onSaved: () => void
}

// カテゴリ別予算の追加・更新を行うモーダルフォーム
export default function CategoryBudgetModal({
  isOpen,
  onClose,
  categories,
  budget,
  onSaved
}: CategoryBudgetModalProps) {
  const [formData, setFormData] = useState({
    categoryId: 0,
    amount: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (budget) {
        setFormData({
          categoryId: budget.categoryId,
          amount: budget.amount.toString()
        })
      } else {
        setFormData({
          categoryId: 0,
          amount: ''
        })
      }
      setError('')
    }
  }, [isOpen, budget])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.categoryId) {
      setError('カテゴリを選択してください')
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('有効な金額を入力してください')
      return
    }

    try {
      setLoading(true)
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1

      const budgetData = {
        categoryId: formData.categoryId,
        year,
        month,
        amount: parseFloat(formData.amount)
      }

      if (budget) {
        await updateCategoryBudget(budget.id, budgetData)
      } else {
        await createCategoryBudget(budgetData)
      }

      // 成功時に即座にコールバックを実行
      onSaved()
      onClose()
    } catch (error: any) {
      console.error('予算の保存に失敗しました:', error)
      if (error.response?.data?.error) {
        setError(error.response.data.error)
      } else if (error.message) {
        setError(error.message)
      } else {
        setError('予算の保存に失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  const expenseCategories = categories.filter(cat => cat.type === 'expense')
  const selectedCategory = categories.find(cat => cat.id === formData.categoryId)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* ヘッダー */}
        <div className="relative px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {budget ? 'カテゴリ予算を編集' : 'カテゴリ予算を追加'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {budget ? '既存の予算設定を変更します' : '新しいカテゴリの予算を設定します'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="px-5 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">カテゴリを選択</label>
              <CategorySelector
                categories={categories}
                selectedCategoryId={formData.categoryId || undefined}
                onSelect={(category) => setFormData({ ...formData, categoryId: category.id })}
                type="expense"
                className={budget ? 'pointer-events-none opacity-60' : ''}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                予算金額
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">¥</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="金額を入力"
                  min="0"
                  step="1"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                月間の予算金額を設定してください
              </p>
            </div>
          </form>
        </div>

        {/* フッター */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-all duration-200 font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </div>
              ) : (
                budget ? '更新' : '追加'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
