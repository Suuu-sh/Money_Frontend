'use client'

import { useState } from 'react'
import { Transaction, Category } from '../types'
import { deleteTransaction } from '../lib/api'
import { format } from 'date-fns'
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

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  onTransactionUpdated: () => void
  onEditTransaction?: (transaction: Transaction) => void
}

export default function TransactionList({ transactions, categories, onTransactionUpdated, onEditTransaction }: TransactionListProps) {
  // Local filter/sort state for the transaction list
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'created'>('date')


  // Map category names to lucide-react icons
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

  // Filter and sort transactions based on the user selections
  const filteredAndSortedTransactions = transactions
    .filter(transaction => {
      if (filter !== 'all' && transaction.type !== filter) return false
      if (categoryFilter !== 'all' && transaction.categoryId.toString() !== categoryFilter) return false
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'amount':
          comparison = Math.abs(a.amount) - Math.abs(b.amount)
          break
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'created':
          comparison = a.id - b.id
          break
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      
      return -comparison // Always display in descending order
    })

  // Format amounts with currency symbols and sign
  const formatAmount = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
    
    return type === 'income' ? `+${formatted}` : `-${formatted}`
  }

  // Confirm deletion, call the API, then refresh the list
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap">取引履歴</h2>
        </div>
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

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input-field w-full sm:w-auto"
          >
            <option value="date">日付順</option>
            <option value="amount">金額順</option>
            <option value="created">登録順</option>
          </select>


        </div>
      </div>

      {filteredAndSortedTransactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            取引が見つかりません
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            フィルターを変更するか、新しい取引を追加してください
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          {filteredAndSortedTransactions.map((transaction) => {
            // Generate a tinted background from the category colour
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
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {format(new Date(transaction.date), 'MM/dd')}
                        </span>
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
                      {/* Edit button */}
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
                      
                      {/* Delete button */}
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
  )
}
