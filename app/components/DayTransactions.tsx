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
      <div className="card text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          日付を選択してください
        </h3>
        <p className="text-gray-500">
          カレンダーから日付をクリックして、その日の収支を確認・編集できます
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
    <div className="space-y-6">
      {/* 日付ヘッダー */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {format(selectedDate, 'yyyy年MM月dd日')}
            </h2>
            <p className="text-sm text-gray-600">
              {['日', '月', '火', '水', '木', '金', '土'][selectedDate.getDay()]}曜日
            </p>
          </div>
          <button
            onClick={() => onAddTransaction(selectedDate)}
            className="btn-primary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>取引を追加</span>
          </button>
        </div>
      </div>



      {/* 取引一覧 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          取引履歴 ({dayTransactions.length}件)
        </h3>
        
        {dayTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              この日の取引はありません
            </h4>
            <p className="text-gray-500 mb-4">
              「取引を追加」ボタンから収入や支出を記録してみましょう
            </p>
            <button
              onClick={() => onAddTransaction(selectedDate)}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>取引を追加</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full"
                    style={{ backgroundColor: transaction.category.color }}
                    title={transaction.category.name}
                  >
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {transaction.description || transaction.category.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {transaction.category.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className={`font-semibold ${
                    transaction.type === 'income' ? 'text-income-600' : 'text-expense-600'
                  }`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </div>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
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