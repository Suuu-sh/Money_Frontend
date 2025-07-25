export interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
  description: string
  createdAt: string
}

export interface Transaction {
  id: number
  type: 'income' | 'expense'
  amount: number
  categoryId: number
  category: Category
  description: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface Stats {
  totalIncome: number
  totalExpense: number
  currentBalance: number
  thisMonthIncome: number
  thisMonthExpense: number
  transactionCount: number
}

export interface MonthlySummary {
  year: number
  month: number
  totalIncome: number
  totalExpense: number
  balance: number
}

export interface CategorySummary {
  categoryId: number
  categoryName: string
  categoryIcon: string
  categoryColor: string
  type: string
  totalAmount: number
  count: number
}

export interface DailySummary {
  date: string
  totalIncome: number
  totalExpense: number
  balance: number
}