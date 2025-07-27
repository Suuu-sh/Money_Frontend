'use client'

import { useState } from 'react'
import { Transaction } from '../types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'

interface CalendarProps {
  transactions: Transaction[]
  onDateClick: (date: Date) => void
  selectedDate: Date | null
  onAddTransaction?: (date: Date) => void
  onMonthChange?: (date: Date) => void
}

export default function Calendar({ transactions, onDateClick, selectedDate, onAddTransaction, onMonthChange }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 各日の収支を計算
  const getDayTransactions = (date: Date) => {
    return transactions.filter(transaction => 
      isSameDay(new Date(transaction.date), date)
    )
  }

  const getDayBalance = (date: Date) => {
    const dayTransactions = getDayTransactions(date)
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    return { income, expense, balance: income - expense, count: dayTransactions.length }
  }

  const formatAmount = (amount: number) => {
    if (amount === 0) return ''
    return new Intl.NumberFormat('ja-JP', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount))
  }

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    onMonthChange?.(today)
  }

  // 週の開始を月曜日にするため、日曜日を最後に移動
  const weekDays = ['月', '火', '水', '木', '金', '土', '日']

  // カレンダーのグリッドを作成（月曜日始まり）
  const getCalendarDays = () => {
    const firstDay = monthStart.getDay()
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1 // 月曜日を0にする

    const calendarDays = []
    
    // 前月の日付を追加
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const date = new Date(monthStart)
      date.setDate(date.getDate() - (i + 1))
      calendarDays.push({ date, isCurrentMonth: false })
    }
    
    // 今月の日付を追加
    days.forEach(date => {
      calendarDays.push({ date, isCurrentMonth: true })
    })
    
    // 次月の日付を追加（35日になるまで）
    const remainingDays = 35 - calendarDays.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(monthEnd)
      date.setDate(date.getDate() + i)
      calendarDays.push({ date, isCurrentMonth: false })
    }
    
    return calendarDays
  }

  const calendarDays = getCalendarDays()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col md:h-full">
      {/* カレンダーヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900 touch-manipulation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-base font-medium text-gray-900 min-w-[100px] text-center">
              {format(currentMonth, 'yyyy/MM')}
            </h1>
            <button
              onClick={goToNextMonth}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900 touch-manipulation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button
            onClick={goToToday}
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-1.5 px-3 rounded-md transition-colors text-xs touch-manipulation"
          >
            今日
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-gray-200 flex-shrink-0">
        {weekDays.map((day, index) => (
          <div key={day} className={`py-2 sm:py-3 text-center text-xs sm:text-sm font-medium border-r border-gray-100 last:border-r-0 ${
            index === 5 ? 'text-blue-600' : index === 6 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 grid-rows-5 md:flex-1 min-h-0">
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const dayData = getDayBalance(date)
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const isTodayDate = isToday(date)
          const dayOfWeek = date.getDay()
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
          
          return (
            <div
              key={index}
              onClick={() => onDateClick(date)}
              className={`
                border-r border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 relative p-1 sm:p-2 touch-manipulation min-h-[60px] md:min-h-[80px]
                ${isSelected ? 'bg-blue-50 ring-1 ring-blue-200' : ''}
                ${isTodayDate ? 'bg-blue-50' : ''}
                ${!isCurrentMonth ? 'bg-gray-50/50' : ''}
                ${index % 7 === 6 ? 'border-r-0' : ''}
                ${index >= 35 ? 'border-b-0' : ''}
              `}
            >
              <div className="h-full flex flex-col">
                {/* 日付 */}
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span className={`text-xs sm:text-sm font-medium ${
                    isTodayDate ? 'bg-blue-600 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs' : 
                    isSelected ? 'text-blue-600' : 
                    !isCurrentMonth ? 'text-gray-400' :
                    isWeekend ? (dayOfWeek === 0 ? 'text-red-500' : 'text-blue-600') : 'text-gray-900'
                  }`}>
                    {format(date, 'd')}
                  </span>
                  {dayData.count > 0 && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-400 rounded-full"></div>
                  )}
                </div>
                
                {/* 取引情報 - 収支を色分けして表示 */}
                {isCurrentMonth && (
                  <div className="flex-1 space-y-0.5 sm:space-y-1 overflow-hidden">
                    {/* 収入表示（緑色） */}
                    {dayData.income > 0 && (
                      <div className="bg-green-100 text-green-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium truncate">
                        +¥{formatAmount(dayData.income)}
                      </div>
                    )}
                    
                    {/* 支出表示（赤色） */}
                    {dayData.expense > 0 && (
                      <div className="bg-red-100 text-red-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium truncate">
                        -¥{formatAmount(dayData.expense)}
                      </div>
                    )}
                    
                    {/* 取引件数が多い場合の表示 */}
                    {dayData.count > 2 && (
                      <div className="text-xs text-gray-500 font-medium">
                        他{dayData.count - 2}件
                      </div>
                    )}
                    
                    {/* 取引がない場合のプレースホルダー */}
                    {dayData.count === 0 && (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-lg text-gray-300 font-light">
                          +
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}