'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import TabNavigation from '../components/TabNavigation'
import TransactionList from '../components/TransactionList'
import AddTransactionModal from '../components/AddTransactionModal'
import SettingsModal from '../components/SettingsModal'
import { Transaction, Category, CategorySummary, MonthlySummary } from '../types'
import { fetchTransactions, fetchCategories, fetchCategorySummary, fetchMonthlySummary } from '../lib/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [expenseSummary, setExpenseSummary] = useState<CategorySummary[]>([])
  const [incomeSummary, setIncomeSummary] = useState<CategorySummary[]>([])
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // 今月のデータを取得
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      
      const [transactionsData, categoriesData, expenseData, incomeData, monthlyData] = await Promise.all([
        fetchTransactions({ limit: 100 }),
        fetchCategories(),
        fetchCategorySummary({ type: "expense", startDate, endDate }),
        fetchCategorySummary({ type: "income", startDate, endDate }),
        fetchMonthlySummary(now.getFullYear())
      ])
      
      setTransactions(transactionsData)
      setCategories(categoriesData)
      setExpenseSummary(expenseData.filter((item) => item.totalAmount > 0))
      setIncomeSummary(incomeData.filter((item) => item.totalAmount > 0))
      setMonthlySummary(monthlyData)
    } catch (error) {
      console.error('データ取得エラー:', error)
      if (error instanceof Error && error.message.includes('401')) {
        localStorage.removeItem('token')
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionAdded = () => {
    setIsAddModalOpen(false)
    loadData()
  }

  const handleTransactionUpdated = () => {
    loadData()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // 円グラフ用のカラーパレット
  const EXPENSE_COLORS = [
    "#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6",
    "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16", "#6B7280",
  ]

  const INCOME_COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#6B7280"]

  // 円グラフ用データ変換（価格の大きい順にソート）
  const expensePieData = expenseSummary
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .map((item, index) => ({
      name: item.categoryName,
      value: item.totalAmount,
      color: EXPENSE_COLORS[index % EXPENSE_COLORS.length],
      icon: item.categoryIcon,
    }))

  const incomePieData = incomeSummary
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .map((item, index) => ({
      name: item.categoryName,
      value: item.totalAmount,
      color: INCOME_COLORS[index % INCOME_COLORS.length],
      icon: item.categoryIcon,
    }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {formatAmount(data.value)} (
            {(
              (data.value /
                (expensePieData.reduce((sum, item) => sum + item.value, 0) ||
                  incomePieData.reduce((sum, item) => sum + item.value, 0))) *
              100
            ).toFixed(1)}
            %)
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onAddTransaction={() => setIsAddModalOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <TabNavigation />
      
      <main className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* レポート部分 - 支出内訳・収入内訳・月別収支推移 */}
          <div className="xl:col-span-2 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 支出内訳 */}
              <div className="card">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>支出内訳</span>
                </h3>

                {expensePieData.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="w-8 h-8 text-gray-400 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">支出データがありません</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expensePieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={60}
                            paddingAngle={0}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                          >
                            {expensePieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="none"
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-1">
                      {expensePieData.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-1"
                        >
                          <div className="flex items-center space-x-1.5">
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.name}</span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            {formatAmount(item.value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 収入内訳 */}
              <div className="card">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>収入内訳</span>
                </h3>

                {incomePieData.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="w-8 h-8 text-gray-400 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">収入データがありません</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={incomePieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={60}
                            paddingAngle={0}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                          >
                            {incomePieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="none"
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-1">
                      {incomePieData.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-1"
                        >
                          <div className="flex items-center space-x-1.5">
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.name}</span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            {formatAmount(item.value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 月別収支推移 */}
            <div className="card">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>月別収支推移 ({new Date().getFullYear()}年)</span>
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlySummary.map((item) => ({
                      month: `${item.month}月`,
                      収入: item.totalIncome,
                      支出: item.totalExpense,
                      収支: item.balance,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatAmount(value), ""]}
                      labelStyle={{ color: "#374151" }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="収入" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="支出" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="収支" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 取引履歴部分 - 右側縦長 */}
          <div className="xl:col-span-1">
            <TransactionList 
              transactions={transactions}
              categories={categories}
              onTransactionUpdated={handleTransactionUpdated}
            />
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <AddTransactionModal
          categories={categories}
          onClose={() => setIsAddModalOpen(false)}
          onTransactionAdded={handleTransactionAdded}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}