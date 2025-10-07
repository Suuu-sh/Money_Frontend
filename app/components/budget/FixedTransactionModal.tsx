'use client'

import { useState, useEffect } from 'react'
import { FixedTransaction, Category, FixedTransactionRequest } from '../../types'
import { fetchCategories, createFixedTransaction, updateFixedTransaction } from '../../lib/api'
import { XMarkIcon } from '@heroicons/react/24/outline'
import CategorySelector from '../CategorySelector'

interface FixedTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  transaction?: FixedTransaction
}

// Modal form used to create or edit recurring income/expense entries
export default function FixedTransactionModal({
  isOpen,
  onClose,
  onSave,
  transaction
}: FixedTransactionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    categoryId: 0,
    description: '',
    isActive: true
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      loadCategories()
      if (transaction) {
        setFormData({
          name: transaction.name,
          amount: transaction.amount.toString(),
          type: transaction.type,
          categoryId: transaction.categoryId,
          description: transaction.description,
          isActive: transaction.isActive
        })
      } else {
        setFormData({
          name: '',
          amount: '',
          type: 'expense',
          categoryId: 0,
          description: '',
          isActive: true
        })
      }
      setErrors({})
    }
  }, [isOpen, transaction])

  const loadCategories = async () => {
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories for fixed transactions:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '名前は必須です'
    }

    const amountValue = parseFloat(formData.amount)
    if (!formData.amount || isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = '金額は0より大きい値を入力してください'
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'カテゴリの選択は必須です'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      
      // Leverage the dedicated fixed transaction API
      const requestData: FixedTransactionRequest = {
        name: formData.name,
        amount: Number(formData.amount),
        type: formData.type,
        categoryId: formData.categoryId,
        description: formData.description,
        isActive: formData.isActive
      }

      if (transaction) {
        await updateFixedTransaction(transaction.id, requestData)
      } else {
        await createFixedTransaction(requestData)
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('固定収支の保存に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(cat => cat.type === formData.type)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {transaction ? '固定収支を編集' : '固定収支を追加'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {transaction ? '既存の固定収支を変更します' : '新しい固定収支を設定します'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Income/expense toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              タイプ
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                formData.type === 'income'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', categoryId: 0 })}
                  className="sr-only"
                />
                <span className="font-medium">💰 収入</span>
              </label>
              <label className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                formData.type === 'expense'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', categoryId: 0 })}
                  className="sr-only"
                />
                <span className="font-medium">💸 支出</span>
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={formData.type === 'income' ? '給与、副業収入など' : '家賃、光熱費など'}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              金額 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">¥</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
                  errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="金額を入力"
                min="0"
                step="1"
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <div className={`${errors.categoryId ? 'border-2 border-red-500 rounded-xl p-3' : ''}`}>
              <CategorySelector
                categories={categories}
                selectedCategoryId={formData.categoryId || undefined}
                onSelect={(category) => setFormData({ ...formData, categoryId: category.id })}
                type={formData.type}
              />
            </div>
            {errors.categoryId && (
              <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors resize-none"
              rows={3}
              placeholder="詳細な説明（任意）"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              この固定収支を有効にする
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 text-white font-medium rounded-xl transition-colors disabled:opacity-50 ${
                formData.type === 'income'
                  ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                  : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
              }`}
            >
              {loading ? '保存中...' : transaction ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
