'use client'

import { useState } from 'react'
import { Transaction, Category } from '../types'
import { deleteTransaction } from '../lib/api'
import { format } from 'date-fns'

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  onTransactionUpdated: () => void
}

export default function TransactionList({ transactions, categories, onTransactionUpdated }: TransactionListProps) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredTransactions = transactions.filter(transaction => {
    if (filter !== 'all' && transaction.type !== filter) return false
    if (categoryFilter !== 'all' && transaction.categoryId.toString() !== categoryFilter) return false
    return true
  })

  const formatAmount = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
    
    return type === 'income' ? `+${formatted}` : `-${formatted}`
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('この取引を削除しますか？')) {
      try {
        await deleteTransaction(id)
        onTransactionUpdated()
      } catch (error) {
        console.error('取引削除エラー:', error)
        alert('取引の削除に失敗しました')
      }
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">取引履歴</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input-field w-full sm:w-auto"
          >
            <option value="all">すべて</option>
            <option value="income">収入のみ</option>
            <option value="expense">支出のみ</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field w-full sm:w-auto"
          >
            <option value="all">全カテゴリ</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            取引が見つかりません
          </h3>
          <p className="text-gray-500">
            フィルターを変更するか、新しい取引を追加してください
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">日付</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">カテゴリ</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">説明</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">金額</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {format(new Date(transaction.date), 'yyyy/MM/dd')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center">
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: transaction.category.color }}
                        title={transaction.category.name}
                      >
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {transaction.description || '-'}
                  </td>
                  <td className={`py-3 px-4 text-sm font-semibold text-right ${
                    transaction.type === 'income' ? 'text-income-600' : 'text-expense-600'
                  }`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}