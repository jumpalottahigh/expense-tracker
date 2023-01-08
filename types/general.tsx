export type Category =
  | 'gas'
  | 'groceries'
  | 'maintenance'
  | 'hobbyFun'
  | 'homeImprovements'
  | 'rent'
  | 'carBill'
  | 'utilityBill'
  | 'eatingOut'

export enum CATEGORIES {
  gas = 'gas',
  groceries = 'groceries',
  maintenance = 'maintenance',
  hobbyFun = 'hobbyFun',
  homeImprovements = 'homeImprovements',
  rent = 'rent',
  carBill = 'carBill',
  utilityBill = 'utilityBill',
  eatingOut = 'eatingOut',
}

export enum CATEGORY_LABELS {
  gas = '⛽ Gas',
  groceries = '🥦 Groceries',
  maintenance = '😎 Maintenance',
  hobbyFun = '🎞️ Hobby & Fun',
  homeImprovements = '🔨 Home Improvements',
  rent = '🏠 Rent',
  carBill = '🚗 Car Bill',
  utilityBill = '🚿 Utility Bill',
  eatingOut = '🍽️ Eating Out',
}

export enum CATEGORY_EMOJI {
  gas = '⛽',
  groceries = '🥦',
  maintenance = '😎',
  hobbyFun = '🎞️',
  homeImprovements = '🔨',
  rent = '🏠',
  carBill = '🚗',
  utilityBill = '🚿',
  eatingOut = '🍽️',
}

export type ExpenseItem = {
  name: string
  category: Category
  price: number
  date: string
}
