'use client';

import React, { useMemo, useState } from 'react';
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

// Map category names to lucide-react icons
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

// Retrieve theme colours for cards (always using lighter shades)
const getCategoryThemeColor = (category: Category) => {
  // Prefer light colour palette regardless of stored colour
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
  // Current search keyword
  const [query, setQuery] = useState('');

  // Simple callback (no recent-history tracking)
  const handleSelect = (category: Category) => {
    onSelect(category);
  };
  // Define default ordering for categories by type
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

  // Filter by income/expense type if provided
  const typeFiltered = useMemo(() => (
    type ? categories.filter(cat => cat.type === type) : categories
  ), [categories, type]);

  // Name filter that supports prefix or substring matches
  const nameMatches = (name: string, q: string) => {
    const n = name.toLowerCase();
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return n.startsWith(s) || n.includes(s);
  };

  // Apply the search filter and sort with the canonical order
  const filteredCategories = useMemo(() => (
    typeFiltered
      .filter(cat => nameMatches(cat.name, query))
      .sort((a, b) => {
        const orderA = getCategoryOrder(a.name, a.type);
        const orderB = getCategoryOrder(b.name, b.type);
        return orderA - orderB;
      })
  ), [typeFiltered, query]);

  return (
    <div className={`w-full ${className}`}>
      {/* Search bar */}
      <div className="mb-2">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="カテゴリを検索"
            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            aria-label="カテゴリを検索"
          />
          {query && (
            <button
              type="button"
              aria-label="検索をクリア"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-[11px]"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* No recently-used section (intentionally hidden) */}

      {/* Category grid (compact layout) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
        {filteredCategories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          const themeColor = getCategoryThemeColor(category);
          const iconColor = themeColor.border;
          const icon = getCategoryIcon(category.name, iconColor);
          
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleSelect(category)}
              className={`
                relative px-2 py-1.5 rounded-md border-2 transition-all duration-150 
                hover:shadow-sm hover:scale-[1.02] active:scale-95 bg-white dark:bg-gray-800
                flex items-center justify-start min-h-[32px]
                ${isSelected ? 'shadow-sm' : ''}
              `}
              style={{
                backgroundColor: undefined,
                borderColor: themeColor.border,
              }}
              aria-pressed={isSelected}
              aria-label={`カテゴリ: ${category.name}`}
            >
              {/* Selection checkmark */}
              {isSelected && (
                <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-2 h-2 text-white" />
                </div>
              )}
              
              {/* Category icon */}
              <div className="mr-1.5 flex-shrink-0">
                {React.cloneElement(icon, { size: 14 })}
              </div>
              
              {/* Category name (Japanese labels sourced from API) */}
              <span className={`text-[11px] font-medium truncate text-gray-800 dark:text-gray-100`}>
                {category.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty state when no categories match */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📂</div>
          <p>該当するカテゴリがありません</p>
        </div>
      )}
    </div>
  );
}
