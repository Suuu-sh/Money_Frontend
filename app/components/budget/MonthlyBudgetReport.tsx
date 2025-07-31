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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {reportData.year}年{reportData.month}月 予算レポート
              </h2>
              <p className="text-gray-600 mt-1">
                月次予算の実績をご確認ください
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* 全体サマリー */}
          <div className="mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">全体サマリー</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">予算総額</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ¥{reportData.totalBudget.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">実際の支出</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ¥{reportData.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">差額</p>
                  <p className={`text-2xl font-bold ${
                    reportData.totalSpent > reportData.totalBudget 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {reportData.totalSpent > reportData.totalBudget ? '+' : ''}
                    ¥{Math.abs(reportData.totalSpent - reportData.totalBudget).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-center">
                  {reportData.overallStatus === 'over' ? (
                    <TrendingUp className="w-6 h-6 text-red-500 mr-2" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-green-500 mr-2" />
                  )}
                  <span className={`font-semibold ${
                    reportData.overallStatus === 'over' 
                      ? 'text-red-600' 
                      : 'text-green-600'
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
            <h3 className="text-lg font-semibold mb-4">カテゴリ別詳細</h3>
            <div className="space-y-4">
              {reportData.categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {getStatusIcon(category.status)}
                      <h4 className="font-semibold ml-2">{category.name}</h4>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(category.status)}`}>
                      {category.percentage}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">予算額</p>
                      <p className="font-semibold">¥{category.budgetAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">実際の支出</p>
                      <p className="font-semibold">¥{category.actualAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
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
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">来月の予算設定</h3>
            <p className="text-gray-600 mb-6">
              今月の結果を踏まえて、来月の予算をどうしますか？
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onContinueBudget}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                同じ予算設定で継続
              </button>
              <button
                onClick={onModifyBudget}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
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