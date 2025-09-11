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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

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

  const toggleCategoryExpansion = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName)
    } else {
      newExpanded.add(categoryName)
    }
    setExpandedCategories(newExpanded)
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

  // カテゴリごとにグループ化（同じカテゴリは1つのブロックにまとめる）
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
            <div className={`grid ${getGridColumns(groupedEntries.length)} gap-3`}>
              {groupedEntries.map(([categoryName, group]) => {
                const isExpanded = expandedCategories.has(categoryName)
                const hasMultipleItems = group.transactions.length > 1
                
                return (
                  <div 
                    key={categoryName} 
                    className={`relative rounded-xl p-4 transition-all duration-300 hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50 ${
                      isExpanded ? 'row-span-2' : ''
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${hexToRgba(group.categoryColor, 0.1)} 0%, ${hexToRgba(group.categoryColor, 0.05)} 100%)`,
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
                          {getCategoryIcon(categoryName, group.categoryColor, 20)}
                        </div>
                        
                        {/* カテゴリ名と詳細 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {categoryName}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full text-white font-medium flex-shrink-0 ${
                              group.transactions[0]?.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              {group.count}件
                            </span>
                          </div>
                          
                          {/* 詳細項目 */}
                          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {isExpanded ? (
                              // 展開時：全ての項目を表示
                              group.transactions.map((transaction, index) => (
                                <div key={transaction.id} className="flex items-center justify-between py-1 px-2 bg-white/50 dark:bg-gray-700/30 rounded">
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
                                    onClick={() => toggleCategoryExpansion(categoryName)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors text-xs"
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
                            onClick={() => toggleCategoryExpansion(categoryName)}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center"
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

                    {/* ホバー効果用のクラス */}
                    <div className="absolute inset-0 rounded-xl group"></div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 固定収支管理のヒント */}
        {transactions.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <ExclamationTriangleIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  💡 固定収支管理のポイント
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
    </div>
  )
}