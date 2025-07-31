'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BudgetAnalysis, FixedExpense, FixedTransaction, Category, CategoryBudget } from '../types'
import { fetchBudgetAnalysis, fetchCategories } from '../lib/api'
import Header from '../components/Header'
import TabNavigation from '../components/TabNavigation'
import AddTransactionModal from '../components/AddTransactionModal'
import SettingsModal from '../components/SettingsModal'
import BudgetOverview from '../components/budget/BudgetOverview'
import BudgetProgress from '../components/budget/BudgetProgress'
import BudgetAlerts from '../components/budget/BudgetAlerts'
import BudgetSettings from '../components/budget/BudgetSettings'
import FixedExpensesList from '../components/budget/FixedExpensesList'
import FixedExpenseModal from '../components/budget/FixedExpenseModal'
import FixedTransactionsList from '../components/budget/FixedTransactionsList'
import FixedTransactionModal from '../components/budget/FixedTransactionModal'
import BudgetHistory from '../components/budget/BudgetHistory'
import CategoryBudgetOverview from '../components/budget/CategoryBudgetOverview'
import CategoryBudgetList from '../components/budget/CategoryBudgetList'
import CategoryBudgetModal from '../components/budget/CategoryBudgetModal'
import MonthlyBudgetReport from '../components/budget/MonthlyBudgetReport'
import { useMonthlyBudgetReport } from '../hooks/useMonthlyBudgetReport'
import { CurrencyDollarIcon, Cog6ToothIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline'

export default function BudgetPage() {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([])
  const [budgetUpdateTrigger, setBudgetUpdateTrigger] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<FixedTransaction | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showCategoryBudgetModal, setShowCategoryBudgetModal] = useState(false)
  const [editingCategoryBudget, setEditingCategoryBudget] = useState<CategoryBudget | null>(null)
  
  // 月次レポート機能
  const {
    shouldShowReport,
    reportData,
    showTestReport,
    closeReport,
    continueBudget,
    modifyBudget
  } = useMonthlyBudgetReport()

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

  const handleBudgetUpdated = () => {
    // カテゴリ予算が更新されたときに両方のコンポーネントを更新
    setBudgetUpdateTrigger(prev => prev + 1)
    loadBudgetAnalysis()
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onAddTransaction={() => setIsAddModalOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <TabNavigation />
      
      <main className="px-4 sm:px-6 lg:px-8 py-4">
        {/* アラート表示 */}
        <div className="mb-6">
          <BudgetAlerts analysis={analysis} />
        </div>

        {/* テスト用：月次レポート表示ボタン */}
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-yellow-800">テスト機能</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  月次予算レポートの表示をテストできます
                </p>
              </div>
              <button
                onClick={showTestReport}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <DocumentChartBarIcon className="w-5 h-5 mr-2" />
                月次レポートを表示
              </button>
            </div>
          </div>
        </div>

        {/* メインセクション: カテゴリ別予算 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* カテゴリ別予算概要 */}
          <div className="xl:col-span-1">
            <CategoryBudgetOverview key={budgetUpdateTrigger} />
          </div>

          {/* カテゴリ別予算リスト */}
          <div className="xl:col-span-2">
            <CategoryBudgetList
              key={budgetUpdateTrigger}
              categories={categories}
              onAddBudget={() => setShowCategoryBudgetModal(true)}
              onEditBudget={(budget) => {
                setEditingCategoryBudget(budget)
                setShowCategoryBudgetModal(true)
              }}
              onBudgetUpdated={handleBudgetUpdated}
            />
          </div>
        </div>

        {/* サブセクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 固定収支管理 */}
          <div>
            <FixedTransactionsList 
              key={`fixed-transactions-${budgetUpdateTrigger}`}
              onAddTransaction={() => setShowTransactionModal(true)}
              onEditTransaction={(transaction) => {
                setEditingTransaction(transaction)
                setShowTransactionModal(true)
              }}
              onTransactionsUpdated={handleBudgetUpdated}
            />
          </div>

          {/* 予算履歴 */}
          <div>
            <BudgetHistory />
          </div>
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
          handleBudgetUpdated()
          setEditingExpense(null)
        }}
      />

      {/* 固定収支モーダル */}
      <FixedTransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false)
          setEditingTransaction(null)
        }}
        transaction={editingTransaction}
        onSave={() => {
          handleBudgetUpdated()
          setEditingTransaction(null)
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
          handleBudgetUpdated()
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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 月次予算レポートモーダル */}
      {shouldShowReport && reportData && (
        <MonthlyBudgetReport
          isOpen={shouldShowReport}
          onClose={closeReport}
          reportData={reportData}
          onContinueBudget={continueBudget}
          onModifyBudget={modifyBudget}
        />
      )}
    </div>
  )
}