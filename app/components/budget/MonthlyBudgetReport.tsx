'use client';

import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface BudgetReportData {
  month: string;
  year: number;
  categories: {
    id: string;
    name: string;
    budgetAmount: number;
    actualAmount: number;
    percentage: number;
    status: 'over' | 'under' | 'exact';
  }[];
  totalBudget: number;
  totalSpent: number;
  overallStatus: 'over' | 'under' | 'exact';
}

interface MonthlyBudgetReportProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: BudgetReportData;
  onContinueBudget: () => void;
  onModifyBudget: () => void;
}

export default function MonthlyBudgetReport({
  isOpen,
  onClose,
  reportData,
  onContinueBudget,
  onModifyBudget
}: MonthlyBudgetReportProps) {
  if (!isOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'under':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'text-red-600 bg-red-50';
      case 'under':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {reportData.year}年{reportData.month}月 予算レポート
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                月次予算の実績をご確認ください
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* 全体サマリー */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-blue-100 dark:border-gray-600">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">全体サマリー</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">予算総額</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ¥{reportData.totalBudget.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">実際の支出</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ¥{reportData.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">差額</p>
                  <p className={`text-2xl font-bold ${
                    reportData.totalSpent > reportData.totalBudget 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {reportData.totalSpent > reportData.totalBudget ? '+' : ''}
                    ¥{Math.abs(reportData.totalSpent - reportData.totalBudget).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-center">
                  {reportData.overallStatus === 'over' ? (
                    <TrendingUp className="w-6 h-6 text-red-500 mr-2" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-green-500 mr-2" />
                  )}
                  <span className={`font-semibold ${
                    reportData.overallStatus === 'over' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {reportData.overallStatus === 'over' 
                      ? '予算オーバー' 
                      : '予算内で収まりました'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* カテゴリ別詳細 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">カテゴリ別詳細</h3>
            <div className="space-y-4">
              {reportData.categories.map((category) => (
                <div key={category.id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-5 bg-white dark:bg-gray-700/50 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {getStatusIcon(category.status)}
                      <h4 className="font-semibold ml-2 text-gray-900 dark:text-white">{category.name}</h4>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      category.status === 'over'
                        ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                        : category.status === 'under'
                        ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
                        : 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                    }`}>
                      {category.percentage}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">予算額</p>
                      <p className="font-semibold text-gray-900 dark:text-white">¥{category.budgetAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">実際の支出</p>
                      <p className="font-semibold text-gray-900 dark:text-white">¥{category.actualAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          category.status === 'over' 
                            ? 'bg-red-500' 
                            : category.status === 'under' 
                            ? 'bg-green-500' 
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">来月の予算設定</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              今月の結果を踏まえて、来月の予算をどうしますか？
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onContinueBudget}
                className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                同じ予算設定で継続
              </button>
              <button
                onClick={onModifyBudget}
                className="flex-1 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                予算を修正する
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}