'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Play, Calendar } from 'lucide-react';

interface SchedulerStatus {
  scheduler_active: boolean;
  current_time: string;
  next_execution: string;
  time_until_next: string;
  active_fixed_expenses: number;
  processed_this_month: number;
  current_month_completed: boolean;
}

export default function SchedulerStatus() {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    // 30秒ごとに状態を更新
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('認証トークンが見つかりません');
        return;
      }

      const response = await fetch('http://localhost:8080/api/scheduler/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setError(null);
      } else {
        if (response.status === 404) {
          setError('スケジューラーAPIが見つかりません。バックエンドサーバーを確認してください。');
        } else if (response.status === 401) {
          setError('認証に失敗しました。再ログインしてください。');
        } else {
          setError(`サーバーエラー: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('スケジューラー状態の取得エラー:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('バックエンドサーバーに接続できません。サーバーが起動しているか確認してください。');
      } else {
        setError('予期しないエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const executeNow = async () => {
    try {
      setExecuting(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8080/api/scheduler/execute-now', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert('月次処理が正常に完了しました！');
        // 状態を再取得
        await fetchStatus();
      } else {
        throw new Error('月次処理の実行に失敗しました');
      }
    } catch (error) {
      console.error('月次処理実行エラー:', error);
      alert('月次処理の実行に失敗しました');
    } finally {
      setExecuting(false);
    }
  };

  const scheduleTest = async (minutes: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8080/api/scheduler/test/${minutes}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${minutes}分後に月次処理が実行されるようにスケジュールしました`);
      } else {
        throw new Error('テストスケジュールの設定に失敗しました');
      }
    } catch (error) {
      console.error('テストスケジュール設定エラー:', error);
      alert('テストスケジュールの設定に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
              スケジューラーの状態を取得できませんでした
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              {error || 'バックエンドサーバーとの通信に問題があります'}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={fetchStatus}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
              >
                再試行
              </button>
              <div className="text-xs text-red-600 dark:text-red-400 flex items-center">
                <span>• バックエンドサーバーが起動しているか確認してください</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            自動スケジューラー
          </h3>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            status.scheduler_active ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className={`text-sm font-medium ${
            status.scheduler_active 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {status.scheduler_active ? '稼働中' : '停止中'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">次回実行予定</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(status.next_execution).toLocaleString('ja-JP')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">実行まで</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {status.time_until_next}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">アクティブな固定収支</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {status.active_fixed_expenses}件
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">今月の処理済み</p>
            <div className="flex items-center">
              <p className="font-medium text-gray-900 dark:text-white mr-2">
                {status.processed_this_month}件
              </p>
              {status.current_month_completed ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-lg mb-4 ${
        status.current_month_completed
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
      }`}>
        <div className="flex items-center">
          {status.current_month_completed ? (
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
          )}
          <span className={`text-sm font-medium ${
            status.current_month_completed
              ? 'text-green-700 dark:text-green-300'
              : 'text-yellow-700 dark:text-yellow-300'
          }`}>
            {status.current_month_completed
              ? '今月の固定収支処理は完了しています'
              : '今月の固定収支処理が未完了です'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={executeNow}
          disabled={executing}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          <Play className="w-4 h-4 mr-2" />
          {executing ? '実行中...' : '今すぐ実行'}
        </button>

        <button
          onClick={() => scheduleTest(1)}
          className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <Calendar className="w-4 h-4 mr-2" />
          1分後にテスト実行
        </button>

        <button
          onClick={() => scheduleTest(5)}
          className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <Calendar className="w-4 h-4 mr-2" />
          5分後にテスト実行
        </button>

        <button
          onClick={fetchStatus}
          className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          更新
        </button>
      </div>
    </div>
  );
}