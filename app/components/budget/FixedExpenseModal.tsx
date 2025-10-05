'use client'

import { useState, useEffect } from 'react'
import { FixedExpense, FixedExpenseRequest, Category } from '../../types'
import { createFixedExpense, updateFixedExpense, fetchCategories } from '../../lib/api'
import { validateFixedExpenseForm } from '../../lib/validation'
import ErrorAlert from '../common/ErrorAlert'
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'

interface FixedExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  expense?: FixedExpense | null
  onSaved: () => void
}

// 固定費の新規登録・編集をまとめたモーダルフォーム
export default function FixedExpenseModal({ 
  isOpen, 
  onClose, 
  expense, 
  onSaved 
}: FixedExpenseModalProps) {
  const [formData, setFormData] = useState<FixedExpenseRequest>({
    name: '',
    amount: 0,
    categoryId: 0,
    description: '',
    isActive: true
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadCategories()
      if (expense) {
        setFormData({
          name: expense.name,
          amount: expense.amount,
          categoryId: expense.categoryId,
          description: expense.description,
          isActive: expense.isActive
        })
      } else {
        setFormData({
          name: '',
          amount: 0,
          categoryId: 0,
          description: '',
          isActive: true
        })
      }
      setError(null)
    }
  }, [isOpen, expense])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await fetchCategories('expense')
      setCategories(data)
    } catch (error) {
      console.error('カテゴリの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // バリデーション
    const validationErrors = validateFixedExpenseForm({
      name: formData.name,
      amount: formData.amount,
      categoryId: formData.categoryId,
      description: formData.description
    })
    
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0])
      return
    }

    try {
      setSaving(true)
      setError(null)

      if (expense) {
        await updateFixedExpense(expense.id, formData)
      } else {
        await createFixedExpense(formData)
      }

      onSaved()
      onClose()
    } catch (error: any) {
      setError('固定費の保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof FixedExpenseRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {expense ? '固定費を編集' : '固定費を追加'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 名前 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="家賃、光熱費など"
              required
            />
          </div>

          {/* 金額 */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              金額 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">¥</span>
              </div>
              <input
                type="number"
                id="amount"
                value={formData.amount || ''}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '') {
                    handleInputChange('amount', 0)
                  } else {
                    const numValue = Number(value)
                    if (!isNaN(numValue)) {
                      handleInputChange('amount', numValue)
                    }
                  }
                }}
                className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="金額を入力"
                min="0"
                step="1"
                required
              />
            </div>
          </div>

          {/* カテゴリ */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
            ) : (
              <select
                id="category"
                value={formData.categoryId || ''}
                onChange={(e) => handleInputChange('categoryId', e.target.value ? parseInt(e.target.value) : 0)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">カテゴリを選択してください</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 説明 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              説明
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="詳細な説明（任意）"
            />
          </div>

          {/* 有効/無効 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              この固定費を有効にする
            </label>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {/* ボタン */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              キャンセル
            </button>
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
                  <CheckIcon className="w-4 h-4 mr-2" />
                  {expense ? '更新' : '追加'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
