'use client';

import { useState, useEffect } from 'react';
import { fetchMonthlyBudgetReport, continueBudgetSettings } from '../lib/api';

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

export function useMonthlyBudgetReport() {
  const [shouldShowReport, setShouldShowReport] = useState(false);
  const [reportData, setReportData] = useState<BudgetReportData | null>(null);

  // 月初チェック（実際の実装では、月が変わったタイミングで表示）
  const checkForMonthlyReport = () => {
    const now = new Date();
    const lastCheck = localStorage.getItem('lastBudgetReportCheck');
    const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
    
    if (lastCheck !== currentMonth) {
      // 前月のデータを取得してレポートを生成
      generateMonthlyReport();
      localStorage.setItem('lastBudgetReportCheck', currentMonth);
    }
  };

  // テスト用：手動でレポートを表示
  const showTestReport = () => {
    generateMonthlyReport();
  };

  const generateMonthlyReport = async () => {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      const year = lastMonth.getFullYear();
      const month = lastMonth.getMonth() + 1;

      // APIから前月のデータを取得（テスト用にはモックデータを使用）
      let reportData: BudgetReportData;
      
      try {
        reportData = await fetchMonthlyBudgetReport(year, month);
      } catch (apiError) {
        // APIが利用できない場合はモックデータを使用
        console.log('Using mock data for monthly report');
        reportData = {
          month: month.toString(),
          year: year,
          categories: [
            {
              id: '1',
              name: '食費',
              budgetAmount: 50000,
              actualAmount: 55000,
              percentage: 110,
              status: 'over'
            },
            {
              id: '2',
              name: '交通費',
              budgetAmount: 20000,
              actualAmount: 18000,
              percentage: 90,
              status: 'under'
            },
            {
              id: '3',
              name: '娯楽費',
              budgetAmount: 30000,
              actualAmount: 25000,
              percentage: 83,
              status: 'under'
            },
            {
              id: '4',
              name: '光熱費',
              budgetAmount: 15000,
              actualAmount: 16500,
              percentage: 110,
              status: 'over'
            }
          ],
          totalBudget: 115000,
          totalSpent: 114500,
          overallStatus: 'under'
        };
      }

      setReportData(reportData);
      setShouldShowReport(true);
    } catch (error) {
      console.error('Failed to generate monthly report:', error);
    }
  };

  const closeReport = () => {
    setShouldShowReport(false);
  };

  const continueBudget = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      // 同じ予算設定で継続する処理
      await continueBudgetSettings(year, month);
      console.log('Budget settings continued for next month');
      setShouldShowReport(false);
    } catch (error) {
      console.error('Failed to continue budget settings:', error);
      // エラーが発生してもモーダルは閉じる
      setShouldShowReport(false);
    }
  };

  const modifyBudget = () => {
    // 予算修正画面に遷移
    console.log('Redirecting to budget modification');
    setShouldShowReport(false);
    // 実際の実装では、予算設定画面にリダイレクト
    window.location.href = '/budget';
  };

  useEffect(() => {
    checkForMonthlyReport();
    
    // 月初チェックのためのインターバル（1日1回チェック）
    const interval = setInterval(() => {
      checkForMonthlyReport();
    }, 24 * 60 * 60 * 1000); // 24時間ごと
    
    return () => clearInterval(interval);
  }, []);

  return {
    shouldShowReport,
    reportData,
    showTestReport,
    closeReport,
    continueBudget,
    modifyBudget
  };
}