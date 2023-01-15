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
import { sumBy } from 'lodash'
import { format } from 'date-fns'

import {
  chartDataTotalPerCategory,
  getItemsInMonthAndYear,
  sortItemsByCategory,
} from '../utils'
import { CATEGORY_EMOJI, CATEGORY_LABELS, ExpenseItem } from '../types/general'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { DB_TABLE } from '../components/constants'
import styles from '../styles/Overview.module.css'

const MONTHS = {
  0: 'January',
  1: 'February',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December',
}

const ITEMS_DEFAULT_VALUE = [] as ExpenseItem[]

const MonthlyTotal = ({ total }) => (
  <div
    className={`${styles.monthlyTotal} ${
      total < 1200 ? styles.good : total < 1500 ? styles.average : styles.bad
    }`}
  >
    {total.toFixed(2)} €
  </div>
)

const ExpenseItemTable = ({ expenseItems }) => {
  return (
    <div className={styles.expenseItemTable}>
      <div className={`${styles.expenseItemTableRow} ${styles.tableHeader}`}>
        <span>Date</span>
        <span>Name</span>
        <span>Category</span>
        <span>Price</span>
      </div>
      {expenseItems.map((item) => (
        <div
          key={`${item.date}-${item.name}`}
          className={styles.expenseItemTableRow}
        >
          <time dateTime={item.date}>
            {format(new Date(item.date), 'dd.MM.yyyy')}
          </time>
          <span>{item.name}</span>
          <span>{CATEGORY_LABELS[item.category]}</span>
          <span className={styles.expenseItemPrice}>{item.price} €</span>
        </div>
      ))}
    </div>
  )
}

const CustomCategoriesAxis = (props) => {
  const { x, y, stroke, payload } = props

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666">
        {CATEGORY_EMOJI[payload.value]}
      </text>
    </g>
  )
}

const CustomTooltip = (props) => {
  const { active, payload, label } = props

  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        {CATEGORY_LABELS[label]}:
        <br />
        {payload[0].value.toFixed(2)} €
      </div>
    )
  }

  return null
}

export default function Overview() {
  const user = useUser()
  const session = useSession()
  const supabase = useSupabaseClient()
  const [loading, setLoading] = React.useState(false)
  const [expenseItems, setExpenseItems] = React.useState(ITEMS_DEFAULT_VALUE) // All items from the table
  const [currentMonthItems, setCurrentMonthItems] = React.useState([]) // Only the current month items
  const [currentMonthItemsByCategory, setCurrentMonthItemsByCategory] =
    React.useState({}) // An object with categories of the current month items

  const NOW = new Date()
  const DEFAULT_MONTH = NOW.getMonth()
  const DEFAULT_YEAR = NOW.getFullYear()
  const [selectedMonth, setSelectedMonth] = React.useState(DEFAULT_MONTH)
  const [selectedYear, setSelectedYear] = React.useState(DEFAULT_YEAR)
  const [chartData, setChartData] = React.useState([])

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

    const itemsThisMonth = getItemsInMonthAndYear(
      expenseItems,
      selectedMonth,
      selectedYear
    )

    const sortedItemsByCategoryPerDate = sortItemsByCategory(itemsThisMonth)
    setCurrentMonthItems(itemsThisMonth)
    setCurrentMonthItemsByCategory(sortedItemsByCategoryPerDate)
    setChartData(chartDataTotalPerCategory(sortedItemsByCategoryPerDate))
  }, [expenseItems, selectedMonth, selectedYear])

  // console.log('expenseItems: ', expenseItems)
  // console.log('currentMonthItems: ', currentMonthItems)
  // console.log('currentMonthItemsByCategory: ', currentMonthItemsByCategory)
  // console.log('chartData: ', chartData)
  // console.log('selectedMonth: ', selectedMonth)
  // console.log('selectedYear: ', selectedYear)

  return (
    <div
      // TODO: make darkMode a hook and reuse it
      className="expense-tracker-app-container dark-mode"
    >
      <Head>
        <title>Expense Tracker: Overview</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Nav />
      <main className={styles.overviewMain}>
        <div className={styles.chartContainer}>
          <select
            className={styles.chartSelectedMonth}
            name="selectedMonth"
            value={selectedMonth}
            onChange={handleChangeSelectedMonth}
          >
            <option value={0}>{MONTHS[0]}</option>
            <option value={1}>{MONTHS[1]}</option>
            <option value={2}>{MONTHS[2]}</option>
            <option value={3}>{MONTHS[3]}</option>
            <option value={4}>{MONTHS[4]}</option>
            <option value={5}>{MONTHS[5]}</option>
            <option value={6}>{MONTHS[6]}</option>
            <option value={7}>{MONTHS[7]}</option>
            <option value={8}>{MONTHS[8]}</option>
            <option value={9}>{MONTHS[9]}</option>
            <option value={10}>{MONTHS[10]}</option>
            <option value={11}>{MONTHS[11]}</option>
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
          <BarChart
            width={360}
            height={260}
            data={chartData}
            style={{ marginLeft: '-30px' }}
          >
            <XAxis
              dataKey="category"
              interval={0}
              tick={<CustomCategoriesAxis />}
            />
            <YAxis dataKey="total" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
          Total expense for{' '}
          <strong>
            {MONTHS[selectedMonth]} {selectedYear}
          </strong>
          : <MonthlyTotal total={sumBy(chartData, 'total')} />
          <br />
          <ExpenseItemTable expenseItems={currentMonthItems} />
          {/* {console.log(chartData)} */}
          {/* TODO: LineChart over months of spending by category */}
          {/* <LineChart width={600} height={300} data={chartData}>
            <Line type="monotone" dataKey="total" stroke="#8884d8" />
            <XAxis dataKey="category" />
            <YAxis dataKey="total" />
          </LineChart> */}
          <br />
          <br />
          <br />
        </div>

        <div>{loading && 'Loading...'}</div>
      </main>
      <Footer />
    </div>
  )
}
