import axios from 'axios'
import { 
  Transaction, 
  Category, 
  Stats, 
  MonthlySummary, 
  CategorySummary, 
  DailySummary,
  Budget,
  FixedExpense,
  BudgetAnalysis,
  BudgetHistory,
  BudgetRequest,
  FixedExpenseRequest
} from '../types'

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api' 
  : 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Transactions API
export const fetchTransactions = async (params?: {
  page?: number
  limit?: number
  type?: string
  categoryId?: string
  startDate?: string
  endDate?: string
}): Promise<Transaction[]> => {
  const response = await api.get('/transactions', { params })
  return response.data
}

export const fetchTransaction = async (id: number): Promise<Transaction> => {
  const response = await api.get(`/transactions/${id}`)
  return response.data
}

export const createTransaction = async (transaction: Partial<Transaction>): Promise<Transaction> => {
  const response = await api.post('/transactions', transaction)
  return response.data
}

export const updateTransaction = async (id: number, transaction: Partial<Transaction>): Promise<Transaction> => {
  const response = await api.put(`/transactions/${id}`, transaction)
  return response.data
}

export const deleteTransaction = async (id: number): Promise<void> => {
  await api.delete(`/transactions/${id}`)
}

// Categories API
export const fetchCategories = async (type?: string): Promise<Category[]> => {
  const response = await api.get('/categories', { params: { type } })
  return response.data
}

export const createCategory = async (category: Partial<Category>): Promise<Category> => {
  const response = await api.post('/categories', category)
  return response.data
}

export const updateCategory = async (id: number, category: Partial<Category>): Promise<Category> => {
  const response = await api.put(`/categories/${id}`, category)
  return response.data
}

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/categories/${id}`)
}

// Stats API
export const fetchStats = async (): Promise<Stats> => {
  const response = await api.get('/stats')
  return response.data
}

export const fetchMonthlySummary = async (year?: number): Promise<MonthlySummary[]> => {
  const response = await api.get('/summary/monthly', { params: { year } })
  return response.data
}

export const fetchCategorySummary = async (params?: {
  type?: string
  startDate?: string
  endDate?: string
}): Promise<CategorySummary[]> => {
  const response = await api.get('/summary/category', { params })
  return response.data
}

export const fetchDailySummary = async (params?: {
  startDate?: string
  endDate?: string
}): Promise<DailySummary[]> => {
  const response = await api.get('/summary/daily', { params })
  return response.data
}

// Budget API
export const fetchBudget = async (year: number, month: number): Promise<Budget> => {
  const response = await api.get(`/budget/${year}/${month}`)
  return response.data
}

export const createBudget = async (budget: BudgetRequest): Promise<Budget> => {
  const response = await api.post('/budget', budget)
  return response.data
}

export const updateBudget = async (id: number, budget: BudgetRequest): Promise<Budget> => {
  const response = await api.put(`/budget/${id}`, budget)
  return response.data
}

export const deleteBudget = async (id: number): Promise<void> => {
  await api.delete(`/budget/${id}`)
}

// Fixed Expenses API
export const fetchFixedExpenses = async (): Promise<FixedExpense[]> => {
  const response = await api.get('/fixed-expenses')
  return response.data
}

export const createFixedExpense = async (fixedExpense: FixedExpenseRequest): Promise<FixedExpense> => {
  const response = await api.post('/fixed-expenses', fixedExpense)
  return response.data
}

export const updateFixedExpense = async (id: number, fixedExpense: FixedExpenseRequest): Promise<FixedExpense> => {
  const response = await api.put(`/fixed-expenses/${id}`, fixedExpense)
  return response.data
}

export const deleteFixedExpense = async (id: number): Promise<void> => {
  await api.delete(`/fixed-expenses/${id}`)
}

// Budget Analysis API
export const fetchBudgetAnalysis = async (year: number, month: number): Promise<BudgetAnalysis> => {
  const response = await api.get(`/budget/analysis/${year}/${month}`)
  return response.data
}

export const fetchRemainingBudget = async (year: number, month: number): Promise<{
  remainingBudget: number
  monthlyBudget: number
  fixedExpenses: number
  currentSpending: number
}> => {
  const response = await api.get(`/budget/remaining/${year}/${month}`)
  return response.data
}

export const fetchBudgetHistory = async (): Promise<BudgetHistory[]> => {
  const response = await api.get('/budget/history')
  return response.data
}