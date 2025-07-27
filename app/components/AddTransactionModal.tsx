'use client'

import { useState } from 'react'
import { Category } from '../types'
import { createTransaction } from '../lib/api'

interface AddTransactionModalProps {
  categories: Category[]
  onClose: () => void
  onTransactionAdded: () => void
  defaultDate?: Date
}

export default function AddTransactionModal({ categories, onClose, onTransactionAdded, defaultDate }: AddTransactionModalProps) {
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    categoryId: '',
    description: '',
    date: defaultDate ? getLocalDateString(defaultDate) : getLocalDateString(new Date()),
  })
  const [loading, setLoading] = useState(false)

  const filteredCategories = categories.filter(cat => cat.type === formData.type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createTransaction({
        type: formData.type,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
        description: formData.description,
        date: formData.date,
      })
      onTransactionAdded()
    } catch (error) {
      console.error('取引作成エラー:', error)
      alert('取引の作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      {/* Mobile: Full screen bottom sheet */}
      <div className="bg-white w-full max-h-[90vh] overflow-y-auto sm:rounded-xl sm:max-w-md sm:w-full sm:max-h-[90vh]">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>取引を追加</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 touch-manipulation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                取引タイプ
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income', categoryId: '' })}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-colors flex flex-col items-center space-y-1 sm:space-y-2 touch-manipulation ${
                    formData.type === 'income'
                      ? 'border-income-500 bg-income-50 text-income-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <div className="font-medium text-sm sm:text-base">収入</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense', categoryId: '' })}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-colors flex flex-col items-center space-y-1 sm:space-y-2 touch-manipulation ${
                    formData.type === 'expense'
                      ? 'border-expense-500 bg-expense-50 text-expense-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="font-medium text-sm sm:text-base">支出</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                金額 *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-field text-base"
                placeholder="例: 1000"
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="input-field text-base"
              >
                <option value="">カテゴリを選択</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field text-base"
                placeholder="例: スーパーで食材購入"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                日付 *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 py-3 sm:py-2 text-base touch-manipulation"
                disabled={loading}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className={`flex-1 py-3 sm:py-2 text-base touch-manipulation ${
                  formData.type === 'income' ? 'btn-income' : 'btn-expense'
                }`}
                disabled={loading}
              >
                {loading ? '追加中...' : '取引を追加'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}