import React from 'react'
import Head from 'next/head'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import {
  useUser,
  useSession,
  useSupabaseClient,
} from '@supabase/auth-helpers-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { validateForm } from '../utils/general'
import {
  CATEGORIES,
  Category,
  CATEGORY_LABELS,
  ExpenseItem,
} from '../types/general'
import styles from '../styles/Home.module.css'

// TODO:
// 1. Create render view for items
// 2. Create labels
// 3. Sorting functionality, by month, etc.

// Local storage keys
const LS_CURRENT_ITEM_NAME = 'ExpenseTracker_CurrentItemName'
const LS_CURRENT_ITEM_CATEGORY = 'ExpenseTracker_CurrentItemCategory'
const LS_CURRENT_ITEM_PRICE = 'ExpenseTracker_CurrentItemPrice'
const LS_DARK_MODE = 'ExpenseTracker_DarkMode'

// Default state values
const CURRENT_ITEM_DEFAULT_PRICE = 0
const CURRENT_ITEM_DEFAULT_NAME = ''
const CURRENT_ITEM_DEFAULT_CATEGORY = CATEGORIES.gas as Category
const CURRENT_ITEM_DEFAULT_DATE = new Date()
const ITEMS_DEFAULT_VALUE = [] as ExpenseItem[]
const STATUS_MESSAGE_DEFAULT_VALUE = [] as string[]
const DARK_MODE_DEFAULT_VALUE = true

