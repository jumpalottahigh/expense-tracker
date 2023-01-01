import React from 'react'
import Head from 'next/head'
import {
  useUser,
  useSession,
  useSupabaseClient,
} from '@supabase/auth-helpers-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  getCurrentMonthItems,
  getItemsInMonthAndYear,
  renderXAxisDate,
  sortItemsByCategory,
} from '../utils'
import { ExpenseItem } from '../types/general'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { DB_TABLE } from '../components/constants'
import styles from '../styles/Overview.module.css'

const ITEMS_DEFAULT_VALUE = [] as ExpenseItem[]

export default function Overview() {
  const user = useUser()
  const session = useSession()
  const supabase = useSupabaseClient()
  const [loading, setLoading] = React.useState(false)
  const [expenseItems, setExpenseItems] = React.useState(ITEMS_DEFAULT_VALUE) // All items from the table
  const [currentMonthItems, setCurrentMonthItems] = React.useState([]) // Only the current month items
  const [currentMonthItemsByCategory, setCurrentMonthItemsByCategory] =
    React.useState({}) // An object with categories of the current month items
  const [selectedMonth, setSelectedMonth] = React.useState(11)
  const [selectedYear, setSelectedYear] = React.useState(2022)

  const handleChangeSelectedMonth = (event) => {
    setSelectedMonth(event.target.value)
  }

  const handleChangeSelectedYear = (event) => {
    setSelectedYear(event.target.value)
  }

  React.useEffect(() => {
    ;(async function () {
      try {
        setLoading(true)

        let { data, error, status } = await supabase
          .from(DB_TABLE)
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

  React.useEffect(() => {
    if (!expenseItems) return

    // const itemsThisMonth = getCurrentMonthItems(expenseItems)
    const itemsThisMonth = getItemsInMonthAndYear(
      expenseItems,
      selectedMonth,
      selectedYear
    )
    setCurrentMonthItems(itemsThisMonth)
    setCurrentMonthItemsByCategory(sortItemsByCategory(itemsThisMonth))
  }, [expenseItems, selectedMonth, selectedYear])

  console.log('expenseItems: ', expenseItems)
  console.log('currentMonthItems: ', currentMonthItems)
  console.log('currentMonthItemsByCategory: ', currentMonthItemsByCategory)

  return (
    <div
      // TODO: make darkMode a hook and reuse it
      className="expense-tracker-app-container dark-mode"
    >
      <Head>
        <title>Expense Tracker: Overview</title>
      </Head>
      <main className="">
        <Nav />
        {/* TODO: BarChart */}
        {/* 1. Able to see totals by category */}
        {/* 2. Able to switch from current to previous months */}
        <div className={styles.chartContainer}>
          <select
            className={styles.chartSelectedMonth}
            name="selectedMonth"
            value={selectedMonth}
            onChange={handleChangeSelectedMonth}
          >
            <option value={0}>January</option>
            <option value={1}>February</option>
            <option value={2}>March</option>
            <option value={3}>April</option>
            <option value={4}>May</option>
            <option value={5}>June</option>
            <option value={6}>July</option>
            <option value={7}>August</option>
            <option value={8}>September</option>
            <option value={9}>October</option>
            <option value={10}>November</option>
            <option value={11}>December</option>
          </select>
          <select
            className={styles.chartSelectedYear}
            name="selectedYear"
            value={selectedYear}
            onChange={handleChangeSelectedYear}
          >
            <option value={2022}>2022</option>
            <option value={2023}>2023</option>
          </select>

          <BarChart width={730} height={250} data={expenseItems}>
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            <XAxis dataKey="date" />
            {/* <XAxis dataKey="date" tick={renderXAxisDate} /> */}
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="price" fill="#8884d8" />
            {/* <Bar dataKey="category" fill="#82ca9d" /> */}
          </BarChart>

          {/* TODO: LineChart over months of spending by category */}
          <LineChart width={400} height={400} data={currentMonthItems}>
            <Line type="monotone" dataKey="price" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="name" />
            <YAxis />
          </LineChart>
        </div>

        <div>{loading && 'Loading...'}</div>
      </main>
      <Footer />
    </div>
  )
}
