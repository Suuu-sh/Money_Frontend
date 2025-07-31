'use client';

import React, { useState } from 'react';
import { Category } from '../types';
import { Search, Check } from 'lucide-react';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId?: number;
  onSelect: (category: Category) => void;
  type?: 'income' | 'expense';
  className?: string;
}

// カテゴリアイコンのマッピング
const getCategoryIcon = (name: string, icon?: string) => {
  if (icon) return icon;
  
  const iconMap: { [key: string]: string } = {
    '食費': '🍽️',
    '交通費': '🚗',
    '娯楽費': '🎮',
    '光熱費': '⚡',
    '日用品': '🧴',
    '医療費': '🏥',
    '住居費': '🏠',
    '教育費': '📚',
    '美容費': '💄',
    '衣服費': '👕',
    '貯金・投資': '💰',
    '通信費': '📱',
    'その他支出': '📄',
    '給与': '💼',
    'その他収入': '💵',
  };
  
  return iconMap[name] || '📁';
};

// カテゴリのテーマカラーを取得（実際のcolorプロパティを使用）
const getCategoryThemeColor = (category: Category) => {
  // カテゴリのcolorプロパティがある場合はそれを使用
  if (category.color) {
    return {
      background: category.color,
      border: category.color,
      hover: category.color
    };
  }
  
  // フォールバック用のカラーマッピング
  const colorMap: { [key: string]: { background: string; border: string; hover: string } } = {
    '食費': { background: '#FED7AA', border: '#FB923C', hover: '#FDBA74' },
    '交通費': { background: '#BFDBFE', border: '#3B82F6', hover: '#93C5FD' },
    '娯楽費': { background: '#DDD6FE', border: '#8B5CF6', hover: '#C4B5FD' },
    '光熱費': { background: '#FEF3C7', border: '#F59E0B', hover: '#FDE68A' },
    '日用品': { background: '#BBF7D0', border: '#10B981', hover: '#86EFAC' },
    '医療費': { background: '#FECACA', border: '#EF4444', hover: '#FCA5A5' },
    '住居費': { background: '#C7D2FE', border: '#6366F1', hover: '#A5B4FC' },
    '教育費': { background: '#99F6E4', border: '#14B8A6', hover: '#5EEAD4' },
    '美容費': { background: '#FBCFE8', border: '#EC4899', hover: '#F9A8D4' },
    '衣服費': { background: '#A5F3FC', border: '#06B6D4', hover: '#67E8F9' },
    '貯金・投資': { background: '#A7F3D0', border: '#059669', hover: '#6EE7B7' },
    '通信費': { background: '#CBD5E1', border: '#64748B', hover: '#94A3B8' },
    'その他支出': { background: '#E5E7EB', border: '#6B7280', hover: '#D1D5DB' },
    '給与': { background: '#BBF7D0', border: '#10B981', hover: '#86EFAC' },
    'その他収入': { background: '#BFDBFE', border: '#3B82F6', hover: '#93C5FD' },
  };
  
  return colorMap[category.name] || { background: '#E5E7EB', border: '#6B7280', hover: '#D1D5DB' };
};

export default function CategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
  type,
  className = ''
}: CategorySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // タイプでフィルタリング
  const filteredByType = type 
    ? categories.filter(cat => cat.type === type)
    : categories;

  // 検索でフィルタリング
  const filteredCategories = filteredByType.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`w-full ${className}`}>
      {/* 検索バー */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="カテゴリを検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* カテゴリグリッド */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-80 overflow-y-auto">
        {filteredCategories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          const icon = getCategoryIcon(category.name, category.icon);
          const themeColor = getCategoryThemeColor(category);
          
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category)}
              className={`
                relative p-2 rounded-lg border-2 transition-all duration-200 
                hover:shadow-md hover:scale-105 active:scale-95
                flex flex-col items-center justify-center min-h-[60px]
                ${isSelected 
                  ? 'border-blue-500 shadow-md ring-2 ring-blue-200' 
                  : 'border-transparent'
                }
              `}
              style={{
                backgroundColor: isSelected ? '#EBF8FF' : themeColor.background,
                borderColor: isSelected ? '#3B82F6' : themeColor.border,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = themeColor.hover;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = themeColor.background;
                }
              }}
            >
              {/* 選択チェックマーク */}
              {isSelected && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              
              {/* アイコン */}
              <div className="text-xl mb-1">
                {icon}
              </div>
              
              {/* カテゴリ名（日本語のみ） */}
              <span className={`text-xs font-medium text-center leading-tight ${
                isSelected ? 'text-blue-700' : 'text-gray-800'
              }`}>
                {category.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* 結果が見つからない場合 */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p>該当するカテゴリが見つかりません</p>
          {searchTerm && (
            <p className="text-sm mt-1">
              「{searchTerm}」の検索結果
            </p>
          )}
        </div>
      )}
    </div>
  );
}