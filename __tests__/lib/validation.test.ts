import {
  validateBudgetAmount,
  validateFixedExpenseName,
  validateFixedExpenseAmount,
  validateDescription,
  validateYearMonth,
  validateBudgetForm,
  validateFixedExpenseForm
} from '../../app/lib/validation'

describe('Validation Functions', () => {
  describe('validateBudgetAmount', () => {
    it('should return null for valid amounts', () => {
      expect(validateBudgetAmount(100000)).toBeNull()
      expect(validateBudgetAmount(1)).toBeNull()
      expect(validateBudgetAmount(50000000)).toBeNull()
    })

    it('should return error for invalid amounts', () => {
      expect(validateBudgetAmount(0)).toBe('金額は0より大きい値を入力してください')
      expect(validateBudgetAmount(-1000)).toBe('金額は0より大きい値を入力してください')
      expect(validateBudgetAmount(NaN)).toBe('有効な数値を入力してください')
      expect(validateBudgetAmount(100000001)).toBe('金額が大きすぎます')
    })
  })

  describe('validateFixedExpenseName', () => {
    it('should return null for valid names', () => {
      expect(validateFixedExpenseName('家賃')).toBeNull()
      expect(validateFixedExpenseName('光熱費')).toBeNull()
      expect(validateFixedExpenseName('a'.repeat(100))).toBeNull()
    })

    it('should return error for invalid names', () => {
      expect(validateFixedExpenseName('')).toBe('名前を入力してください')
      expect(validateFixedExpenseName('   ')).toBe('名前を入力してください')
      expect(validateFixedExpenseName('a'.repeat(101))).toBe('名前は100文字以内で入力してください')
    })
  })

  describe('validateFixedExpenseAmount', () => {
    it('should return null for valid amounts', () => {
      expect(validateFixedExpenseAmount(1000)).toBeNull()
      expect(validateFixedExpenseAmount(1)).toBeNull()
      expect(validateFixedExpenseAmount(9999999)).toBeNull()
    })

    it('should return error for invalid amounts', () => {
      expect(validateFixedExpenseAmount(0)).toBe('金額は0より大きい値を入力してください')
      expect(validateFixedExpenseAmount(-100)).toBe('金額は0より大きい値を入力してください')
      expect(validateFixedExpenseAmount(NaN)).toBe('有効な数値を入力してください')
      expect(validateFixedExpenseAmount(10000001)).toBe('金額が大きすぎます')
    })
  })

  describe('validateDescription', () => {
    it('should return null for valid descriptions', () => {
      expect(validateDescription('')).toBeNull()
      expect(validateDescription('短い説明')).toBeNull()
      expect(validateDescription('a'.repeat(500))).toBeNull()
    })

    it('should return error for too long descriptions', () => {
      expect(validateDescription('a'.repeat(501))).toBe('説明は500文字以内で入力してください')
    })
  })

  describe('validateYearMonth', () => {
    const currentYear = new Date().getFullYear()

    it('should return null for valid year and month', () => {
      expect(validateYearMonth(currentYear, 1)).toBeNull()
      expect(validateYearMonth(currentYear, 12)).toBeNull()
      expect(validateYearMonth(2020, 6)).toBeNull()
    })

    it('should return error for invalid year', () => {
      expect(validateYearMonth(1999, 1)).toBe('有効な年を入力してください')
      expect(validateYearMonth(currentYear + 11, 1)).toBe('有効な年を入力してください')
    })

    it('should return error for invalid month', () => {
      expect(validateYearMonth(currentYear, 0)).toBe('有効な月を入力してください')
      expect(validateYearMonth(currentYear, 13)).toBe('有効な月を入力してください')
    })
  })

  describe('validateBudgetForm', () => {
    const currentYear = new Date().getFullYear()

    it('should return empty object for valid form data', () => {
      const result = validateBudgetForm({
        year: currentYear,
        month: 6,
        amount: 300000
      })
      expect(result).toEqual({})
    })

    it('should return errors for invalid form data', () => {
      const result = validateBudgetForm({
        year: 1999,
        month: 13,
        amount: -1000
      })
      expect(result.yearMonth).toBe('有効な年を入力してください')
      expect(result.amount).toBe('金額は0より大きい値を入力してください')
    })
  })

  describe('validateFixedExpenseForm', () => {
    it('should return empty object for valid form data', () => {
      const result = validateFixedExpenseForm({
        name: '家賃',
        amount: 80000,
        description: '月額家賃'
      })
      expect(result).toEqual({})
    })

    it('should return errors for invalid form data', () => {
      const result = validateFixedExpenseForm({
        name: '',
        amount: -1000,
        description: 'a'.repeat(501)
      })
      expect(result.name).toBe('名前を入力してください')
      expect(result.amount).toBe('金額は0より大きい値を入力してください')
      expect(result.description).toBe('説明は500文字以内で入力してください')
    })
  })
})