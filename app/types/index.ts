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

export interface Budget {
  id: number
  year: number
  month: number
  amount: number
  createdAt: string
  updatedAt: string
}

export interface FixedExpense {
  id: number
  name: string
  amount: number
  categoryId: number
  category: Category
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FixedTransaction {
  id: number
  name: string
  amount: number
  type: 'income' | 'expense'
  categoryId: number
  category: Category
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BudgetAnalysis {
  year: number
  month: number
  monthlyBudget: number
  totalFixedExpenses: number
  currentSpending: number
  remainingBudget: number
  budgetUtilization: number
  daysRemaining: number
  dailyAverage: number
}

export interface BudgetHistory {
  year: number
  month: number
  budget: number
  actualSpending: number
  fixedExpenses: number
  savingsRate: number
  budgetExceeded: boolean
}

export interface BudgetRequest {
  year: number
  month: number
  amount: number
}

export interface FixedExpenseRequest {
  name: string
  amount: number
  categoryId: number
  description: string
  isActive?: boolean
}

export interface FixedTransactionRequest {
  name: string
  amount: number
  type: 'income' | 'expense'
  categoryId: number
  description: string
  isActive?: boolean
}

export interface CategoryBudget {
  id: number
  categoryId: number
  category: Category
  year: number
  month: number
  amount: number
  spent: number
  remaining: number
  utilizationRate: number
  createdAt: string
  updatedAt: string
}

export interface CategoryBudgetRequest {
  categoryId: number
  year: number
  month: number
  amount: number
}

export interface CategoryBudgetAnalysis {
  categoryId: number
  categoryName: string
  categoryColor: string
  categoryIcon: string
  budgetAmount: number
  spentAmount: number
  remainingAmount: number
  utilizationRate: number
  isOverBudget: boolean
  transactionCount: number
}