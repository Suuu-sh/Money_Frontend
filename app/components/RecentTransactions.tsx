'use client'

import { Transaction } from '../types'
import { format } from 'date-fns'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatAmount = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
    
    return type === 'income' ? `+${formatted}` : `-${formatted}`
  }

  if (transactions.length === 0) {
    return (
      <div className="card text-center py-8">
        <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-500">最近の取引がありません</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between border-b border-gray-100 last:border-b-0 pb-3 last:pb-0 min-w-0">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div 
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: transaction.category.color }}
                title={transaction.category.name}
              >
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {transaction.description || transaction.category.name}
                </h4>
                <p className="text-xs text-gray-600 truncate">
                  {transaction.category.name} • {format(new Date(transaction.date), 'MM/dd')}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className={`font-semibold text-sm whitespace-nowrap ${
                transaction.type === 'income' ? 'text-income-600' : 'text-expense-600'
              }`}>
                {formatAmount(transaction.amount, transaction.type)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}