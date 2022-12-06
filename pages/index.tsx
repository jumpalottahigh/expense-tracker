import React from 'react'
import Head from 'next/head'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import DatePicker from 'react-datepicker'

import { CATEGORIES, Category } from './types/general'
import 'react-datepicker/dist/react-datepicker.css'
import styles from '../styles/Home.module.css'

// TODO: Next
// ✔️ 1) Add date selector and update the schema
// 2) First version of the dashboard - super simple to begin with
// ✔️ 3) Persist data - Supabase, Firebase?
// ✔️ 4) Figure out auth
// 5) Styling

// Local storage keys
const LS_ITEMS_KEY = 'ExpenseTracker_AllItems'
const LS_CURRENT_ITEM_NAME = 'ExpenseTracker_CurrentItemName'
const LS_CURRENT_ITEM_CATEGORY = 'ExpenseTracker_CurrentItemCategory'
const LS_CURRENT_ITEM_PRICE = 'ExpenseTracker_CurrentItemPrice'

// Default state values
const CURRENT_ITEM_DEFAULT_NAME = ''
const CURRENT_ITEM_DEFAULT_PRICE = 0
const CURRENT_ITEM_DEFAULT_CATEGORY = CATEGORIES.gas as Category
const CURRENT_ITEM_DEFAULT_DATE = new Date()
const ITEMS_DEFAULT_VALUE = []

export default function Home() {
  const session = useSession()
  const supabase = useSupabaseClient()

  const [items, setItems] = React.useState(ITEMS_DEFAULT_VALUE)
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

  const handleCurrentItemNameChange = (event) => {
    setCurrentItemName(event.target.value)
    // TODO: if we ever decide to save the current item state in the DB, this will have to be debounced
    localStorage.setItem(LS_CURRENT_ITEM_NAME, event.target.value)
  }

  const handleCurrentItemCategoryChange = (event) => {
    setCurrentItemCategory(event.target.value)
    localStorage.setItem(LS_CURRENT_ITEM_CATEGORY, event.target.value)
  }

  const handleCurrentItemPriceChange = (event) => {
    setCurrentItemPrice(event.target.value)
    // TODO: if we ever decide to save the current item state in the DB, this will have to be debounced
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
    }

    const newItems = [...items, newItem]

    // Update local state
    setItems(newItems)

    // Save to LS
    localStorage.setItem(LS_ITEMS_KEY, JSON.stringify(newItems))
    localStorage.setItem(LS_CURRENT_ITEM_NAME, CURRENT_ITEM_DEFAULT_NAME)
    localStorage.setItem(
      LS_CURRENT_ITEM_PRICE,
      String(CURRENT_ITEM_DEFAULT_PRICE)
    )

    // Clear the form
    setCurrentItemName(CURRENT_ITEM_DEFAULT_NAME)
    setCurrentItemPrice(CURRENT_ITEM_DEFAULT_PRICE)
  }

  React.useEffect(() => {
    // Fetch items from LS
    const itemsFromLS = localStorage.getItem(LS_ITEMS_KEY)

    if (itemsFromLS) {
      setItems(JSON.parse(itemsFromLS))
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
  console.log('items: ', items)

  return (
    <div className={styles.container}>
      <Head>
        <title>Expense Tracker</title>
        <meta name="description" content="Expense tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        {!session ? (
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
          />
        ) : (
          <>
            <h1 className={styles.title}>Expense Tracker</h1>

            <div>
              <form>
                <input
                  name="name"
                  type="text"
                  value={currentItemName}
                  onChange={handleCurrentItemNameChange}
                />

                <select
                  name="category"
                  value={currentItemCategory}
                  onChange={handleCurrentItemCategoryChange}
                >
                  {Object.keys(CATEGORIES).map((category) => (
                    <option key={category} value={CATEGORIES[category]}>
                      {CATEGORIES[category]}
                    </option>
                  ))}
                </select>

                <input
                  name="price"
                  type="number"
                  value={currentItemPrice}
                  onChange={handleCurrentItemPriceChange}
                />

                <DatePicker
                  selected={currentItemDate}
                  onChange={handleCurrentItemDateChange}
                />

                <button onClick={handleSaveCurrentItem}>Save</button>
              </form>
            </div>

            <div>
              <h2>Dashboard</h2>

              <div>
                items:
                <pre style={{ whiteSpace: 'break-spaces' }}>
                  {JSON.stringify(items)}
                </pre>
              </div>
            </div>
          </>
        )}
      </main>
      <footer className={styles.footer}>
        Copyright © 2022-{new Date().getFullYear()} Georgi Yanev.
      </footer>
    </div>
  )
}
