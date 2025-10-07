"use client"

/**
 * Analytics renders lightweight spending/earning breakdowns for the dashboard.
 *  - Aggregates expense and income categories, folding in active fixed costs.
 *  - Intended as a quick overview card rather than the full analytics page.
 */

import { useState, useEffect } from 'react'
import { CategorySummary, FixedExpense } from '../types'
import { fetchCategorySummary, fetchFixedExpenses } from '../lib/api'
import { ChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
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

export default function Analytics() {
  const [expenseSummary, setExpenseSummary] = useState<CategorySummary[]>([])
  const [incomeSummary, setIncomeSummary] = useState<CategorySummary[]>([])
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [loading, setLoading] = useState(true)

  // Map category names to lucide-react icons
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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [expenseData, incomeData, fixedExpensesData] = await Promise.all([
        fetchCategorySummary({ type: 'expense' }),
        fetchCategorySummary({ type: 'income' }),
        fetchFixedExpenses()
      ])
      setExpenseSummary(expenseData)
      setIncomeSummary(incomeData)
      setFixedExpenses(Array.isArray(fixedExpensesData) ? fixedExpensesData : [])
    } catch (error) {
      console.error('Failed to fetch analytics summary data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
      </div>
    )
  }

  // Aggregate active fixed expenses by category for display
  const fixedExpensesByCategory = fixedExpenses
    .filter(expense => expense.isActive)
    .reduce((acc, expense) => {
      if (expense.categoryId) {
        acc[expense.categoryId] = (acc[expense.categoryId] || 0) + expense.amount
      }
      return acc
    }, {} as Record<number, number>)

  // Fold fixed expenses into the expense summary
  const expenseSummaryWithFixed = expenseSummary.map(item => ({
    ...item,
    totalAmount: item.totalAmount + (fixedExpensesByCategory[item.categoryId] || 0)
  }))

  const totalExpense = expenseSummaryWithFixed.reduce((sum, item) => sum + item.totalAmount, 0)
  const totalIncome = incomeSummary.reduce((sum, item) => sum + item.totalAmount, 0)

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
        <ChartBarIcon className="w-6 h-6 mr-2" />
        分析
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense analysis */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CurrencyDollarIcon className="w-5 h-5 mr-2 text-red-500" />
            支出カテゴリ別
          </h3>
          {expenseSummaryWithFixed.length === 0 ? (
            <p className="text-gray-500 text-center py-8">支出データがありません</p>
          ) : (
            <div className="space-y-4">
              {expenseSummaryWithFixed.map((item) => (
                <div key={item.categoryId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center justify-center w-6 h-6">
                        {getCategoryIcon(item.categoryName, item.categoryColor, 20)}
                      </div>
                      <span className="font-medium">{item.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-expense-600">
                        {formatAmount(item.totalAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {totalExpense > 0 ? Math.round((item.totalAmount / totalExpense) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${totalExpense > 0 ? (item.totalAmount / totalExpense) * 100 : 0}%`,
                        backgroundColor: item.categoryColor
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Income analysis */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-500" />
            Income by category
          </h3>
          {incomeSummary.length === 0 ? (
            <p className="text-gray-500 text-center py-8">収入データがありません</p>
          ) : (
            <div className="space-y-4">
              {incomeSummary.map((item) => (
                <div key={item.categoryId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center justify-center w-6 h-6">
                        {getCategoryIcon(item.categoryName, item.categoryColor, 20)}
                      </div>
                      <span className="font-medium">{item.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-income-600">
                        {formatAmount(item.totalAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {totalIncome > 0 ? Math.round((item.totalAmount / totalIncome) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${totalIncome > 0 ? (item.totalAmount / totalIncome) * 100 : 0}%`,
                        backgroundColor: item.categoryColor
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
