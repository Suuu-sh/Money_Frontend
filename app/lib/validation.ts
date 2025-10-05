// バリデーション関数

// 予算金額が適切な範囲かを検証
export const validateBudgetAmount = (amount: number): string | null => {
  if (isNaN(amount)) {
    return '有効な数値を入力してください'
  }
  if (amount <= 0) {
    return '金額は0より大きい値を入力してください'
  }
  if (amount > 100000000) {
    return '金額が大きすぎます'
  }
  return null
}

// 固定費の名称が未入力・長すぎないか確認
export const validateFixedExpenseName = (name: string): string | null => {
  if (!name.trim()) {
    return '名前を入力してください'
  }
  if (name.trim().length > 100) {
    return '名前は100文字以内で入力してください'
  }
  return null
}

// 固定費金額の範囲チェック
export const validateFixedExpenseAmount = (amount: number): string | null => {
  if (isNaN(amount)) {
    return '有効な数値を入力してください'
  }
  if (amount <= 0) {
    return '金額は0より大きい値を入力してください'
  }
  if (amount > 10000000) {
    return '金額が大きすぎます'
  }
  return null
}

// 有効な長さの説明文か判定
export const validateDescription = (description: string): string | null => {
  if (description.length > 500) {
    return '説明は500文字以内で入力してください'
  }
  return null
}

// 指定された年月が現実的な値か検証
export const validateYearMonth = (year: number, month: number): string | null => {
  const currentYear = new Date().getFullYear()
  
  if (year < 2000 || year > currentYear + 10) {
    return '有効な年を入力してください'
  }
  
  if (month < 1 || month > 12) {
    return '有効な月を入力してください'
  }
  
  return null
}

// フォームデータの包括的バリデーション
export const validateBudgetForm = (data: {
  year: number
  month: number
  amount: number
}): { [key: string]: string } => {
  const errors: { [key: string]: string } = {}
  
  const yearMonthError = validateYearMonth(data.year, data.month)
  if (yearMonthError) {
    errors.yearMonth = yearMonthError
  }
  
  const amountError = validateBudgetAmount(data.amount)
  if (amountError) {
    errors.amount = amountError
  }
  
  return errors
}

// 有効なカテゴリIDが渡されているか確認
export const validateCategoryId = (categoryId: number): string | null => {
  if (!categoryId || categoryId <= 0) {
    return 'カテゴリを選択してください'
  }
  return null
}

export const validateFixedExpenseForm = (data: {
  name: string
  amount: number
  categoryId: number
  description: string
}): { [key: string]: string } => {
  const errors: { [key: string]: string } = {}
  
  const nameError = validateFixedExpenseName(data.name)
  if (nameError) {
    errors.name = nameError
  }
  
  const amountError = validateFixedExpenseAmount(data.amount)
  if (amountError) {
    errors.amount = amountError
  }
  
  const categoryError = validateCategoryId(data.categoryId)
  if (categoryError) {
    errors.categoryId = categoryError
  }
  
  const descriptionError = validateDescription(data.description)
  if (descriptionError) {
    errors.description = descriptionError
  }
  
  return errors
}
