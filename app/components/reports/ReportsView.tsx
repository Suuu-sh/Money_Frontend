'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Calendar, BarChart3 } from 'lucide-react';

interface BudgetData {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  month: number;
  year: number;
}

interface TransactionData {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}

interface CategoryReport {
  id: string;
  name: string;
  budgetAmount: number;
  actualAmount: number;
  percentage: number;
  status: 'over' | 'under' | 'exact';
}

interface MonthlyReport {
  month: number;
  year: number;
  categories: CategoryReport[];
  totalBudget: number;
  totalSpent: number;
  overallStatus: 'over' | 'under' | 'exact';
}

export default function ReportsView() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // 既存のAPIエンドポイントを使用してレポートデータを取得
      const reportResponse = await fetch(`http://localhost:8080/api/budget/monthly-report/${selectedYear}/${selectedMonth}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (reportResponse.ok) {
        const reportData = await reportResponse.json();
        
        // APIレスポンスの形式に合わせてデータを変換
        const categories: CategoryReport[] = reportData.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          budgetAmount: cat.budgetAmount,
          actualAmount: cat.actualAmount,
          percentage: Math.round(cat.percentage),
          status: cat.status
        }));

        setReportData({
          month: selectedMonth,
          year: selectedYear,
          categories,
          totalBudget: reportData.totalBudget,
          totalSpent: reportData.totalSpent,
          overallStatus: reportData.overallStatus
        });
      } else {
        // レポートデータが存在しない場合は空のデータを設定
        setReportData({
          month: selectedMonth,
          year: selectedYear,
          categories: [],
          totalBudget: 0,
          totalSpent: 0,
          overallStatus: 'under'
        });
      }
    } catch (error) {
      console.error('レポートデータの取得エラー:', error);
      // エラーの場合も空のデータを設定
      setReportData({
        month: selectedMonth,
        year: selectedYear,
        categories: [],
        totalBudget: 0,
        totalSpent: 0,
        overallStatus: 'under'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

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

  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 期間選択 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">期間選択</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              年
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              月
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              {months.map((month, index) => (
                <option key={index + 1} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {reportData ? (
        <>
          {/* 全体サマリー */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-blue-100 dark:border-gray-600">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedYear}年{selectedMonth}月 全体サマリー
              </h3>
            </div>
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

          {/* カテゴリ別詳細 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">カテゴリ別詳細</h3>
            <div className="space-y-4">
              {reportData.categories && reportData.categories.length > 0 ? (
                reportData.categories.map((category) => (
                  <div key={category.id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-5 bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition-shadow">
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
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    データがありません
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    選択した期間の予算または取引データがありません
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            レポートデータがありません
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            期間を選択してレポートを表示してください
          </p>
        </div>
      )}
    </div>
  );
}
