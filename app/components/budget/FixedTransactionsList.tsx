'use client'

import { useState, useEffect } from 'react'
import { FixedTransaction } from '../../types'
import { fetchFixedExpenses, deleteFixedExpense } from '../../lib/api'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
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

interface FixedTransactionsListProps {
  onAddTransaction?: () => void
  onEditTransaction?: (transaction: FixedTransaction) => void
  onTransactionsUpdated?: () => void
}

export default function FixedTransactionsList({ 
  onAddTransaction, 
  onEditTransaction, 
  onTransactionsUpdated 
}: FixedTransactionsListProps) {
  const [transactions, setTransactions] = useState<FixedTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')

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

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const data = await fetchFixedExpenses()
      // バックエンドから取得したtypeフィールドをそのまま使用
      setTransactions(data)
    } catch (error) {
      console.error('固定収支データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setDeleting(id)
      await deleteFixedExpense(id)
      await loadTransactions()
      setDeleteConfirm(null)
      
      if (onTransactionsUpdated) {
        onTransactionsUpdated()
      }
    } catch (error) {
      console.error('固定収支の削除に失敗しました:', error)
    } finally {
      setDeleting(null)
    }
  }

  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    // 数値の精度問題を回避するため、整数に丸める
    const roundedAmount = Math.round(amount)
    const formatted = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(roundedAmount)
    
    return type === 'income' ? `+${formatted}` : formatted
  }

  // 16進数カラーコードをRGBAに変換する関数
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
  }

  // フィルタリングとソート
  const filteredTransactions = transactions.filter(transaction => {
    if (filterType === 'all') return true
    return transaction.type === filterType
  })

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.amount - a.amount
    } else {
      return a.amount - b.amount
    }
  })

  // カテゴリごとにグループ化
  const groupedTransactions = sortedTransactions.reduce((groups, transaction) => {
    const categoryName = transaction.category?.name || 'その他'
    const categoryId = transaction.category?.id || 0
    const categoryColor = transaction.category?.color || (transaction.type === 'income' ? '#22c55e' : '#ef4444')
    
    if (!groups[categoryName]) {
      groups[categoryName] = {
        categoryId,
        categoryName,
        categoryColor,
        transactions: [],
        total: 0,
        count: 0
      }
    }
    
    groups[categoryName].transactions.push(transaction)
    groups[categoryName].total += transaction.isActive ? transaction.amount : 0
    groups[categoryName].count += transaction.isActive ? 1 : 0
    
    return groups
  }, {} as Record<string, {
    categoryId: number
    categoryName: string
    categoryColor: string
    transactions: FixedTransaction[]
    total: number
    count: number
  }>)

  const groupedEntries = Object.entries(groupedTransactions).sort((a, b) => {
    if (sortOrder === 'desc') {
      return b[1].total - a[1].total
    } else {
      return a[1].total - b[1].total
    }
  })

  // 合計計算
  const activeTransactions = transactions.filter(t => t.isActive)
  const totalIncome = activeTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = activeTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const netAmount = totalIncome - totalExpense

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">固定収支管理</h2>
              <p className="text-blue-100 text-sm">毎月の定期収支を管理</p>
            </div>
          </div>
          <button
            onClick={onAddTransaction}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-200 backdrop-blur-sm"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="font-medium">追加</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* サマリー表示 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm font-medium text-green-700 dark:text-green-300">固定収入</div>
              </div>
              <div className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                {activeTransactions.filter(t => t.type === 'income').length}件
              </div>
            </div>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {formatAmount(totalIncome, 'income')}
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-4 border border-red-200/50 dark:border-red-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <ArrowTrendingDownIcon className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm font-medium text-red-700 dark:text-red-300">固定支出</div>
              </div>
              <div className="text-xs bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">
                {activeTransactions.filter(t => t.type === 'expense').length}件
              </div>
            </div>
            <div className="text-2xl font-bold text-red-800 dark:text-red-200">
              {formatAmount(totalExpense, 'expense')}
            </div>
          </div>

          <div className={`rounded-xl p-4 border ${
            netAmount >= 0 
              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-700/50' 
              : 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200/50 dark:border-orange-700/50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  netAmount >= 0 ? 'bg-blue-500' : 'bg-orange-500'
                }`}>
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className={`text-sm font-medium ${
                  netAmount >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'
                }`}>
                  純収支
                </div>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                netAmount >= 0 
                  ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300' 
                  : 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300'
              }`}>
                {netAmount >= 0 ? '黒字' : '赤字'}
              </div>
            </div>
            <div className={`text-2xl font-bold ${
              netAmount >= 0 ? 'text-blue-800 dark:text-blue-200' : 'text-orange-800 dark:text-orange-200'
            }`}>
              {formatAmount(Math.abs(netAmount), netAmount >= 0 ? 'income' : 'expense')}
            </div>
          </div>
        </div>

      {/* フィルターとソート */}
      {transactions.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">全て</option>
              <option value="income">収入のみ</option>
              <option value="expense">支出のみ</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredTransactions.length}件表示
            </span>
          </div>
          <button
            onClick={toggleSortOrder}
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {sortOrder === 'desc' ? (
              <>
                <ArrowDownIcon className="w-4 h-4 mr-1" />
                高い順
              </>
            ) : (
              <>
                <ArrowUpIcon className="w-4 h-4 mr-1" />
                安い順
              </>
            )}
          </button>
        </div>
      )}

      {/* カテゴリ別固定収支リスト */}
      <div>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">💰</div>
            <p>
              {filterType === 'all' 
                ? '固定収支が登録されていません' 
                : filterType === 'income' 
                  ? '固定収入が登録されていません'
                  : '固定支出が登録されていません'
              }
            </p>
            <button
              onClick={onAddTransaction}
              className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
            >
              最初の固定収支を追加する
            </button>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {groupedEntries.map(([categoryName, group]) => (
              <div key={categoryName} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 break-inside-avoid mb-4">
                {/* カテゴリヘッダー */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center justify-center w-5 h-5">
                      {getCategoryIcon(categoryName, group.categoryColor, 20)}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {categoryName}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {group.count}件
                    </span>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        group.total >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatAmount(Math.abs(group.total), group.total >= 0 ? 'income' : 'expense')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* カテゴリ内の取引リスト */}
                <div className="space-y-2">
                  {group.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`rounded-md p-2 transition-colors ${
                        !transaction.isActive ? 'opacity-60' : ''
                      }`}
                      style={{
                        backgroundColor: hexToRgba(group.categoryColor, 0.1),
                        borderLeft: `3px solid ${group.categoryColor}`
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1 mb-1">
                            <h4 className={`text-sm font-medium truncate ${
                              transaction.isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {transaction.name}
                            </h4>
                            <span className={`text-xs px-1.5 py-0.5 rounded text-white font-medium flex-shrink-0 ${
                              transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              {transaction.type === 'income' ? '収入' : '支出'}
                            </span>
                          </div>
                          
                          <div className={`text-sm font-semibold mb-1 ${
                            transaction.isActive 
                              ? transaction.type === 'income' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {formatAmount(transaction.amount, transaction.type)}
                          </div>
                          
                          {transaction.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {transaction.description}
                            </p>
                          )}
                          
                          {!transaction.isActive && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">無効</div>
                          )}
                        </div>

                        <div className="flex flex-col space-y-1 ml-2 flex-shrink-0">
                          <button
                            onClick={() => onEditTransaction?.(transaction)}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="編集"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>
                          
                          {deleteConfirm === transaction.id ? (
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => handleDelete(transaction.id)}
                                disabled={deleting === transaction.id}
                                className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                {deleting === transaction.id ? '削除中' : '削除'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                              >
                                キャンセル
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(transaction.id)}
                              className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="削除"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 固定収支管理のヒント */}
      {transactions.length > 0 && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                固定収支管理のポイント
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• 給与や家賃などの定期的な収入・支出を管理できます</li>
                <li>• 純収支がプラスになるよう固定費を見直しましょう</li>
                <li>• 一時的に停止する場合は「無効」に設定できます</li>
                <li>• カテゴリを設定すると収支分析で詳細を確認できます</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}