'use client'

import React from 'react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  rightSlot?: React.ReactNode
}

// Shared section header that optionally renders an action slot
export default function SectionHeader({ title, subtitle, icon, rightSlot }: SectionHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {rightSlot && (
          <div className="flex items-center">{rightSlot}</div>
        )}
      </div>
    </div>
  )
}
