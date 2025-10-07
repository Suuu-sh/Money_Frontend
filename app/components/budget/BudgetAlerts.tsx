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
  // Budget alerts are currently disabled — see previous implementation if reinstated
  // in future product updates.
  return null
}
