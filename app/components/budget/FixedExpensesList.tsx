'use client'

import { useState, useEffect } from 'react'
import { FixedExpense } from '../../types'
import { fetchFixedExpenses, deleteFixedExpense } from '../../lib/api'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'

interface FixedExpensesListProps {
  onAddExpense?: () => void
  onEditExpense?: (expense: FixedExpense) => void
  onExpensesUpdated?: () => void
}

export default function FixedExpensesList({ 
  onAddExpense, 
  onEditExpense, 
  onExpensesUpdated 
}: FixedExpensesListProps) {
  const [expenses, setExpenses] = useState<FixedExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const data = await fetchFixedExpenses()
      setExpenses(data)
    } catch (error) {
      console.error('固定費データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setDeleting(id)
      await deleteFixedExpense(id)
      await loadExpenses()
      setDeleteConfirm(null)
      
      if (onExpensesUpdated) {
        onExpensesUpdated()
      }
    } catch (error) {
      console.error('固定費の削除に失敗しました:', error)
    } finally {
      setDeleting(null)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  const totalAmount = expenses
    .filter(expense => expense.isActive)
    .reduce((sum, expense) => sum + expense.amount, 0)

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">固定費管理</h2>
        <button
          onClick={onAddExpense}
          className="btn-primary flex items-center text-sm"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          追加
        </button>
      </div>

      {/* 合計金額表示 */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="text-sm text-blue-600 mb-1">固定費合計</div>
        <div className="text-2xl font-bold text-blue-800">
          {formatAmount(totalAmount)}
        </div>
        <div className="text-sm text-blue-600 mt-1">
          {expenses.filter(e => e.isActive).length}件の有効な固定費
        </div>
      </div>

      {/* 固定費リスト */}
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>固定費が登録されていません</p>
            <button
              onClick={onAddExpense}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              最初の固定費を追加する
            </button>
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className={`border rounded-lg p-4 ${
                expense.isActive ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {expense.category && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: expense.category.color }}
                      >
                        <span>{expense.category.icon}</span>
                      </div>
                    )}
                    <div>
                      <h3 className={`font-medium ${
                        expense.isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {expense.name}
                      </h3>
                      {expense.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {expense.description}
                        </p>
                      )}
                      {expense.category && (
                        <p className="text-xs text-gray-400 mt-1">
                          {expense.category.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`font-semibold ${
                      expense.isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {formatAmount(expense.amount)}
                    </div>
                    {!expense.isActive && (
                      <div className="text-xs text-gray-400">無効</div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditExpense?.(expense)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="編集"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    
                    {deleteConfirm === expense.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDelete(expense.id)}
                          disabled={deleting === expense.id}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleting === expense.id ? '削除中...' : '削除'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(expense.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="削除"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 固定費管理のヒント */}
      {expenses.length > 0 && (
        <div className="mt-6 bg-yellow-50 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 mb-1">
                固定費管理のポイント
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 定期的に固定費を見直して無駄な支出を削減しましょう</li>
                <li>• 一時的に支払いを停止する場合は「無効」に設定できます</li>
                <li>• カテゴリを設定すると支出分析で詳細を確認できます</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}