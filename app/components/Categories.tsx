'use client'

import { useState } from 'react'
import { Category } from '../types'
import { createCategory, updateCategory, deleteCategory } from '../lib/api'

interface CategoriesProps {
  categories: Category[]
  onCategoryUpdated: () => void
}

export default function Categories({ categories, onCategoryUpdated }: CategoriesProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#22c55e',
    icon: 'document',
    description: '',
  })
  const [editCategory, setEditCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#22c55e',
    icon: 'document',
    description: '',
  })

  const incomeCategories = categories.filter(cat => cat.type === 'income')
  const expenseCategories = categories.filter(cat => cat.type === 'expense')
  
  // デバッグ用ログ
  console.log('All categories:', categories)
  console.log('Expense categories:', expenseCategories)
  console.log('Income categories:', incomeCategories)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCategory(newCategory)
      setNewCategory({
        name: '',
        type: 'expense',
        color: '#22c55e',
        icon: 'document',
        description: '',
      })
      setIsCreating(false)
      onCategoryUpdated()
    } catch (error) {
      console.error('カテゴリ作成エラー:', error)
      alert('カテゴリの作成に失敗しました')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setEditCategory({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      description: category.description,
    })
    setIsEditing(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    try {
      await updateCategory(editingCategory.id, editCategory)
      setIsEditing(false)
      setEditingCategory(null)
      setEditCategory({
        name: '',
        type: 'expense',
        color: '#22c55e',
        icon: 'document',
        description: '',
      })
      onCategoryUpdated()
    } catch (error) {
      console.error('カテゴリ更新エラー:', error)
      alert('カテゴリの更新に失敗しました')
    }
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
    { key: 'briefcase', name: '仕事' },
    { key: 'home', name: '住居' },
    { key: 'car', name: '交通' },
    { key: 'phone', name: '通信' },
    { key: 'hospital', name: '医療' },
    { key: 'book', name: '教育' },
    { key: 'game', name: '娯楽' },
    { key: 'shirt', name: '衣服' },
    { key: 'beauty', name: '美容' },
    { key: 'bottle', name: '日用品' },
    { key: 'money', name: '金融' },
    { key: 'chart', name: '投資' },
    { key: 'gift', name: 'ギフト' },
    { key: 'lightning', name: '光熱費' },
    { key: 'computer', name: 'IT' },
    { key: 'art', name: '趣味' },
    { key: 'plane', name: '旅行' },
    { key: 'shopping', name: '買い物' },
    { key: 'food', name: '食事' },
    { key: 'users', name: '交際費' },
    { key: 'piggybank', name: '投資費' },
    { key: 'document', name: 'その他' }
  ]

  const renderIcon = (iconKey: string, className = "w-5 h-5") => {
    // 絵文字の場合は直接表示
    if (/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(iconKey)) {
      return <span className="text-lg">{iconKey}</span>
    }
    
    const iconMap: { [key: string]: JSX.Element } = {
      briefcase: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" /></svg>,
      home: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      car: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>,
      phone: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
      hospital: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
      book: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
      game: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      shirt: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      beauty: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
      bottle: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
      money: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>,
      chart: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      gift: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
      lightning: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      computer: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      art: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z" /></svg>,
      plane: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
      shopping: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" /></svg>,
      food: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
      users: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      piggybank: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      document: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    }
    return iconMap[iconKey] || iconMap.document
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end items-center">
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>カテゴリを追加</span>
        </button>
      </div>

      {/* カテゴリ作成フォーム */}
      {isCreating && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">新しいカテゴリ</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  カテゴリ名 *
                </label>
                <input
                  type="text"
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="input-field"
                  placeholder="例: 交際費"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  タイプ
                </label>
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as any })}
                  className="input-field"
                >
                  <option value="expense">支出</option>
                  <option value="income">収入</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                アイコン
              </label>
              <div className="grid grid-cols-5 gap-3">
                {iconOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setNewCategory({ ...newCategory, icon: option.key })}
                    className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center space-y-1 ${
                      newCategory.icon === option.key
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {renderIcon(option.key)}
                    <span className="text-xs font-medium">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                カラー
              </label>
              <div className="grid grid-cols-10 gap-2">
                {commonColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      newCategory.color === color
                        ? 'border-gray-800 dark:border-gray-200 scale-110'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                説明
              </label>
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="input-field"
                placeholder="カテゴリの説明"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="btn-secondary"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                作成
              </button>
            </div>
          </form>
        </div>
      )}

      {/* カテゴリ編集フォーム */}
      {isEditing && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">カテゴリを編集</h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  カテゴリ名 *
                </label>
                <input
                  type="text"
                  required
                  value={editCategory.name}
                  onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                  className="input-field"
                  placeholder="例: 交際費"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  タイプ
                </label>
                <select
                  value={editCategory.type}
                  onChange={(e) => setEditCategory({ ...editCategory, type: e.target.value as any })}
                  className="input-field"
                >
                  <option value="expense">支出</option>
                  <option value="income">収入</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                アイコン
              </label>
              <div className="grid grid-cols-5 gap-3">
                {iconOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setEditCategory({ ...editCategory, icon: option.key })}
                    className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center space-y-1 ${
                      editCategory.icon === option.key
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {renderIcon(option.key)}
                    <span className="text-xs font-medium">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                カラー
              </label>
              <div className="grid grid-cols-10 gap-2">
                {commonColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEditCategory({ ...editCategory, color })}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      editCategory.color === color
                        ? 'border-gray-800 dark:border-gray-200 scale-110'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                説明
              </label>
              <input
                type="text"
                value={editCategory.description}
                onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                className="input-field"
                placeholder="カテゴリの説明"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setEditingCategory(null)
                }}
                className="btn-secondary"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                更新
              </button>
            </div>
          </form>
        </div>
      )}

      {/* カテゴリ一覧 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 支出カテゴリ */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-expense-500 dark:text-expense-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>支出カテゴリ</span>
          </h3>
          <div className="space-y-3">
            {expenseCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    {renderIcon(category.icon, "w-4 h-4 text-white")}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-sm px-2 py-1 rounded hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 収入カテゴリ */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-income-500 dark:text-income-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span>収入カテゴリ</span>
          </h3>
          <div className="space-y-3">
            {incomeCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    {renderIcon(category.icon, "w-4 h-4 text-white")}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-sm px-2 py-1 rounded hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                  >
                    削除
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