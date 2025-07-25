'use client'

import { useState, useEffect } from 'react'
import { Category, CategoryBudget } from '../../types'
import { createCategoryBudget, updateCategoryBudget } from '../../lib/api'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface CategoryBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  budget?: CategoryBudget | null
  onSaved: () => void
}

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {budget ? 'カテゴリ予算を編集' : 'カテゴリ予算を追加'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={!!budget}
            >
              <option value={0}>カテゴリを選択</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                style={{ backgroundColor: selectedCategory.color }}
              >
                {selectedCategory.icon}
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedCategory.name}</p>
                <p className="text-sm text-gray-500">{selectedCategory.description}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              予算金額
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ¥
              </span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {loading ? '保存中...' : (budget ? '更新' : '追加')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}