import { getMonth, getYear, isThisMonth, parseISO } from 'date-fns'

import { ExpenseItem } from '../types/general'

export function renderXAxisDate({ x, y, payload }) {
  console.log('payload: ', payload)

  return new Date(payload.value).toDateString()
}

/**
 * Takes in an ExpenseItem[] and returns only the items from the current month, based on their date
 * @param items
 * @returns an ExpenseItem[]
 */
export function getCurrentMonthItems(items: ExpenseItem[]): ExpenseItem[] {
  const thisMonthItems = []

  items.forEach((item) => {
    if (isThisMonth(parseISO(item.date))) {
      thisMonthItems.push(item)
    }
  })

  return thisMonthItems
}

/**
 * Takes in an ExpenseItem[], a month number, and a year and returns only the items from that month, based on their date
 * @param items
 * @param month
 * @param year
 * @returns an ExpenseItem[]
 */
export function getItemsInMonthAndYear(
  items: ExpenseItem[],
  month: number,
  year: number
): ExpenseItem[] {
  const itemsInMonth = []

  items.forEach((item) => {
    console.log('compare1: ', getMonth(parseISO(item.date)))
    console.log('compare2: ', month)
    const parsedDate = parseISO(item.date)
    if (
      getMonth(parsedDate) === Number(month) &&
      getYear(parsedDate) === Number(year)
    ) {
      itemsInMonth.push(item)
    }
  })

  return itemsInMonth
}

/**
 * Takes in an ExpenseItem[] and returns an object with categories and the items belonging to it inside
 * @param items
 * @returns an object with category keys that contain the corresponding ExpenseItem[] based on their category key value
 */
export function sortItemsByCategory(items: ExpenseItem[]) {
  const results = {}

  items.forEach((item) => {
    if (!results.hasOwnProperty(item.category)) {
      results[item.category] = []
    }

    results[item.category].push(item)
  })

  return results
}
