'use client'

import { useState, useEffect } from 'react'
import { FixedTransaction, Category, FixedTransactionRequest } from '../../types'
import { fetchCategories, createFixedTransaction, updateFixedTransaction } from '../../lib/api'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface FixedTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  transaction?: FixedTransaction
}

export default function FixedTransactionModal({
  isOpen,
  onClose,
  onSave,
  transaction
}: FixedTransactionModalProps) {
  const [formData, setFormData] = useState<FixedTransactionRequest>({
    name: '',
    amount: 0,
    type: 'expense',
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
          amount: transaction.amount,
          type: transaction.type,
          categoryId: transaction.categoryId,
          description: transaction.description,
          isActive: transaction.isActive
        })
      } else {
        setFormData({
          name: '',
          amount: 0,
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
      console.error('カテゴリの取得に失敗しました:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '名前は必須です'
    }

    if (formData.amount <= 0) {
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
      
      // 新しい固定収支APIを使用
      const requestData: FixedTransactionRequest = {
        name: formData.name,
        amount: formData.amount,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {transaction ? '固定収支を編集' : '固定収支を追加'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 収入・支出タイプ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイプ
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', categoryId: 0 })}
                  className="mr-2"
                />
                <span className="text-green-600">収入</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', categoryId: 0 })}
                  className="mr-2"
                />
                <span className="text-red-600">支出</span>
              </label>
            </div>
          </div>

          {/* 名前 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={formData.type === 'income' ? '給与、副業収入など' : '家賃、光熱費など'}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* 金額 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              金額 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
              step="1"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.categoryId || ''}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? Number(e.target.value) : 0 })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">カテゴリを選択してください</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
            )}
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="詳細な説明（任意）"
            />
          </div>

          {/* 有効/無効 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              有効にする
            </label>
          </div>

          {/* ボタン */}
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '保存中...' : transaction ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}