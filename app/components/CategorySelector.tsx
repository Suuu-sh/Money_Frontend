'use client';

import React, { useState } from 'react';
import { Category } from '../types';
import { 
  Search, 
  Check, 
  Utensils, 
  Car, 
  Home, 
  Zap, 
  ShoppingBag, 
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
  Smartphone
} from 'lucide-react';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId?: number;
  onSelect: (category: Category) => void;
  type?: 'income' | 'expense';
  className?: string;
}

// カテゴリアイコンのマッピング（Lucide Reactアイコンを使用）
const getCategoryIcon = (name: string, iconColor: string = '#6B7280') => {
  const iconProps = { size: 20, color: iconColor, strokeWidth: 2 };
  
  const iconMap: { [key: string]: JSX.Element } = {
    '食費': <Utensils {...iconProps} />,
    '交通費': <Car {...iconProps} />,
    '娯楽費': <Gamepad2 {...iconProps} />,
    '光熱費': <Zap {...iconProps} />,
    '日用品': <Package {...iconProps} />,
    '医療費': <Heart {...iconProps} />,
    '住居費': <Home {...iconProps} />,
    '教育費': <GraduationCap {...iconProps} />,
    '美容費': <Sparkles {...iconProps} />,
    '衣服費': <Shirt {...iconProps} />,
    '貯金・投資': <TrendingUp {...iconProps} />,
    '通信費': <Smartphone {...iconProps} />,
    'その他支出': <FileText {...iconProps} />,
    '給与': <Briefcase {...iconProps} />,
    '副業': <Laptop {...iconProps} />,
    '投資': <TrendingUp {...iconProps} />,
    '賞与': <Gift {...iconProps} />,
    'その他収入': <DollarSign {...iconProps} />,
  };
  
  return iconMap[name] || <ShoppingBag {...iconProps} />;
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
  
  // フォールバック用のカラーマッピング（より薄い背景色）
  const colorMap: { [key: string]: { background: string; border: string; hover: string } } = {
    '食費': { background: '#FEF2F2', border: '#FB923C', hover: '#FED7AA' },
    '交通費': { background: '#EFF6FF', border: '#3B82F6', hover: '#BFDBFE' },
    '娯楽費': { background: '#F5F3FF', border: '#8B5CF6', hover: '#DDD6FE' },
    '光熱費': { background: '#FFFBEB', border: '#F59E0B', hover: '#FEF3C7' },
    '日用品': { background: '#F0FDF4', border: '#10B981', hover: '#BBF7D0' },
    '医療費': { background: '#FEF2F2', border: '#EF4444', hover: '#FECACA' },
    '住居費': { background: '#EEF2FF', border: '#6366F1', hover: '#C7D2FE' },
    '教育費': { background: '#F0FDFA', border: '#14B8A6', hover: '#99F6E4' },
    '美容費': { background: '#FDF2F8', border: '#EC4899', hover: '#FBCFE8' },
    '衣服費': { background: '#ECFEFF', border: '#06B6D4', hover: '#A5F3FC' },
    '貯金・投資': { background: '#ECFDF5', border: '#059669', hover: '#A7F3D0' },
    '通信費': { background: '#F8FAFC', border: '#64748B', hover: '#CBD5E1' },
    'その他支出': { background: '#F9FAFB', border: '#6B7280', hover: '#E5E7EB' },
    '給与': { background: '#F0FDF4', border: '#10B981', hover: '#BBF7D0' },
    'その他収入': { background: '#EFF6FF', border: '#3B82F6', hover: '#BFDBFE' },
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
          const themeColor = getCategoryThemeColor(category);
          const iconColor = isSelected ? '#3B82F6' : themeColor.border;
          const icon = getCategoryIcon(category.name, iconColor);
          
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category)}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200 
                hover:shadow-md hover:scale-105 active:scale-95
                flex flex-col items-center justify-center min-h-[70px]
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
              <div className="mb-2">
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