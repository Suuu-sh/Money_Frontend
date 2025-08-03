'use client'

import { useState, useEffect } from 'react'
import { createCategory } from '../lib/api'
import { XMarkIcon } from '@heroicons/react/24/outline'
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

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCategoryAdded: () => void
  defaultType?: 'income' | 'expense'
}

export default function AddCategoryModal({
  isOpen,
  onClose,
  onCategoryAdded,
  defaultType = 'expense'
}: AddCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: defaultType as 'income' | 'expense',
    color: '#22c55e',
    icon: 'document',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        type: defaultType,
        color: '#22c55e',
        icon: 'document',
        description: '',
      })
      setError('')
    }
  }, [isOpen, defaultType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      setLoading(true)
      await createCategory(formData)
      onCategoryAdded()
      onClose()
    } catch (error: any) {
      console.error('カテゴリ作成エラー:', error)
      if (error.response?.data?.error) {
        setError(error.response.data.error)
      } else if (error.message) {
        setError(error.message)
      } else {
        setError('カテゴリの作成に失敗しました')
      }
    } finally {
      setLoading(false)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 h-[95vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* ヘッダー */}
        <div className="relative px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                カテゴリを追加
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                新しいカテゴリを作成します
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 px-6 py-6 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full flex flex-col space-y-3">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  カテゴリ名
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                  placeholder="カテゴリ名を入力"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  タイプ
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all duration-200"
                >
                  <option value="expense">支出</option>
                  <option value="income">収入</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                アイコン
              </label>
              <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded-lg">
                {iconOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: option.key })}
                    className={`p-1.5 rounded-md border transition-all duration-200 flex flex-col items-center space-y-0.5 hover:scale-105 ${
                      formData.icon === option.key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {renderIcon(option.key, 12)}
                    <span className="text-xs font-medium text-center leading-tight">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                カラー
              </label>
              <div className="grid grid-cols-10 gap-2">
                {commonColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                      formData.color === color
                        ? 'border-gray-800 dark:border-gray-200 scale-110 shadow-lg'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                説明
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                placeholder="カテゴリの説明（任意）"
              />
            </div>
          </form>
        </div>

        {/* フッター */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-500 transition-all duration-200 font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  作成中...
                </div>
              ) : (
                '作成'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}