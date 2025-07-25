'use client'

import { useState, useEffect } from 'react'
import { CategorySummary, MonthlySummary } from '../types'
import { fetchCategorySummary, fetchMonthlySummary } from '../lib/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function Reports() {
  const [expenseSummary, setExpenseSummary] = useState<CategorySummary[]>([])
  const [incomeSummary, setIncomeSummary] = useState<CategorySummary[]>([])
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadData()
  }, [selectedPeriod, selectedYear])

  const loadData = async () => {
    try {
      setLoading(true)
      
      let startDate = ''
      let endDate = ''
      
      if (selectedPeriod === 'thisMonth') {
        const now = new Date()
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      } else if (selectedPeriod === 'thisYear') {
        startDate = `${selectedYear}-01-01`
        endDate = `${selectedYear}-12-31`
      }

      const [expenseData, incomeData, monthlyData] = await Promise.all([
        fetchCategorySummary({ type: 'expense', startDate, endDate }),
        fetchCategorySummary({ type: 'income', startDate, endDate }),
        fetchMonthlySummary(selectedYear)
      ])
      
      setExpenseSummary(expenseData.filter(item => item.totalAmount > 0))
      setIncomeSummary(incomeData.filter(item => item.totalAmount > 0))
      setMonthlySummary(monthlyData)
    } catch (error) {
      console.error('レポートデータ取得エラー:', error)
    } finally {
      setLoading(false)
    }
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
    '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#6B7280'
  ]

  const INCOME_COLORS = [
    '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#6B7280'
  ]

  // 円グラフ用データ変換
  const expensePieData = expenseSummary.map((item, index) => ({
    name: item.categoryName,
    value: item.totalAmount,
    color: EXPENSE_COLORS[index % EXPENSE_COLORS.length],
    icon: item.categoryIcon
  }))

  const incomePieData = incomeSummary.map((item, index) => ({
    name: item.categoryName,
    value: item.totalAmount,
    color: INCOME_COLORS[index % INCOME_COLORS.length],
    icon: item.categoryIcon
  }))

  // 月別データ変換
  const monthlyChartData = monthlySummary.map(item => ({
    month: `${item.month}月`,
    収入: item.totalIncome,
    支出: item.totalExpense,
    収支: item.balance
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {formatAmount(data.value)} ({((data.value / (expensePieData.reduce((sum, item) => sum + item.value, 0) || incomePieData.reduce((sum, item) => sum + item.value, 0))) * 100).toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">レポートを生成中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end items-center">
        <div className="flex space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field w-auto"
          >
            <option value="thisMonth">今月</option>
            <option value="thisYear">今年</option>
          </select>
          
          {selectedPeriod === 'thisYear' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="input-field w-auto"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 円グラフセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 支出円グラフ */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <div className="w-4 h-4 bg-expense-500 rounded-full"></div>
            <span>支出内訳</span>
          </h3>
          
          {expensePieData.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500">支出データがありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                {expensePieData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatAmount(item.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 収入円グラフ */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <div className="w-4 h-4 bg-income-500 rounded-full"></div>
            <span>収入内訳</span>
          </h3>
          
          {incomePieData.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500">収入データがありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {incomePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                {incomePieData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatAmount(item.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 月別推移グラフ */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>月別収支推移 ({selectedYear}年)</span>
        </h3>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}K`} />
              <Tooltip 
                formatter={(value: number) => [formatAmount(value), '']}
                labelStyle={{ color: '#374151' }}
              />
              <Legend />
              <Bar dataKey="収入" fill="#10B981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="支出" fill="#EF4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}