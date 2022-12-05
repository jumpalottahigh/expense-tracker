import React from "react"
import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"

// TODO: Next
// 1) Add date selector and update the schema
// 2) First version of the dashboard - super simple to begin with
// 3) Persist data - Supabase, Firebase?
// 4) Figure out auth
// 5) Styling

// const dummyData = [
//   {
//     name: "Prisma",
//     category: "groceries", // take away food | groceries | maintenance | fun / hobby | gas | (home upgrades, or potentially other expenses)
//     price: 72,
//   },
//   {
//     name: "Prisma",
//     category: "groceries", //
//     price: 52,
//   },
//   {
//     name: "Gas",
//     category: "gas", //
//     price: 60,
//   },
// ]

const CATEGORIES = {
  gas: "gas",
  groceries: "groceries",
}

const LS_ITEMS_KEY = "ExpenseTracker_AllItems"
const CURRENT_ITEM_DEFAULT_NAME = ""
const CURRENT_ITEM_DEFAULT_PRICE = 0
const ITEMS_DEFAULT_VALUE = []

export default function Home() {
  const [items, setItems] = React.useState(ITEMS_DEFAULT_VALUE)
  const [currentItemName, setCurrentItemName] = React.useState(
    CURRENT_ITEM_DEFAULT_NAME
  )
  const [currentItemCategory, setCurrentItemCategory] = React.useState(
    CATEGORIES.gas
  )
  const [currentItemPrice, setCurrentItemPrice] = React.useState(
    CURRENT_ITEM_DEFAULT_PRICE
  )

  const handleCurrentItemNameChange = (event) => {
    setCurrentItemName(event.target.value)
  }

  const handleCurrentItemCategoryChange = (event) => {
    setCurrentItemCategory(event.target.value)
  }

  const handleCurrentItemPriceChange = (event) => {
    setCurrentItemPrice(event.target.value)
  }

  const handleSaveCurrentItem = (event) => {
    event.preventDefault()

    console.log("items: ", items)

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
  }, [])

  console.log("items: ", items)
  // console.log("currentItemName: ", currentItemName)
  // console.log("currentItemCategory: ", currentItemCategory)
  // console.log("currentItemPrice: ", currentItemPrice)

  return (
    <div className={styles.container}>
      <Head>
        <title>Expense Tracker</title>
        <meta name="description" content="Expense tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
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
              <option value={CATEGORIES.gas}>{CATEGORIES.gas}</option>
              <option value={CATEGORIES.groceries}>
                {CATEGORIES.groceries}
              </option>
            </select>

            <input
              name="price"
              type="number"
              value={currentItemPrice}
              onChange={handleCurrentItemPriceChange}
            />

            <button onClick={handleSaveCurrentItem}>Save</button>
          </form>
        </div>

        <div>
          <h2>Dashboard</h2>

          <div>
            items:
            <pre style={{ whiteSpace: "break-spaces" }}>
              {JSON.stringify(items)}
              {/* {expenseItems.map((item) => (
                <div>{JSON.stringify(item)}</div>
              ))} */}
            </pre>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        Copyright © 2022-{new Date().getFullYear()} Georgi Yanev.
      </footer>
    </div>
  )
}
