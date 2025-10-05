'use client'

import { useState, useEffect, useCallback } from 'react'
import { Transaction, Category, FixedExpense } from '../../types'
import { fetchTransactions, fetchCategories, fetchFixedExpenses } from '../../lib/api'
import { ChartPieIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, CalendarIcon } from '@heroicons/react/24/outline'
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

interface CategorySpendingData {
  categoryId: number
  categoryName: string
  categoryColor: string
  currentMonth: number
  previousMonth: number
  currentMonthSameDate: number
  previousMonthSameDate: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  sameDateTrendPercentage: number
  transactionCount: number
  averagePerTransaction: number
  percentage: number
}

export default function CategoryAnalysis() {
  const [categoryData, setCategoryData] = useState<CategorySpendingData[]>([])
  const [fixedExpensesTotal, setFixedExpensesTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [totalSpending, setTotalSpending] = useState(0)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly')

  // カテゴリアイコンのマッピング（Lucide Reactアイコンを使用）
  const getCategoryIcon = (name: string, iconColor: string = '#6B7280', size: number = 20) => {
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

  const loadCategoryData = useCallback(async () => {
    try {
      setLoading(true)
      const [transactions, categories, fixedExpenses] = await Promise.all([
        fetchTransactions(),
        fetchCategories(),
        fetchFixedExpenses()
      ])

      // 利用可能な年を取得
      const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))]
        .sort((a, b) => b - a)
      setAvailableYears(years)

      // 期間の設定
      let currentPeriodStart: Date, currentPeriodEnd: Date, previousPeriodStart: Date, previousPeriodEnd: Date

      if (viewMode === 'yearly') {
        // 年単位の場合
        currentPeriodStart = new Date(selectedYear, 0, 1)
        currentPeriodEnd = new Date(selectedYear + 1, 0, 1)
        previousPeriodStart = new Date(selectedYear - 1, 0, 1)
        previousPeriodEnd = new Date(selectedYear, 0, 1)
      } else {
        // 月単位の場合（既存のロジック）
        const now = new Date()
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 1)
      }

      // カテゴリ別支出を集計
      const categoryMap = new Map<number, CategorySpendingData>()
      
      // 現在の日付を取得
      const now = new Date()
      const currentDay = now.getDate()
      
      // 前月同日までの期間を設定
      const currentMonthSameDateEnd = new Date(now.getFullYear(), now.getMonth(), currentDay + 1)
      const previousMonthSameDateStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const previousMonthSameDateEnd = new Date(now.getFullYear(), now.getMonth() - 1, currentDay + 1)

      // 支出カテゴリのみを初期化
      categories
        .filter(category => category.type === 'expense')
        .forEach(category => {
          categoryMap.set(category.id, {
            categoryId: category.id,
            categoryName: category.name,
            categoryColor: category.color,
            currentMonth: 0,
            previousMonth: 0,
            currentMonthSameDate: 0,
            previousMonthSameDate: 0,
            trend: 'stable',
            trendPercentage: 0,
            sameDateTrendPercentage: 0,
            transactionCount: 0,
            averagePerTransaction: 0,
            percentage: 0
          })
        })

      // 取引データを集計
      transactions
        .filter(t => t.type === 'expense' && t.categoryId)
        .forEach(transaction => {
          const transactionDate = new Date(transaction.date)
          const data = categoryMap.get(transaction.categoryId!)
          
          if (data) {
            // 今月全体のデータ
            if (transactionDate >= currentPeriodStart && transactionDate < currentPeriodEnd) {
              data.currentMonth += transaction.amount
              data.transactionCount += 1
            }
            
            // 前月全体のデータ
            if (transactionDate >= previousPeriodStart && transactionDate < previousPeriodEnd) {
              data.previousMonth += transaction.amount
            }
            
            // 今月の同日までのデータ
            if (transactionDate >= currentPeriodStart && transactionDate < currentMonthSameDateEnd) {
              data.currentMonthSameDate += transaction.amount
            }
            
            // 前月の同日までのデータ
            if (transactionDate >= previousMonthSameDateStart && transactionDate < previousMonthSameDateEnd) {
              data.previousMonthSameDate += transaction.amount
            }
          }
        })

      // 固定費は既に取引データに含まれているため、別途追加する必要はない
      const activeFixedExpenses = fixedExpenses.filter(fe => fe.isActive)

      // 固定費の合計を計算（表示用）
      const fixedTotal = activeFixedExpenses.reduce((sum, fe) => sum + fe.amount, 0)
      setFixedExpensesTotal(fixedTotal)

      // トレンドと平均を計算
      let totalCurrentSpending = 0
      categoryMap.forEach(data => {
        totalCurrentSpending += data.currentMonth
        
        // 平均取引金額を計算（全取引データを使用）
        data.averagePerTransaction = data.transactionCount > 0 
          ? data.currentMonth / data.transactionCount 
          : 0

        // 前月比の計算
        if (data.previousMonth > 0) {
          const percentage = ((data.currentMonth - data.previousMonth) / data.previousMonth) * 100
          data.trendPercentage = percentage
        } else if (data.currentMonth > 0) {
          // 前月は0で今月に支出がある場合
          data.trendPercentage = 100
        }

        // 前月同日比の計算（カテゴリ別支出ランキングで使用）
        if (data.previousMonthSameDate > 0) {
          data.sameDateTrendPercentage = ((data.currentMonthSameDate - data.previousMonthSameDate) / data.previousMonthSameDate) * 100
          
          // トレンドの判定は前月同日比に基づく
          if (data.sameDateTrendPercentage > 5) {
            data.trend = 'up'
          } else if (data.sameDateTrendPercentage < -5) {
            data.trend = 'down'
          } else {
            data.trend = 'stable'
          }
        } else if (data.currentMonthSameDate > 0) {
          data.sameDateTrendPercentage = 100
          data.trend = 'up'
        } else {
          data.sameDateTrendPercentage = 0
          data.trend = 'stable'
        }
      })

      setTotalSpending(totalCurrentSpending)

      // パーセンテージを計算
      categoryMap.forEach(data => {
        data.percentage = totalCurrentSpending > 0 
          ? (data.currentMonth / totalCurrentSpending) * 100 
          : 0
      })

      // データをソート（支出額の多い順）
      const sortedData = Array.from(categoryMap.values())
        .filter(data => data.currentMonth > 0 || data.previousMonth > 0)
        .sort((a, b) => b.currentMonth - a.currentMonth)

      setCategoryData(sortedData)
    } catch (error) {
      console.error('カテゴリ分析データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedYear, viewMode])

  useEffect(() => {
    loadCategoryData()
  }, [loadCategoryData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const getTopCategories = () => categoryData.slice(0, 5)
  const getGrowingCategories = () => categoryData
    .filter(data => data.trend === 'up')
    .sort((a, b) => b.trendPercentage - a.trendPercentage)
    .slice(0, 3)

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
      {/* カテゴリ別支出ランキング */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <ChartPieIcon className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">カテゴリ別支出ランキング</h3>
        </div>

        <div className="space-y-4">
          {getTopCategories().map((data, index) => (
            <div key={data.categoryId} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-400 w-6">#{index + 1}</span>
                  <div className="flex items-center justify-center w-8 h-8">
                    {getCategoryIcon(data.categoryName, data.categoryColor, 24)}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{data.categoryName}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {data.percentage.toFixed(1)}% • {data.transactionCount}件
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data.currentMonth)}</div>
                <div className="flex items-center space-x-1">
                  {data.trend === 'up' && <ArrowTrendingUpIcon className="w-3 h-3 text-red-500" />}
                  {data.trend === 'down' && <ArrowTrendingDownIcon className="w-3 h-3 text-green-500" />}
                  <span className={`text-xs ${
                    data.trend === 'up' ? 'text-red-600 dark:text-red-400' : 
                    data.trend === 'down' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {data.trend === 'stable' ? '変化なし' : 
                     `${data.sameDateTrendPercentage > 0 ? '+' : ''}${data.sameDateTrendPercentage.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 支出増加カテゴリ */}
      {getGrowingCategories().length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <ArrowTrendingUpIcon className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">支出増加カテゴリ</h3>
          </div>

          <div className="space-y-3">
            {getGrowingCategories().map((data) => (
              <div key={data.categoryId} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6">
                    {getCategoryIcon(data.categoryName, data.categoryColor, 20)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{data.categoryName}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      前月: {formatCurrency(data.previousMonth)} → 今月: {formatCurrency(data.currentMonth)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      +{data.trendPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    +{formatCurrency(data.currentMonth - data.previousMonth)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* カテゴリ別詳細分析 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">カテゴリ別詳細分析</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">カテゴリ</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">今月支出</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">前月比</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">前月同日比</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">取引数</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">平均単価</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((data) => (
                <tr key={data.categoryId} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center justify-center w-4 h-4">
                        {getCategoryIcon(data.categoryName, data.categoryColor, 16)}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{data.categoryName}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {formatCurrency(data.currentMonth)}
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end space-x-1">
                      {data.trend === 'up' && <ArrowTrendingUpIcon className="w-3 h-3 text-red-500" />}
                      {data.trend === 'down' && <ArrowTrendingDownIcon className="w-3 h-3 text-green-500" />}
                      <span className={`text-xs ${
                        data.trend === 'up' ? 'text-red-600 dark:text-red-400' : 
                        data.trend === 'down' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {data.trend === 'stable' ? '±0%' : 
                         `${data.trendPercentage > 0 ? '+' : ''}${data.trendPercentage.toFixed(1)}%`}
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className={`text-xs ${
                      data.sameDateTrendPercentage > 5 ? 'text-red-600 dark:text-red-400' : 
                      data.sameDateTrendPercentage < -5 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {data.sameDateTrendPercentage === 0 ? '±0%' : 
                       `${data.sameDateTrendPercentage > 0 ? '+' : ''}${data.sameDateTrendPercentage.toFixed(1)}%`}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {data.transactionCount}件
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {data.averagePerTransaction > 0 ? formatCurrency(data.averagePerTransaction) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