export default function Home() {
  const user = useUser()
  const session = useSession()
  const supabase = useSupabaseClient()

  const [expenseItems, setExpenseItems] = React.useState(ITEMS_DEFAULT_VALUE)
  const [statusMessage, setStatusMessage] = React.useState(
    STATUS_MESSAGE_DEFAULT_VALUE
  )
  const [currentItemName, setCurrentItemName] = React.useState(
    CURRENT_ITEM_DEFAULT_NAME
  )
  const [currentItemCategory, setCurrentItemCategory] = React.useState(
    CURRENT_ITEM_DEFAULT_CATEGORY
  )
  const [currentItemPrice, setCurrentItemPrice] = React.useState(
    CURRENT_ITEM_DEFAULT_PRICE
  )
  const [currentItemDate, setCurrentItemDate] = React.useState(
    CURRENT_ITEM_DEFAULT_DATE
  )

  const [darkMode, setDarkMode] = React.useState(DARK_MODE_DEFAULT_VALUE)
  const [loading, setLoading] = React.useState(false)

  const handleDarkModeButtonToggle = () => {
    setDarkMode(!darkMode)
    localStorage.setItem(LS_DARK_MODE, JSON.stringify(!darkMode))
  }

  const handleCurrentItemNameChange = (event) => {
    setCurrentItemName(event.target.value)
    localStorage.setItem(LS_CURRENT_ITEM_NAME, event.target.value)
  }

  const handleCurrentItemCategoryChange = (event) => {
    setCurrentItemCategory(event.target.value)
    localStorage.setItem(LS_CURRENT_ITEM_CATEGORY, event.target.value)
  }

  const handleCurrentItemPriceChange = (event) => {
    setCurrentItemPrice(event.target.value)
    localStorage.setItem(LS_CURRENT_ITEM_PRICE, event.target.value)
  }

  const handleCurrentItemDateChange = (date) => {
    setCurrentItemDate(date)
  }

  const handleSaveCurrentItem = (event) => {
    event.preventDefault()

    const newItem = {
      name: currentItemName,
      category: currentItemCategory,
      price: currentItemPrice,
      date: currentItemDate,
    }

    const formValidationInfo = validateForm(newItem)
    setStatusMessage(formValidationInfo.statusMessage)

    if (!formValidationInfo.isValid) {
      return
    }

    const newItems = [...expenseItems, newItem]

    // Update local state
    setExpenseItems(newItems)

    // Save to Supabase
    insertExpense()

    // Clear the form
    setCurrentItemName(CURRENT_ITEM_DEFAULT_NAME)
    setCurrentItemPrice(CURRENT_ITEM_DEFAULT_PRICE)

    // Clear LS
    localStorage.setItem(LS_CURRENT_ITEM_NAME, CURRENT_ITEM_DEFAULT_NAME)
    localStorage.setItem(
      LS_CURRENT_ITEM_PRICE,
      JSON.stringify(CURRENT_ITEM_DEFAULT_PRICE)
    )
  }

  React.useEffect(() => {
    ;(async function () {
      try {
        setLoading(true)

        let { data, error, status } = await supabase
          .from('expenses')
          .select(`name, category, date, price`)
          .eq('user_id', user.id)

        if (error && status !== 406) {
          throw error
        }

        if (data) {
          setExpenseItems(data)
        }
      } catch (error) {
        console.error('Error loading user data!', error)
      } finally {
        setLoading(false)
      }
    })()
  }, [session])

  async function insertExpense() {
    try {
      setLoading(true)

      const newExpense = {
        user_id: user.id,
        name: currentItemName,
        category: currentItemCategory,
        price: currentItemPrice,
        date: currentItemDate,
      }

      let { error } = await supabase.from('expenses').insert(newExpense)

      if (error) throw error
    } catch (error) {
      console.error('Failed inserting expense!', error)
      setStatusMessage([
        ...statusMessage,
        `Could not save entry!: ${error.message}`,
      ])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    // Check and set app dark mode
    const darkModeFromLS = localStorage.getItem(LS_DARK_MODE)
    if (darkModeFromLS) {
      setDarkMode(JSON.parse(darkModeFromLS))
    } else {
      localStorage.setItem(LS_DARK_MODE, JSON.stringify(darkMode))
    }

    // Update app state with current item data from LS
    const currentItemNameFromLS = localStorage.getItem(LS_CURRENT_ITEM_NAME)
    if (currentItemNameFromLS) {
      setCurrentItemName(currentItemNameFromLS)
    }

    const currentItemCategoryFromLS = localStorage.getItem(
      LS_CURRENT_ITEM_CATEGORY
    )
    if (currentItemCategoryFromLS) {
      setCurrentItemCategory(currentItemCategoryFromLS as Category)
    }

    const currentItemPriceFromLS = localStorage.getItem(LS_CURRENT_ITEM_PRICE)
    if (currentItemPriceFromLS) {
      setCurrentItemPrice(Number(currentItemPriceFromLS))
    }
  }, [])

  console.log(
    'currentItem: ',
    currentItemName,
    currentItemCategory,
    currentItemPrice
  )
  console.log('user', user)
  console.log('items from DB: ', expenseItems)

  return (
    <div
      className={`expense-tracker-app-container ${darkMode ? 'dark-mode' : ''}`}
    >
      <Head>
        <title>Expense Tracker</title>
        <meta name="description" content="Expense tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.userName}>{user?.email}</div>
        <button
          className={styles.darkModeButton}
          onClick={handleDarkModeButtonToggle}
        >
          {darkMode ? '☀️' : '🌑'}
        </button>
        <h1 className={styles.title}>Expense Tracker</h1>
        {!session ? (
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
          />
        ) : (
          <>
            <div>
              <form className={styles.form}>
                <input
                  className={styles.formElement}
                  name="name"
                  type="text"
                  value={currentItemName}
                  onChange={handleCurrentItemNameChange}
                  required
                />

                <select
                  className={styles.formElement}
                  name="category"
                  value={currentItemCategory}
                  onChange={handleCurrentItemCategoryChange}
                >
                  {Object.keys(CATEGORIES).map((category) => (
                    <option key={category} value={CATEGORIES[category]}>
                      {CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>

                <input
                  className={styles.formElement}
                  name="price"
                  type="number"
                  value={currentItemPrice}
                  onChange={handleCurrentItemPriceChange}
                />

                <DatePicker
                  className={styles.formElement}
                  selected={currentItemDate}
                  onChange={handleCurrentItemDateChange}
                />

                <button
                  className={`${styles.formElement} ${styles.saveButton}`}
                  onClick={handleSaveCurrentItem}
                >
                  Save
                </button>
              </form>
            </div>

            <div>
              {statusMessage &&
                statusMessage.map((status) => (
                  <div key={status} className={styles.statusMessage}>
                    {status}
                  </div>
                ))}
            </div>

            {/* TODO: */}
            {/* Dashboard view of items, will be elsewhere */}
            <div>
              {loading && 'Loading...'}
              <pre>{JSON.stringify(expenseItems, null, 4)}</pre>
            </div>
          </>
        )}
      </main>
      <footer className={styles.footer}>
        {/* TODO: WIP */}
        {/* Buttons for dashboard view */}
        <div className={styles.dashboardButtons}>
          <button className={styles.dashboardButton}>Dashboard 1</button>
          <button className={styles.dashboardButton}>Dashboard 2</button>
          <button className={styles.dashboardButton}>Dashboard 3</button>
        </div>
        <p>Copyright © 2022-{new Date().getFullYear()} Georgi Yanev</p>
      </footer>
    </div>
  )
}
