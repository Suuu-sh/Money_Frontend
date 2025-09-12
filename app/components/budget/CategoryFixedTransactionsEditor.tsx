'use client'

import { useEffect, useMemo, useState } from 'react'
import { FixedTransaction, FixedTransactionRequest } from '../../types'
import { updateFixedTransaction, deleteFixedExpense } from '../../lib/api'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface CategoryFixedTransactionsEditorProps {
  isOpen: boolean
  onClose: () => void
  transactions: FixedTransaction[]
  onSaved?: () => void
}

type EditRow = {
  name: string
  amount: string
  description: string
  isActive: boolean
  toDelete?: boolean
}

export default function CategoryFixedTransactionsEditor({
  isOpen,
  onClose,
  transactions,
  onSaved,
}: CategoryFixedTransactionsEditorProps) {
  const [rows, setRows] = useState<Record<number, EditRow>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const initial: Record<number, EditRow> = {}
      transactions.forEach((t) => {
        initial[t.id] = {
          name: t.name,
          amount: String(t.amount ?? ''),
          description: t.description ?? '',
          isActive: !!t.isActive,
          toDelete: false,
        }
      })
      setRows(initial)
      setError(null)
    }
  }, [isOpen, transactions])

  const hasChanges = useMemo(() => {
    return transactions.some((t) => {
      const r = rows[t.id]
      if (!r) return false
      const amt = Number(r.amount || 0)
      return (
        r.toDelete === true ||
        r.name !== t.name ||
        (!Number.isNaN(amt) && amt !== t.amount) ||
        r.description !== (t.description || '') ||
        r.isActive !== !!t.isActive
      )
    })
  }, [rows, transactions])

  const handleChange = (id: number, field: keyof EditRow, value: any) => {
    setRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }))
  }

  const handleSave = async () => {
    setError(null)
    try {
      setSaving(true)
      for (const t of transactions) {
        const r = rows[t.id]
        if (!r) continue
        const amt = Number(r.amount)
        if (r.toDelete) {
          await deleteFixedExpense(t.id)
          continue
        }

        const changed =
          r.name !== t.name ||
          (!Number.isNaN(amt) && amt !== t.amount) ||
          r.description !== (t.description || '') ||
          r.isActive !== !!t.isActive
        if (!changed) continue

        const payload: FixedTransactionRequest = {
          name: r.name,
          amount: Number.isNaN(amt) ? t.amount : amt,
          type: t.type,
          categoryId: t.categoryId,
          description: r.description,
          isActive: r.isActive,
        }
        await updateFixedTransaction(t.id, payload)
      }
      onSaved?.()
      onClose()
    } catch (e) {
      console.error('カテゴリ内固定収支の一括更新に失敗:', e)
      setError('保存に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const categoryName = transactions[0]?.category?.name || 'カテゴリ'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{categoryName} の固定収支を修正</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">無効化や金額・名称・説明の変更ができます</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}
          <div className="grid grid-cols-1 gap-2">
          {transactions.map((t) => {
            const r = rows[t.id]
            if (!r) return null
            const invalidAmount = r.amount !== '' && Number.isNaN(Number(r.amount))
              return (
                <div key={t.id} className={`flex items-start gap-3 p-3 rounded-xl border ${r.toDelete ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-700/30'}`}>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleChange(t.id, 'toDelete', !r.toDelete)}
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-sm font-semibold transition-colors ${
                        r.toDelete
                          ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                          : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700'
                      }`}
                      aria-pressed={r.toDelete}
                      title={r.toDelete ? '削除を取り消す' : '削除する'}
                    >
                      −
                    </button>
                  </div>
                  <div className="flex-1 grid grid-cols-12 gap-2">
                    <input
                      type="text"
                      value={r.name}
                      onChange={(e) => handleChange(t.id, 'name', e.target.value)}
                      className="col-span-4 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                      placeholder="名称"
                    />
                    <div className="col-span-3 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">¥</span>
                      <input
                        type="number"
                        value={r.amount}
                        onChange={(e) => handleChange(t.id, 'amount', e.target.value)}
                        className={`w-full pl-6 pr-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${invalidAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        placeholder="金額"
                        min="0"
                        step="1"
                      />
                    </div>
                    <input
                      type="text"
                      value={r.description}
                      onChange={(e) => handleChange(t.id, 'description', e.target.value)}
                      className="col-span-5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                      placeholder="説明（任意）"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3 bg-gray-50 dark:bg-gray-800/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm"
          >
            {saving ? '保存中…' : '変更を保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
