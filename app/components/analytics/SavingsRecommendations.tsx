'use client'

import { useState, useEffect } from 'react'
import { Transaction, Category, FixedExpense } from '../../types'
import { fetchTransactions, fetchCategories, fetchFixedExpenses } from '../../lib/api'
import { 
  LightBulbIcon, 
  ExclamationTriangleIcon, 
  TrendingUpIcon,
  CurrencyYenIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface RecommendationItem {
  id: string
  type: 'fixed' | 'category' | 'frequency' | 'amount'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  potentialSavings: number
  categoryName?: string
  categoryColor?: string
  actionItems: string[]
}

export default function SavingsRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPotentialSavings, setTotalPotentialSavings] = useState(0)

  useEffect(() => {
    generateRecommendations()
  }, [])

  const generateRecommendations = async () => {
    try {
      setLoading(true)
      const [transactions, categories, fixedExpenses] = await Promise.all([
        fetchTransactions(),
        fetchCategories(),
        fetchFixedExpenses()
      ])

      const recommendations: RecommendationItem[] = []
      const now = new Date()
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

      // 1. 固定費の見直し提案
      const activeFixedExpenses = fixedExpenses.filter(fe => fe.isActive)
      const highFixedExpenses = activeFixedExpenses
        .filter(fe => fe.amount > 10000)
        .sort((a, b) => b.amount - a.amount)

      highFixedExpenses.slice(0, 3).forEach((expense, index) => {
        const potentialSavings = Math.floor(expense.amount * 0.1) // 10%削減を想定
        recommendations.push({
          id: `fixed-${expense.id}`,
          type: 'fixed',
          priority: index === 0 ? 'high' : 'medium',
          title: `${expense.name}の見直し`,
          description: `月額${formatCurrency(expense.amount)}の固定費です。プランの見直しや他社への乗り換えを検討してみましょう。`,
          potentialSavings,
          actionItems: [
            '現在のプラン内容を確認する',
            '他社の料金プランと比較する',
            '不要なオプションがないかチェックする',
            '年間契約での割引があるか確認する'
          ]
        })
      })

      // 2. カテゴリ別支出増加の警告
      const categoryMap = new Map<number, { current: number, previous: number, count: number, category: Category }>()
      
      categories.forEach(category => {
        categoryMap.set(category.id, {
          current: 0,
          previous: 0,
          count: 0,
          category
        })
      })

      transactions
        .filter(t => t.type === 'expense' && t.categoryId)
        .forEach(transaction => {
          const transactionDate = new Date(transaction.date)
          const data = categoryMap.get(transaction.categoryId!)
          
          if (data) {
            if (transactionDate >= currentMonth && transactionDate < nextMonth) {
              data.current += transaction.amount
              data.count += 1
            }
            if (transactionDate >= previousMonth && transactionDate < currentMonth) {
              data.previous += transaction.amount
            }
          }
        })

      // 支出が大幅に増加したカテゴリ
      categoryMap.forEach((data, categoryId) => {
        if (data.previous > 0 && data.current > data.previous) {
          const increasePercentage = ((data.current - data.previous) / data.previous) * 100
          
          if (increasePercentage > 30 && data.current > 5000) {
            const potentialSavings = Math.floor((data.current - data.previous) * 0.5)
            recommendations.push({
              id: `category-increase-${categoryId}`,
              type: 'category',
              priority: increasePercentage > 50 ? 'high' : 'medium',
              title: `${data.category.name}の支出急増`,
              description: `前月比${increasePercentage.toFixed(1)}%増加しています。支出内容を見直してみましょう。`,
              potentialSavings,
              categoryName: data.category.name,
              categoryColor: data.category.color,
              actionItems: [
                '最近の支出内容を詳しく確認する',
                '本当に必要な支出だったか振り返る',
                '代替手段や節約方法を検討する',
                '予算上限を設定する'
              ]
            })
          }
        }
      })

      // 3. 高頻度・少額支出の警告
      const frequentSmallExpenses = new Map<number, { count: number, total: number, category: Category }>()
      
      transactions
        .filter(t => t.type === 'expense' && t.categoryId)
        .filter(t => {
          const transactionDate = new Date(t.date)
          return transactionDate >= currentMonth && transactionDate < nextMonth
        })
        .filter(t => t.amount < 1000) // 1000円未満の少額支出
        .forEach(transaction => {
          const existing = frequentSmallExpenses.get(transaction.categoryId!)
          const category = categories.find(c => c.id === transaction.categoryId!)!
          
          if (existing) {
            existing.count += 1
            existing.total += transaction.amount
          } else {
            frequentSmallExpenses.set(transaction.categoryId!, {
              count: 1,
              total: transaction.amount,
              category
            })
          }
        })

      frequentSmallExpenses.forEach((data, categoryId) => {
        if (data.count >= 10 && data.total > 5000) { // 10回以上、合計5000円以上
          const potentialSavings = Math.floor(data.total * 0.3) // 30%削減を想定
          recommendations.push({
            id: `frequency-${categoryId}`,
            type: 'frequency',
            priority: 'medium',
            title: `${data.category.name}の頻繁な少額支出`,
            description: `今月${data.count}回、合計${formatCurrency(data.total)}の少額支出があります。`,
            potentialSavings,
            categoryName: data.category.name,
            categoryColor: data.category.color,
            actionItems: [
              '支出の頻度を意識する',
              'まとめ買いを検討する',
              '代替手段を探す',
              '支出前に一度立ち止まって考える'
            ]
          })
        }
      })

      // 4. 高額単発支出の警告
      const highAmountTransactions = transactions
        .filter(t => t.type === 'expense')
        .filter(t => {
          const transactionDate = new Date(t.date)
          return transactionDate >= currentMonth && transactionDate < nextMonth
        })
        .filter(t => t.amount > 20000) // 2万円以上の高額支出
        .sort((a, b) => b.amount - a.amount)

      highAmountTransactions.slice(0, 2).forEach((transaction, index) => {
        const category = categories.find(c => c.id === transaction.categoryId)
        const potentialSavings = Math.floor(transaction.amount * 0.2) // 20%削減を想定
        
        recommendations.push({
          id: `amount-${transaction.id}`,
          type: 'amount',
          priority: index === 0 ? 'high' : 'medium',
          title: `高額支出の見直し`,
          description: `${category?.name || '未分類'}で${formatCurrency(transaction.amount)}の支出がありました。`,
          potentialSavings,
          categoryName: category?.name,
          categoryColor: category?.color,
          actionItems: [
            '本当に必要な支出だったか確認する',
            '他の選択肢がなかったか検討する',
            '次回は事前に予算を設定する',
            '分割払いや代替案を検討する'
          ]
        })
      })

      // 優先度順にソート
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])

      const totalSavings = recommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0)
      
      setRecommendations(recommendations)
      setTotalPotentialSavings(totalSavings)
    } catch (error) {
      console.error('削減提案の生成に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      case 'medium':
        return <LightBulbIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <ChartBarIcon className="w-5 h-5 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高優先度'
      case 'medium':
        return '中優先度'
      default:
        return '低優先度'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 削減ポテンシャルサマリー */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg border border-green-200 dark:border-green-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CurrencyYenIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">削減ポテンシャル</h3>
            <p className="text-sm text-green-700 dark:text-green-300">以下の提案を実行することで期待できる節約効果</p>
          </div>
        </div>
        
        <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-2">
          {formatCurrency(totalPotentialSavings)}/月
        </div>
        <div className="text-sm text-green-700 dark:text-green-300">
          年間では約{formatCurrency(totalPotentialSavings * 12)}の節約が期待できます
        </div>
      </div>

      {/* 削減提案リスト */}
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">素晴らしい家計管理です！</h3>
            <p className="text-gray-600 dark:text-gray-400">現在、特に大きな削減提案はありません。このまま良い家計管理を続けてください。</p>
          </div>
        ) : (
          recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`rounded-lg border p-6 ${getPriorityColor(recommendation.priority)}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getPriorityIcon(recommendation.priority)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{recommendation.title}</h4>
                      {recommendation.categoryColor && (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: recommendation.categoryColor }}
                        />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{getPriorityText(recommendation.priority)}</div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(recommendation.potentialSavings)}/月
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{recommendation.description}</p>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">推奨アクション:</h5>
                    <ul className="space-y-1">
                      {recommendation.actionItems.map((action, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-gray-400 mt-1">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 節約のコツ */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <LightBulbIcon className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">節約のコツ</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">固定費の見直し</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• 携帯電話プランの最適化</li>
              <li>• 保険の見直し</li>
              <li>• サブスクリプションの整理</li>
              <li>• 光熱費の節約対策</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">変動費の管理</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• 予算上限の設定</li>
              <li>• まとめ買いの活用</li>
              <li>• 代替手段の検討</li>
              <li>• 支出前の一時停止</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}