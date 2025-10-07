'use client'

import { useState, useEffect } from 'react'
import { FixedTransaction } from '../../types'

const mapFixedExpenseToTransaction = (expense: any): FixedTransaction => ({
  id: expense.id,
  name: expense.name,
  amount: expense.amount,
  type: expense.type,
  categoryId: expense.categoryId,
  category: expense.category,
  description: expense.description,
  isActive: expense.isActive,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt,
})
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
import CategoryFixedTransactionsEditor from './CategoryFixedTransactionsEditor'

interface FixedTransactionsListProps {
  onAddTransaction?: () => void
  onEditTransaction?: (transaction: FixedTransaction) => void
  onTransactionsUpdated?: () => void
}

// Manage recurring income/expense entries with filtering, sorting, and edit modals
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
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorItems, setEditorItems] = useState<FixedTransaction[]>([])

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
      setTransactions(data.map(mapFixedExpenseToTransaction))
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
    const roundedAmount = Math.round(amount)
    const formatted = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(roundedAmount)
    
    return type === 'income' ? `+${formatted}` : formatted
  }

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
  }

  const toggleCategoryExpansion = (categoryId: number) => {
    const next = new Set(expandedCategories)
    if (next.has(categoryId)) next.delete(categoryId)
    else next.add(categoryId)
    setExpandedCategories(next)
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

  // カテゴリごとにグループ化（カテゴリIDで安定化）
  const groupedTransactions = sortedTransactions.reduce((groups, transaction) => {
    const categoryId = transaction.category?.id ?? 0
    const categoryName = transaction.category?.name || 'その他'
    const categoryColor = transaction.category?.color || (transaction.type === 'income' ? '#22c55e' : '#ef4444')

    if (!groups[categoryId]) {
      groups[categoryId] = {
        categoryId,
        categoryName,
        categoryColor,
        transactions: [],
        total: 0,
        count: 0,
      }
    }

    const g = groups[categoryId]
    g.transactions.push(transaction)
    if (transaction.isActive) {
      g.total += transaction.amount
      g.count += 1
    }
    return groups
  }, {} as Record<number, { categoryId: number; categoryName: string; categoryColor: string; transactions: FixedTransaction[]; total: number; count: number }>)

  const groupedEntries = Object.values(groupedTransactions).sort((a, b) => {
    return sortOrder === 'desc' ? b.total - a.total : a.total - b.total
  })

  // アイテム数に応じた列数を決定する関数
  const getGridColumns = (itemCount: number) => {
    if (itemCount === 1) return 'grid-cols-1'
    if (itemCount === 2) return 'grid-cols-2'
    if (itemCount === 3) return 'grid-cols-3'
    if (itemCount === 4) return 'grid-cols-2'
    if (itemCount === 5) return 'grid-cols-3'
    if (itemCount === 6) return 'grid-cols-3'
    if (itemCount === 7) return 'grid-cols-2'
    if (itemCount === 8) return 'grid-cols-3'
    if (itemCount === 9) return 'grid-cols-3'
    if (itemCount === 10) return 'grid-cols-2'
    if (itemCount === 11) return 'grid-cols-3'
    if (itemCount === 12) return 'grid-cols-3'
    
    // 13以降は2列、3列、3列の順で繰り返し
    const remainder = (itemCount - 13) % 3
    if (remainder === 0) return 'grid-cols-2'  // 13, 16, 19, ...
    return 'grid-cols-3'  // 14, 15, 17, 18, 20, 21, ...
  }

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
    <>
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* ヘッダー（他ページと統一したカードヘッダー） */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">固定収支管理</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">毎月の定期収支を管理</p>
          </div>
          <button
            onClick={onAddTransaction}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>追加</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* サマリー（他ページのカードUIに合わせて簡素な統一スタイル） */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">固定収入</div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {activeTransactions.filter(t => t.type === 'income').length}件
              </div>
            </div>
            <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
              {formatAmount(totalIncome, 'income')}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <ArrowTrendingDownIcon className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">固定支出</div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {activeTransactions.filter(t => t.type === 'expense').length}件
              </div>
            </div>
            <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
              {formatAmount(totalExpense, 'expense')}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${netAmount >= 0 ? 'bg-blue-500' : 'bg-orange-500'}` }>
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">純収支</div>
              </div>
              <div className={`text-xs ${netAmount >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {netAmount >= 0 ? '黒字' : '赤字'}
              </div>
            </div>
            <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
              {formatAmount(Math.abs(netAmount), netAmount >= 0 ? 'income' : 'expense')}
            </div>
          </div>
        </div>

        {/* フィルターとソート */}
        {transactions.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全て</option>
                <option value="income">収入のみ</option>
                <option value="expense">支出のみ</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                {filteredTransactions.length}件表示
              </span>
            </div>
            <button
              onClick={toggleSortOrder}
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg"
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
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {filterType === 'all' 
                  ? '固定収支が登録されていません' 
                  : filterType === 'income' 
                    ? '固定収入が登録されていません'
                    : '固定支出が登録されていません'
                }
              </h3>
              <p className="text-sm mb-4">定期的な収入や支出を登録して家計を管理しましょう</p>
              <button
                onClick={onAddTransaction}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                最初の固定収支を追加する
              </button>
            </div>
          ) : (
            <div className={`grid ${getGridColumns(groupedEntries.length)} gap-4`}>
              {groupedEntries.map((group) => {
                const isExpanded = expandedCategories.has(group.categoryId)
                const hasMultipleItems = group.transactions.length > 1

                return (
                  <div 
                    key={group.categoryId} 
                    className={`relative rounded-lg p-4 transition-all duration-200 hover:shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`}
                    style={{
                      borderLeftColor: group.categoryColor,
                      borderLeftWidth: '4px',
                      minHeight: '120px'
                    }}
                  >
                    {/* メインコンテンツ */}
                    <div className="flex items-start justify-between h-full">
                      {/* 左側：アイコンとカテゴリ情報 */}
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        {/* アイコン */}
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: hexToRgba(group.categoryColor, 0.2) }}
                        >
                          {getCategoryIcon(group.categoryName, group.categoryColor, 20)}
                        </div>
                        
                        {/* カテゴリ名と詳細 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {group.categoryName}
                            </h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium flex-shrink-0">
                              {group.transactions.length}件
                            </span>
                            <button
                              type="button"
                              onClick={() => { setEditorItems(group.transactions); setEditorOpen(true) }}
                              className="ml-2 text-[11px] px-2 py-0.5 rounded border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:bg-blue-900/20"
                            >
                              修正
                            </button>
                          </div>
                          
                          {/* 詳細項目 */}
                          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {isExpanded ? (
                              // 展開時：全ての項目を表示
                              group.transactions.map((transaction, index) => (
                                <div key={transaction.id} className="flex items-center justify-between py-1 px-2 rounded">
                                  <span className={!transaction.isActive ? 'opacity-60' : ''}>
                                    • {transaction.name}
                                    {transaction.description && ` (${transaction.description})`}
                                  </span>
                                  <span className={`font-medium ml-2 ${
                                    transaction.isActive 
                                      ? transaction.type === 'income' 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                      : 'text-gray-500 dark:text-gray-400'
                                  }`}>
                                    {formatAmount(transaction.amount, transaction.type)}
                                  </span>
                                </div>
                              ))
                            ) : (
                              // 通常時：最大2つまで表示
                              <>
                                {group.transactions.slice(0, 2).map((transaction, index) => (
                                  <div key={transaction.id} className="truncate">
                                    • {transaction.name}
                                    {transaction.description && ` (${transaction.description})`}
                                  </div>
                                ))}
                                {group.transactions.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => toggleCategoryExpansion(group.categoryId)}
                                    className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors text-xs"
                                  >
                                    他{group.transactions.length - 2}件を表示...
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 右側：金額と展開ボタン */}
                      <div className="text-right flex-shrink-0 ml-4 flex flex-col items-end">
                        <div className={`text-lg font-bold mb-2 ${
                          group.total >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatAmount(Math.abs(group.total), group.total >= 0 ? 'income' : 'expense')}
                        </div>
                        
                        {/* 展開/折りたたみボタン */}
                        {hasMultipleItems && (
                          <button
                            type="button"
                            onClick={() => toggleCategoryExpansion(group.categoryId)}
                            className="cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center"
                          >
                            {isExpanded ? (
                              <>
                                <ArrowUpIcon className="w-3 h-3 mr-1" />
                                折りたたむ
                              </>
                            ) : (
                              <>
                                <ArrowDownIcon className="w-3 h-3 mr-1" />
                                展開
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* アクションボタン（ホバー時に表示） */}
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={onAddTransaction}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors bg-white dark:bg-gray-800 rounded-md shadow-sm"
                        title="項目を追加"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        onClick={() => onEditTransaction?.(group.transactions[0])}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-gray-800 rounded-md shadow-sm"
                        title="編集"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* ホバー効果用のレイヤー（イベント透過） */}
                    <div className="pointer-events-none absolute inset-0 rounded-xl group"></div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ヒントセクションは非表示（仕様変更） */}
      </div>
    </div>
    {/* カテゴリ一括修正モーダル */}
    <CategoryFixedTransactionsEditor
      isOpen={editorOpen}
      onClose={() => setEditorOpen(false)}
      transactions={editorItems}
      onSaved={async () => {
        await loadTransactions()
        onTransactionsUpdated?.()
      }}
    />
    </>
  )
}
