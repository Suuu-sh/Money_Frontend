'use client'

import { useState } from 'react'
import { BudgetAnalysis } from '../../types'
import { 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline'

interface BudgetAlertsProps {
  analysis: BudgetAnalysis | null
}

export default function BudgetAlerts({ analysis }: BudgetAlertsProps) {
  // 仕様変更により、予算アラートは全て非表示にする
  // 将来的に復活させる場合は、過去の実装を参照
  return null
}
