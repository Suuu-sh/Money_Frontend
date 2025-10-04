'use client'

import { useState } from 'react'
import { Transaction, Category } from '../types'
import { format, isSameDay } from 'date-fns'
import SectionHeader from './common/SectionHeader'
import { deleteTransaction } from '../lib/api'
import { 
  Utensils, 
  Car, 
  Home, 
  Zap, 
  ShoppingBag, 
  Heart, 
  GraduationCap, 
  Gamepad2, 
  Shirt, 
  Sparkles, 
  Package, 
  FileText, 
  Briefcase, 
  Laptop, 
  TrendingUp, 
  Gift, 
  DollarSign,
  Smartphone,
  Users,
  PiggyBank
} from 'lucide-react'

interface DayTransactionsProps {
  selectedDate: Date | null
  transactions: Transaction[]
  categories: Category[]
  onTransactionUpdated: () => void
  onAddTransaction: (date: Date) => void
  onEditTransaction?: (transaction: Transaction) => void
}

export default function DayTransactions({ 
  selectedDate, 
  transactions, 
  categories, 
  onTransactionUpdated,
  onAddTransaction,
  onEditTransaction
}: DayTransactionsProps) {
  // カテゴリアイコンのマッピング（Lucide Reactアイコンを使用）
  const getCategoryIcon = (name: string, iconColor: string = '#6B7280', size: number = 16) => {
    const iconProps = { size, color: iconColor, strokeWidth: 2 };
    
    const iconMap: { [key: string]: JSX.Element } = {
      '食費': <Utensils {...iconProps} />,
      '交通費': <Car {...iconProps} />,
      '娯楽費': <Gamepad2 {...iconProps} />,
      '光熱費': <Zap {...iconProps} />,
      '日用品': <Package {...iconProps} />,
      '医療費': <Heart {...iconProps} />,
      '住居費': <Home {...iconProps} />,
      '教育費': <GraduationCap {...iconProps} />,
      '美容費': <Sparkles {...iconProps} />,
      '衣服費': <Shirt {...iconProps} />,
      '通信費': <Smartphone {...iconProps} />,
      '交際費': <Users {...iconProps} />,
      '投資費': <PiggyBank {...iconProps} />,
      'その他支出': <FileText {...iconProps} />,
      '給与': <Briefcase {...iconProps} />,
      '副業': <Laptop {...iconProps} />,
      '投資': <TrendingUp {...iconProps} />,
      '賞与': <Gift {...iconProps} />,
      'その他収入': <DollarSign {...iconProps} />,
    };
    
    return iconMap[name] || <ShoppingBag {...iconProps} />;
  };
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
      <div className="card p-0 overflow-hidden">
        <SectionHeader
          title="取引履歴"
          subtitle={`${dayTransactions.length}件`}
          rightSlot={(
            <button
              onClick={() => onAddTransaction(selectedDate!)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              取引を追加
            </button>
          )}
        />
        <div className="p-4">
        
        {dayTransactions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              この日の取引はありません
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {dayTransactions.map((transaction) => {
              // カテゴリカラーを薄くした背景色を生成
              const hexToRgb = (hex: string) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
                } : null;
              };
              
              const rgb = hexToRgb(transaction.category.color);
              const lightBackgroundColor = rgb 
                ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` 
                : 'rgba(156, 163, 175, 0.1)';
              
              return (
                <div
                  key={transaction.id}
                  className="border rounded-md p-2 hover:shadow-sm transition-all duration-200"
                  style={{ 
                    backgroundColor: lightBackgroundColor,
                    borderColor: transaction.category.color + '20'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                        {getCategoryIcon(transaction.category.name, transaction.category.color, 16)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            {transaction.description || transaction.category.name}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {transaction.category.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <span className={`text-sm font-semibold ${
                        transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatAmount(transaction.amount, transaction.type)}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        {/* 編集ボタン */}
                        {onEditTransaction && (
                          <button
                            onClick={() => onEditTransaction(transaction)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            title="編集"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        
                        {/* 削除ボタン */}
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                          title="削除"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
