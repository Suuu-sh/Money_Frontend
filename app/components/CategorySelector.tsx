'use client';

import React from 'react';
import { Category } from '../types';
import { 
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
  Smartphone,
  Users,
  PiggyBank
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
    '交際費': <Users {...iconProps} />,
    '投資費': <PiggyBank {...iconProps} />,
    'その他支出': <FileText {...iconProps} />,
    '給与': <Briefcase {...iconProps} />,
    '副業': <Laptop {...iconProps} />,
    '投資': <TrendingUp {...iconProps} />,
    '賞与': <Gift {...iconProps} />,
    'その他収入': <DollarSign {...iconProps} />,
  };
  
  return iconMap[name] || <ShoppingBag {...iconProps} />;
};

// カテゴリのテーマカラーを取得（薄い色を強制使用）
const getCategoryThemeColor = (category: Category) => {
  // データベースの濃い色は使用せず、常に薄い色を使用
  const colorMap: { [key: string]: { background: string; border: string; hover: string } } = {
    '食費': { background: '#FEF7F7', border: '#EF4444', hover: '#FEE2E2' },
    '交通費': { background: '#F0F9FF', border: '#22C55E', hover: '#DBEAFE' },
    '娯楽費': { background: '#FAF5FF', border: '#F59E0B', hover: '#EDE9FE' },
    '光熱費': { background: '#FFFCF5', border: '#EAB308', hover: '#FEF3C7' },
    '日用品': { background: '#F7FEF9', border: '#84CC16', hover: '#D1FAE5' },
    '医療費': { background: '#FEF7F7', border: '#EC4899', hover: '#FEE2E2' },
    '住居費': { background: '#F7F9FF', border: '#F97316', hover: '#E0E7FF' },
    '教育費': { background: '#F5FFFE', border: '#8B5CF6', hover: '#CCFBF1' },
    '美容費': { background: '#FEF7FB', border: '#EC4899', hover: '#FCE7F3' },
    '衣服費': { background: '#F0FDFF', border: '#06B6D4', hover: '#CFFAFE' },
    '貯金・投資': { background: '#F7FEF9', border: '#059669', hover: '#D1FAE5' },
    '通信費': { background: '#F0F9FF', border: '#3B82F6', hover: '#DBEAFE' },
    '交際費': { background: '#FEF7FB', border: '#EC4899', hover: '#FCE7F3' },
    '投資費': { background: '#F7FEF9', border: '#059669', hover: '#D1FAE5' },
    'その他支出': { background: '#FAFBFC', border: '#6B7280', hover: '#F3F4F6' },
    '給与': { background: '#F7FEF9', border: '#10B981', hover: '#D1FAE5' },
    '副業': { background: '#F0F9FF', border: '#3B82F6', hover: '#DBEAFE' },
    '投資': { background: '#FAF5FF', border: '#8B5CF6', hover: '#EDE9FE' },
    '賞与': { background: '#FFFCF5', border: '#F59E0B', hover: '#FEF3C7' },
    'その他収入': { background: '#F0F9FF', border: '#3B82F6', hover: '#DBEAFE' },
  };
  
  return colorMap[category.name] || { background: '#FAFBFC', border: '#6B7280', hover: '#F3F4F6' };
};

export default function CategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
  type,
  className = ''
}: CategorySelectorProps) {
  // カテゴリの一般的な順序を定義
  const getCategoryOrder = (categoryName: string, categoryType: string) => {
    if (categoryType === 'income') {
      const incomeOrder = ['給与', '賞与', '副業', '投資', 'その他収入'];
      const index = incomeOrder.indexOf(categoryName);
      return index === -1 ? 999 : index;
    } else {
      const expenseOrder = [
        '食費', '住居費', '光熱費', '通信費', '交通費', 
        '医療費', '日用品', '衣服費', '美容費', '教育費', 
        '娯楽費', '交際費', '投資費', 'その他支出'
      ];
      const index = expenseOrder.indexOf(categoryName);
      return index === -1 ? 999 : index;
    }
  };

  // タイプでフィルタリングして、一般的な順序でソート
  const filteredCategories = (type 
    ? categories.filter(cat => cat.type === type)
    : categories
  ).sort((a, b) => {
    const orderA = getCategoryOrder(a.name, a.type);
    const orderB = getCategoryOrder(b.name, b.type);
    return orderA - orderB;
  });

  return (
    <div className={`w-full ${className}`}>
      {/* カテゴリグリッド（横長カード） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
        {filteredCategories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          const themeColor = getCategoryThemeColor(category);
          const iconColor = isSelected ? '#3B82F6' : themeColor.border;
          const icon = getCategoryIcon(category.name, iconColor);
          
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category)}
              className={`
                relative px-4 py-3 rounded-lg border-2 transition-all duration-200 
                hover:shadow-md hover:scale-105 active:scale-95
                flex items-center justify-start min-h-[50px]
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
              <div className="mr-3 flex-shrink-0">
                {icon}
              </div>
              
              {/* カテゴリ名（日本語のみ） */}
              <span className={`text-sm font-medium ${
                isSelected ? 'text-blue-700' : 'text-gray-800'
              }`}>
                {category.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* カテゴリが見つからない場合 */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📂</div>
          <p>該当するカテゴリがありません</p>
        </div>
      )}
    </div>
  );
}