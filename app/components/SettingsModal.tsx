'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Settings {
  theme: 'light' | 'dark'
  currency: 'JPY' | 'USD' | 'EUR'
  language: 'ja' | 'en'
  notifications: boolean
  autoBackup: boolean
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    currency: 'JPY',
    language: 'ja',
    notifications: true,
    autoBackup: true
  })

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('moneytracker-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch (error) {
        console.error('Failed to parse settings:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.theme])

  const handleSettingChange = (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('moneytracker-settings', JSON.stringify(newSettings))
  }

  const handleReset = () => {
    const defaultSettings: Settings = {
      theme: 'light',
      currency: 'JPY',
      language: 'ja',
      notifications: true,
      autoBackup: true
    }
    setSettings(defaultSettings)
    localStorage.setItem('moneytracker-settings', JSON.stringify(defaultSettings))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">設定</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6">
          {/* Theme Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">外観</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  カラーテーマ
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSettingChange('theme', 'light')}
                    className={`p-3 rounded-lg border-2 transition-colors flex items-center space-x-2 ${
                      settings.theme === 'light'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <SunIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">ライト</span>
                  </button>
                  <button
                    onClick={() => handleSettingChange('theme', 'dark')}
                    className={`p-3 rounded-lg border-2 transition-colors flex items-center space-x-2 ${
                      settings.theme === 'dark'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <MoonIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">ダーク</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">一般</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  通貨
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="JPY">日本円 (¥)</option>
                  <option value="USD">米ドル ($)</option>
                  <option value="EUR">ユーロ (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  言語
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="ja">日本語</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">通知</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    プッシュ通知
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    予算超過や重要な更新の通知を受け取る
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('notifications', !settings.notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    自動バックアップ
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    データを定期的に自動バックアップする
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoBackup', !settings.autoBackup)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoBackup ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">データ管理</h3>
            <div className="space-y-3">
              <button
                onClick={handleReset}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                設定をリセット
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-lg transition-colors">
                データをエクスポート
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}