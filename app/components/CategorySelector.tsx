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

// カテゴリカラーのマッピング
const getCategoryColor = (name: string, color?: string) => {
  if (color) return color;
  
  const colorMap: { [key: string]: string } = {
    '食費': 'bg-orange-100 border-orange-200 hover:bg-orange-200',
    '交通費': 'bg-blue-100 border-blue-200 hover:bg-blue-200',
    '娯楽費': 'bg-purple-100 border-purple-200 hover:bg-purple-200',
    '光熱費': 'bg-yellow-100 border-yellow-200 hover:bg-yellow-200',
    '日用品': 'bg-green-100 border-green-200 hover:bg-green-200',
    '医療費': 'bg-red-100 border-red-200 hover:bg-red-200',
    '住居費': 'bg-indigo-100 border-indigo-200 hover:bg-indigo-200',
    '教育費': 'bg-teal-100 border-teal-200 hover:bg-teal-200',
    '美容費': 'bg-pink-100 border-pink-200 hover:bg-pink-200',
    '衣服費': 'bg-cyan-100 border-cyan-200 hover:bg-cyan-200',
    '貯金・投資': 'bg-emerald-100 border-emerald-200 hover:bg-emerald-200',
    '通信費': 'bg-slate-100 border-slate-200 hover:bg-slate-200',
    'その他支出': 'bg-gray-100 border-gray-200 hover:bg-gray-200',
    '給与': 'bg-green-100 border-green-200 hover:bg-green-200',
    'その他収入': 'bg-blue-100 border-blue-200 hover:bg-blue-200',
  };
  
  return colorMap[name] || 'bg-gray-100 border-gray-200 hover:bg-gray-200';
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
        {filteredCategories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          const icon = getCategoryIcon(category.name, category.icon);
          const colorClass = getCategoryColor(category.name, category.color);
          
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200 
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : `${colorClass} border-2`
                }
                hover:shadow-md hover:scale-105 active:scale-95
                flex flex-col items-center justify-center min-h-[80px]
              `}
            >
              {/* 選択チェックマーク */}
              {isSelected && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              
              {/* アイコン */}
              <div className="text-2xl mb-1">
                {icon}
              </div>
              
              {/* カテゴリ名 */}
              <span className={`text-xs font-medium text-center leading-tight ${
                isSelected ? 'text-blue-700' : 'text-gray-700'
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