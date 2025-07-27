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

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      // 既存のAPIを使用（後でバックエンドを拡張）
      const data = await fetchFixedExpenses()
      // 仮のtypeフィールドを追加（実際のデータ構造に合わせて調整）
      const transactionsWithType = data.map(item => ({
        ...item,
        type: 'expense' as const // 既存データは全て支出として扱う
      }))
      setTransactions(transactionsWithType)
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
    const formatted = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
    
    return type === 'income' ? `+${formatted}` : formatted
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
        <h2 className="text-xl font-semibold text-gray-900">固定収支管理</h2>
        <button
          onClick={onAddTransaction}
          className="btn-primary flex items-center text-sm"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          追加
        </button>
      </div>

      {/* サマリー表示 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-2 mb-1">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
            <div className="text-sm text-green-600">固定収入</div>
          </div>
          <div className="text-xl font-bold text-green-800">
            {formatAmount(totalIncome, 'income')}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {activeTransactions.filter(t => t.type === 'income').length}件
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center space-x-2 mb-1">
            <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
            <div className="text-sm text-red-600">固定支出</div>
          </div>
          <div className="text-xl font-bold text-red-800">
            {formatAmount(totalExpense, 'expense')}
          </div>
          <div className="text-xs text-red-600 mt-1">
            {activeTransactions.filter(t => t.type === 'expense').length}件
          </div>
        </div>

        <div className={`rounded-lg p-4 border ${
          netAmount >= 0 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-center space-x-2 mb-1">
            <div className={`text-sm ${
              netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}>
              純収支
            </div>
          </div>
          <div className={`text-xl font-bold ${
            netAmount >= 0 ? 'text-blue-800' : 'text-orange-800'
          }`}>
            {formatAmount(Math.abs(netAmount), netAmount >= 0 ? 'income' : 'expense')}
          </div>
          <div className={`text-xs mt-1 ${
            netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}>
            {netAmount >= 0 ? '黒字' : '赤字'}
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
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">全て</option>
              <option value="income">収入のみ</option>
              <option value="expense">支出のみ</option>
            </select>
            <span className="text-sm text-gray-600">
              {filteredTransactions.length}件表示
            </span>
          </div>
          <button
            onClick={toggleSortOrder}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
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

      {/* 固定収支リスト */}
      <div className="space-y-1.5">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
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
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              最初の固定収支を追加する
            </button>
          </div>
        ) : (
          sortedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`border rounded-md p-2 ${
                transaction.isActive ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${
                      transaction.type === 'income' 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowTrendingUpIcon className="w-2.5 h-2.5 text-white" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-2.5 h-2.5 text-white" />
                      )}
                    </div>
                    {transaction.category && (
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: transaction.category.color }}
                        title={transaction.category.name}
                      >
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-sm font-medium truncate ${
                          transaction.isActive ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {transaction.name}
                        </h3>
                        {transaction.category && (
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {transaction.category.name}
                          </span>
                        )}
                      </div>
                      {transaction.description && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      transaction.isActive 
                        ? transaction.type === 'income' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {formatAmount(transaction.amount, transaction.type)}
                    </div>
                    {!transaction.isActive && (
                      <div className="text-xs text-gray-400">無効</div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEditTransaction?.(transaction)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="編集"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    
                    {deleteConfirm === transaction.id ? (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          disabled={deleting === transaction.id}
                          className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleting === transaction.id ? '削除中' : '削除'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs bg-gray-300 text-gray-700 px-1.5 py-0.5 rounded hover:bg-gray-400"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(transaction.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="削除"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 固定収支管理のヒント */}
      {transactions.length > 0 && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                固定収支管理のポイント
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
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