'use client'

import { useState } from 'react'
import { Transaction, Category } from '../types'
import { format, isSameDay } from 'date-fns'
import { deleteTransaction } from '../lib/api'

interface DayTransactionsProps {
  selectedDate: Date | null
  transactions: Transaction[]
  categories: Category[]
  onTransactionUpdated: () => void
  onAddTransaction: (date: Date) => void
}

export default function DayTransactions({ 
  selectedDate, 
  transactions, 
  categories, 
  onTransactionUpdated,
  onAddTransaction 
}: DayTransactionsProps) {
  if (!selectedDate) {
    return (
      <div className="card text-center py-6">
        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
          日付を選択してください
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          カレンダーから日付をクリックして取引を確認
        </p>
      </div>
    )
  }

  const dayTransactions = transactions.filter(transaction => 
    isSameDay(new Date(transaction.date), selectedDate)
  )

  const dayIncome = dayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const dayExpense = dayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

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
    <div>
      {/* 取引一覧 */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            取引履歴 ({dayTransactions.length}件)
          </h3>
          <button
            onClick={() => onAddTransaction(selectedDate)}
            className="btn-primary text-xs px-2 py-1"
          >
            取引を追加
          </button>
        </div>
        
        {dayTransactions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              この日の取引はありません
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: transaction.category.color }}
                    title={transaction.category.name}
                  >
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-xs">
                      {transaction.description || transaction.category.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.category.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`font-medium text-sm ${
                    transaction.type === 'income' ? 'text-income-600 dark:text-income-400' : 'text-expense-600 dark:text-expense-400'
                  }`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </div>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}