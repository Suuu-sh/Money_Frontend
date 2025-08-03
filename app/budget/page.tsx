'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BudgetAnalysis, FixedExpense, FixedTransaction, Category, CategoryBudget } from '../types'
import { fetchBudgetAnalysis, fetchCategories, processMonthlyFixedTransactions } from '../lib/api'
import Header from '../components/Header'
import TabNavigation from '../components/TabNavigation'
import AddTransactionModal from '../components/AddTransactionModal'
import SettingsModal from '../components/SettingsModal'
import BudgetAlerts from '../components/budget/BudgetAlerts'
import FixedTransactionsList from '../components/budget/FixedTransactionsList'
import FixedTransactionModal from '../components/budget/FixedTransactionModal'
import BudgetHistory from '../components/budget/BudgetHistory'
import CategoryBudgetList from '../components/budget/CategoryBudgetList'
import CategoryBudgetModal from '../components/budget/CategoryBudgetModal'
import MonthlyBudgetReport from '../components/budget/MonthlyBudgetReport'
import { useMonthlyBudgetReport } from '../hooks/useMonthlyBudgetReport'
import { DocumentChartBarIcon } from '@heroicons/react/24/outline'
import FixedExpenseModal from '../components/budget/FixedExpenseModal'

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

  const handleProcessMonthlyTransactions = async () => {
    try {
      console.log('月次処理を開始します...')
      await processMonthlyFixedTransactions()
      console.log('月次処理が正常に完了しました')
      alert('固定収支の月次処理が完了しました。毎月1日の取引として記録されました。')
      // データを再読み込みして更新を反映
      handleBudgetUpdated()
    } catch (error: any) {
      console.error('月次処理エラー:', error)
      console.error('エラー詳細:', error.response?.data || error.message)
      
      let errorMessage = '月次処理に失敗しました。'
      if (error.response?.data?.error) {
        errorMessage += `\nエラー: ${error.response.data.error}`
      } else if (error.message) {
        errorMessage += `\nエラー: ${error.message}`
      }
      
      alert(errorMessage)
    }
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
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">テスト機能</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
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
            <div className="border-t border-yellow-200 dark:border-yellow-800 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">固定収支の月次処理</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    固定収支を毎月1日の取引として生成します
                  </p>
                </div>
                <button
                  onClick={handleProcessMonthlyTransactions}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  月次処理を実行
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* メインセクション: カテゴリ別予算設定と予算履歴 */}
        <div className="flex flex-col xl:flex-row gap-6 mb-8">
          {/* カテゴリ別予算設定 - 6.5割 */}
          <div className="xl:w-[65%]">
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

          {/* 予算履歴 - 3.5割 */}
          <div className="xl:w-[35%]">
            <BudgetHistory />
          </div>
        </div>

        {/* サブセクション */}
        <div className="grid grid-cols-1 gap-6 mb-8">
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