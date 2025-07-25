'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BudgetAnalysis, FixedExpense, Category, CategoryBudget } from '../types'
import { fetchBudgetAnalysis, fetchCategories } from '../lib/api'
import Header from '../components/Header'
import TabNavigation from '../components/TabNavigation'
import AddTransactionModal from '../components/AddTransactionModal'
import BudgetOverview from '../components/budget/BudgetOverview'
import BudgetProgress from '../components/budget/BudgetProgress'
import BudgetAlerts from '../components/budget/BudgetAlerts'
import BudgetSettings from '../components/budget/BudgetSettings'
import FixedExpensesList from '../components/budget/FixedExpensesList'
import FixedExpenseModal from '../components/budget/FixedExpenseModal'
import BudgetHistory from '../components/budget/BudgetHistory'
import CategoryBudgetOverview from '../components/budget/CategoryBudgetOverview'
import CategoryBudgetList from '../components/budget/CategoryBudgetList'
import CategoryBudgetModal from '../components/budget/CategoryBudgetModal'
import { CurrencyDollarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

export default function BudgetPage() {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [showCategoryBudgetModal, setShowCategoryBudgetModal] = useState(false)
  const [editingCategoryBudget, setEditingCategoryBudget] = useState<CategoryBudget | null>(null)

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
      const [categoriesData] = await Promise.all([
        fetchCategories()
      ])
      setCategories(categoriesData)
      await loadBudgetAnalysis()
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

  const loadBudgetAnalysis = async () => {
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      
      const data = await fetchBudgetAnalysis(year, month)
      setAnalysis(data)
    } catch (error) {
      console.error('予算分析データの取得に失敗しました:', error)
    }
  }

  const handleTransactionAdded = () => {
    setIsAddModalOpen(false)
    loadData()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onAddTransaction={() => setIsAddModalOpen(true)}
        onLogout={handleLogout}
      />
      <TabNavigation />
      
      <main className="px-4 sm:px-6 lg:px-8 py-4">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <CurrencyDollarIcon className="w-8 h-8 mr-3" />
                予算管理
              </h1>
              <p className="mt-2 text-gray-600">
                月次予算と固定費を設定して、計画的な家計管理を行いましょう
              </p>
            </div>
            <button className="btn-secondary flex items-center">
              <Cog6ToothIcon className="w-4 h-4 mr-2" />
              設定
            </button>
          </div>
        </div>

        {/* アラート表示 */}
        <div className="mb-6">
          <BudgetAlerts analysis={analysis} />
        </div>

        {/* 全体予算セクション */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* 左カラム: 予算概要 */}
          <div className="lg:col-span-1">
            <BudgetOverview />
          </div>

          {/* 中央カラム: 予算進捗 */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">予算進捗</h2>
              {analysis ? (
                <BudgetProgress analysis={analysis} />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  予算データを読み込み中...
                </div>
              )}
            </div>
          </div>

          {/* 右カラム: 設定エリア */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* 予算設定 */}
              <BudgetSettings onBudgetUpdated={loadBudgetAnalysis} />

              {/* 固定費管理 */}
              <FixedExpensesList 
                onAddExpense={() => setShowExpenseModal(true)}
                onEditExpense={(expense) => {
                  setEditingExpense(expense)
                  setShowExpenseModal(true)
                }}
                onExpensesUpdated={loadBudgetAnalysis}
              />
            </div>
          </div>
        </div>

        {/* カテゴリ別予算セクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* カテゴリ別予算概要 */}
          <div>
            <CategoryBudgetOverview />
          </div>

          {/* カテゴリ別予算リスト */}
          <div>
            <CategoryBudgetList
              categories={categories}
              onAddBudget={() => setShowCategoryBudgetModal(true)}
              onEditBudget={(budget) => {
                setEditingCategoryBudget(budget)
                setShowCategoryBudgetModal(true)
              }}
              onBudgetUpdated={loadBudgetAnalysis}
            />
          </div>
        </div>

        {/* 予算履歴セクション */}
        <div className="mt-12">
          <BudgetHistory />
        </div>
      </main>

      {/* 固定費モーダル */}
      <FixedExpenseModal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false)
          setEditingExpense(null)
        }}
        expense={editingExpense}
        onSaved={() => {
          loadBudgetAnalysis()
          setEditingExpense(null)
        }}
      />

      {/* カテゴリ別予算モーダル */}
      <CategoryBudgetModal
        isOpen={showCategoryBudgetModal}
        onClose={() => {
          setShowCategoryBudgetModal(false)
          setEditingCategoryBudget(null)
        }}
        categories={categories}
        budget={editingCategoryBudget}
        onSaved={() => {
          loadBudgetAnalysis()
          setEditingCategoryBudget(null)
        }}
      />

      {/* 取引追加モーダル */}
      {isAddModalOpen && (
        <AddTransactionModal
          categories={categories}
          onClose={() => setIsAddModalOpen(false)}
          onTransactionAdded={handleTransactionAdded}
        />
      )}
    </div>
  )
}