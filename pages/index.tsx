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

import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { validateForm } from '../utils'
import { CATEGORIES, Category, CATEGORY_LABELS } from '../types/general'
import styles from '../styles/Home.module.css'
import { DB_TABLE } from '../components/constants'
import { ExpenseItem } from '../types/general'

// TODO:
// 1. Create render view for items
// 2. Create labels
// 3. Sorting functionality, by month, etc.

// Local storage keys
const LS_CURRENT_ITEM_NAME = 'ExpenseTracker_CurrentItemName'
const LS_CURRENT_ITEM_CATEGORY = 'ExpenseTracker_CurrentItemCategory'
const LS_CURRENT_ITEM_PRICE = 'ExpenseTracker_CurrentItemPrice'

// Default state values
const CURRENT_ITEM_DEFAULT_PRICE = 0
const CURRENT_ITEM_DEFAULT_NAME = ''
const CURRENT_ITEM_DEFAULT_CATEGORY = CATEGORIES.gas as Category
const CURRENT_ITEM_DEFAULT_DATE = new Date()
const STATUS_MESSAGE_DEFAULT_VALUE = [] as string[]

export default function Home() {
  const user = useUser()
  const session = useSession()
  const supabase = useSupabaseClient()

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

  const [loading, setLoading] = React.useState(false)

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
      date: currentItemDate.toString(),
    } as ExpenseItem

    const formValidationInfo = validateForm(newItem)
    setStatusMessage(formValidationInfo.statusMessage)

    if (!formValidationInfo.isValid) {
      return
    }

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

      let { error } = await supabase.from(DB_TABLE).insert(newExpense)

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

  return (
    <div
      // TODO: make darkMode a hook and reuse it
      className="expense-tracker-app-container dark-mode"
    >
      <Head>
        <title>Expense Tracker</title>
        <meta name="description" content="Expense tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Nav />
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
            {loading && 'Loading...'}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
