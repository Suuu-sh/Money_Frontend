"use client"

/**
 * Categories コンポーネントは収入・支出カテゴリの一覧管理を担います。
 *  - 親から受け取ったカテゴリを種別ごとにソートし、カード形式で表示。
 *  - 「追加」「編集」「削除」の操作はモーダルを通じて行い、終了後に
 *    `onCategoryUpdated` を呼び出すことでリストを再取得させます。
 */

import { useState } from 'react'
import { Category } from '../types'
import { deleteCategory } from '../lib/api'
import EditCategoryModal from './EditCategoryModal'
import AddCategoryModal from './AddCategoryModal'
import { 
  Utensils, 
  Car, 
  Home, 
  Zap, 
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

interface CategoriesProps {
  categories: Category[]
  onCategoryUpdated: () => void
}

export default function Categories({ categories, onCategoryUpdated }: CategoriesProps) {
  // モーダルの開閉状態と編集中カテゴリ
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [defaultType, setDefaultType] = useState<'income' | 'expense'>('expense')


  // カテゴリの一般的な順序を定義
  const getCategoryOrder = (categoryName: string, categoryType: string) => {
    if (categoryType === 'income') {
      const incomeOrder = ['給与', '賞与', '副業', '投資', 'その他収入']
      const index = incomeOrder.indexOf(categoryName)
      return index === -1 ? 999 : index
    } else {
      const expenseOrder = [
        '食費', '住居費', '光熱費', '通信費', '交通費', 
        '医療費', '日用品', '衣服費', '美容費', '教育費', 
        '娯楽費', '交際費', '投資費', 'その他支出'
      ]
      const index = expenseOrder.indexOf(categoryName)
      return index === -1 ? 999 : index
    }
  }

  // カテゴリを一般的な順序でソート
  const incomeCategories = categories
    .filter(cat => cat.type === 'income')
    .sort((a, b) => getCategoryOrder(a.name, a.type) - getCategoryOrder(b.name, b.type))
  
  const expenseCategories = categories
    .filter(cat => cat.type === 'expense')
    .sort((a, b) => getCategoryOrder(a.name, a.type) - getCategoryOrder(b.name, b.type))

  // カテゴリカラーを薄くする関数
  const getLightColor = (color: string, opacity: number = 0.1) => {
    // HEXカラーをRGBAに変換して透明度を適用
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  const handleAddCategory = (type: 'income' | 'expense') => {
    setDefaultType(type)
    setIsAddModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('このカテゴリを削除しますか？関連する取引がある場合は削除できません。')) {
      try {
        await deleteCategory(id)
        onCategoryUpdated()
      } catch (error) {
        console.error('カテゴリ削除エラー:', error)
        alert('カテゴリの削除に失敗しました。関連する取引がある可能性があります。')
      }
    }
  }

  const commonColors = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#6B7280'
  ]

  const iconOptions = [
    { key: 'food', name: '食事' },
    { key: 'home', name: '住居' },
    { key: 'lightning', name: '光熱費' },
    { key: 'phone', name: '通信' },
    { key: 'car', name: '交通' },
    { key: 'hospital', name: '医療' },
    { key: 'bottle', name: '日用品' },
    { key: 'shirt', name: '衣服' },
    { key: 'beauty', name: '美容' },
    { key: 'book', name: '教育' },
    { key: 'game', name: '娯楽' },
    { key: 'users', name: '交際費' },
    { key: 'piggybank', name: '投資費' },
    { key: 'document', name: 'その他支出' },
    { key: 'briefcase', name: '給与' },
    { key: 'computer', name: '副業' },
    { key: 'chart', name: '投資' },
    { key: 'gift', name: '賞与' },
    { key: 'money', name: 'その他収入' }
  ]

  const renderIcon = (iconKey: string, size: number = 20) => {
    const iconProps = { size, strokeWidth: 2 };
    
    const iconMap: { [key: string]: JSX.Element } = {
      food: <Utensils {...iconProps} />,
      home: <Home {...iconProps} />,
      lightning: <Zap {...iconProps} />,
      phone: <Smartphone {...iconProps} />,
      car: <Car {...iconProps} />,
      hospital: <Heart {...iconProps} />,
      bottle: <Package {...iconProps} />,
      shirt: <Shirt {...iconProps} />,
      beauty: <Sparkles {...iconProps} />,
      book: <GraduationCap {...iconProps} />,
      game: <Gamepad2 {...iconProps} />,
      users: <Users {...iconProps} />,
      piggybank: <PiggyBank {...iconProps} />,
      document: <FileText {...iconProps} />,
      briefcase: <Briefcase {...iconProps} />,
      computer: <Laptop {...iconProps} />,
      chart: <TrendingUp {...iconProps} />,
      gift: <Gift {...iconProps} />,
      money: <DollarSign {...iconProps} />,
    };
    
    return iconMap[iconKey] || <FileText {...iconProps} />;
  }

  return (
    <div className="space-y-8">
      {/* カテゴリ追加モーダル */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCategoryAdded={onCategoryUpdated}
        defaultType={defaultType}
      />

      {/* カテゴリ編集モーダル */}
      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingCategory(null)
        }}
        category={editingCategory}
        onCategoryUpdated={onCategoryUpdated}
      />

      {/* カテゴリ一覧 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 支出カテゴリ */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <svg className="w-5 h-5 text-expense-500 dark:text-expense-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>支出カテゴリ</span>
            </h3>
            <button
              onClick={() => handleAddCategory('expense')}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>追加</span>
            </button>
          </div>
          <div className="space-y-3">
            {expenseCategories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                style={{ backgroundColor: getLightColor(category.color, 0.1) }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center">
                    <div style={{ color: category.color }}>
                      {renderIcon(category.icon, 20)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
                    title="編集"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                    title="削除"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 収入カテゴリ */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <svg className="w-5 h-5 text-income-500 dark:text-income-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>収入カテゴリ</span>
            </h3>
            <button
              onClick={() => handleAddCategory('income')}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>追加</span>
            </button>
          </div>
          <div className="space-y-3">
            {incomeCategories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                style={{ backgroundColor: getLightColor(category.color, 0.1) }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center">
                    <div style={{ color: category.color }}>
                      {renderIcon(category.icon, 20)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
                    title="編集"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                    title="削除"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
