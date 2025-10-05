"use client"

/**
 * BudgetPage では予算設定や固定収支をまとめて管理します。
 *  - 認証済みユーザーのみ利用できるため、マウント後すぐにトークンを検証。
 *  - 予算分析とカテゴリ別予算を同時に参照するケースが多いため、両者を同じ
 *    ステートとモーダルで扱い、更新時は `handleBudgetUpdated` で一括リロード。
 *  - 固定費／固定収支の編集モーダルもこのページから開くので、関連する
 *    `show*Modal` や `editing*` ステートはここで集中管理しています。
 * 新卒エンジニアが触る場合は、まず下の useState 群でどの UI 要素と結び付いて
 * いるかを確認してから処理フローを追うと理解しやすいです。
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BudgetAnalysis, FixedExpense, FixedTransaction, Category, CategoryBudget } from '../types'
import { fetchBudgetAnalysis, fetchCategories } from '../lib/api'
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
import { DocumentChartBarIcon } from '@heroicons/react/24/outline'
import FixedExpenseModal from '../components/budget/FixedExpenseModal'

export default function BudgetPage() {
  const router = useRouter()
  // データ表示に関するステート
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([])
  const [budgetUpdateTrigger, setBudgetUpdateTrigger] = useState(0) // List再描画用のキー
  const [loading, setLoading] = useState(true)

  // モーダルの開閉＆編集中アイテムの管理
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<FixedTransaction | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showCategoryBudgetModal, setShowCategoryBudgetModal] = useState(false)
  const [editingCategoryBudget, setEditingCategoryBudget] = useState<CategoryBudget | null>(null)
  // 今月の予算分析サマリーを取得してハイライト表示に反映
  const loadBudgetAnalysis = useCallback(async () => {
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1

      const data = await fetchBudgetAnalysis(year, month)
      setAnalysis(data)
    } catch (error) {
      console.error('予算分析データの取得に失敗しました:', error)
    }
  }, [])

  // カテゴリ一覧と予算分析を並列で読み込み、画面初期化に利用
  const loadData = useCallback(async () => {
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
  }, [loadBudgetAnalysis, router])

  useEffect(() => {
    // ログインチェック。未ログインの場合はダッシュボードへ辿り着かせない
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadData()
  }, [loadData, router])

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
      
      <main className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        {/* アラートは非表示／余白なし */}



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

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  )
}
