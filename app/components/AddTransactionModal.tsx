'use client'

import { useState } from 'react'
import { Category } from '../types'
import { createTransaction } from '../lib/api'
import CategorySelector from './CategorySelector'

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
      // 金額を正確に処理するため、小数点以下を適切に処理
      const amount = Math.round(parseFloat(formData.amount) * 100) / 100
      
      await createTransaction({
        type: formData.type,
        amount: amount,
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* 横幅を広げたモーダル */}
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[95vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>取引を追加</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 取引タイプ - 全幅 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                取引タイプ
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income', categoryId: '' })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                    formData.type === 'income'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <div className="font-medium">収入</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense', categoryId: '' })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                    formData.type === 'expense'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="font-medium">支出</div>
                </button>
              </div>
            </div>

            {/* 金額・日付 - 2列レイアウト */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  金額 *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="例: 1000"
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  日付 *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* カテゴリ - 全幅 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                カテゴリ *
              </label>
              <CategorySelector
                categories={categories}
                selectedCategoryId={formData.categoryId ? parseInt(formData.categoryId) : undefined}
                onSelect={(category) => setFormData({ ...formData, categoryId: category.id.toString() })}
                type={formData.type}
              />
            </div>

            {/* 説明 - 全幅 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                説明
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="例: スーパーで食材購入"
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50"
                disabled={loading}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className={`flex-1 py-3 px-4 text-white font-medium rounded-lg transition-colors disabled:opacity-50 ${
                  formData.type === 'income' 
                    ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600' 
                    : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
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