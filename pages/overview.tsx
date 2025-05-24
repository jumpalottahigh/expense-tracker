import React from 'react'
import Head from 'next/head'
import {
  useUser,
  useSession,
  useSupabaseClient,
} from '@supabase/auth-helpers-react'
import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts'
import { isEmpty, sumBy, uniqBy } from 'lodash'
import { format } from 'date-fns'
import { useLocalStorage } from 'usehooks-ts'

import { chartDataTotalPerCategory, sortItemsByCategory } from '../utils'
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

const LS_SALARY = 'ExpenseTracker_Salary'
const DEFAULT_SALARY = 0
const ITEMS_DEFAULT_VALUE = [] as ExpenseItem[]

const MonthlyTotal = ({ total }) => (
  <div className={`${styles.monthlyTotal}`}>{total.toFixed(2)} €</div>
)

const MonthlyBalance = ({ salary, total }) => {
  return (
    <div>
      Balance:{' '}
      <span
        className={`${styles.monthlyTotal} ${
          total < salary / 1.4
            ? styles.good
            : total < salary
            ? styles.average
            : styles.bad
        }`}
      >
        {(salary - total).toFixed(2)} €
      </span>
    </div>
  )
}

const Salary = () => {
  const [salary, setSalary] = useLocalStorage(LS_SALARY, DEFAULT_SALARY)
  const [isSalaryEditable, setIsSalaryEditable] = React.useState(false)

  const handleSalaryUpdate = (event) => {
    setSalary(Number(event.target.value))
  }

  return (
    <div onClick={() => setIsSalaryEditable(!isSalaryEditable)}>
      Salary:{' '}
      {isSalaryEditable ? (
        <input
          type="number"
          autoFocus
          value={salary}
          onChange={handleSalaryUpdate}
          onKeyDown={(event) => {
            if (event.code === 'Enter' || event.code === 'Escape') {
              setIsSalaryEditable(false)
            }
          }}
          onBlur={() => setIsSalaryEditable(false)}
        />
      ) : (
        ` ${salary} €`
      )}
    </div>
  )
}

const ExpenseItemTable = ({ expenseItems }) => {
  const [currentFilter, setCurrentFilter] = React.useState(null)
  const [filteredExpenseItems, setFilteredExpenseItems] = React.useState([])
  const expenseTableUniqueCategories = uniqBy(expenseItems, 'category').map(
    (item) => item.category
  )

  React.useEffect(() => {
    setFilteredExpenseItems(expenseItems)
  }, [expenseItems])

  return (
    <div className={styles.expenseItemTable}>
      {/* Filters */}
      {!isEmpty(expenseTableUniqueCategories) && (
        <div className={`${styles.expenseItemFilters}`}>
          {expenseTableUniqueCategories.map((filterCategory) => {
            return (
              <button
                key={filterCategory}
                title={filterCategory}
                className={
                  filterCategory === currentFilter ? styles.selectedFilter : ''
                }
                onClick={() => {
                  setCurrentFilter(filterCategory)
                  setFilteredExpenseItems(
                    expenseItems.filter(
                      (item) => item.category === filterCategory
                    )
                  )
                }}
              >
                {/* {CATEGORY_LABELS[filterCategory]} */}
                {CATEGORY_EMOJI[filterCategory]}
              </button>
            )
          })}
          {currentFilter && (
            <button
              onClick={() => {
                setCurrentFilter(null)
                setFilteredExpenseItems(expenseItems)
              }}
            >
              ❌
            </button>
          )}
        </div>
      )}
      <div className={`${styles.expenseItemTableRow} ${styles.tableHeader}`}>
        <span>Date</span>
        <span>Name</span>
        <span>Category</span>
        <span>Price</span>
      </div>
      {filteredExpenseItems.map((item) => (
        <div
          key={btoa(`${Math.random()}`).substring(0, 12)}
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

const dateWithoutTimezone = (date: Date) => {
  const tzoffset = date.getTimezoneOffset() * 60000 //offset in milliseconds
  const withoutTimezone = new Date(date.valueOf() - tzoffset)
    .toISOString()
    .slice(0, -1)
  return withoutTimezone
}

export default function Overview() {
  const user = useUser()
  const session = useSession()
  const supabase = useSupabaseClient()
  const [loading, setLoading] = React.useState(false)
  const [expenseItems, setExpenseItems] = React.useState(ITEMS_DEFAULT_VALUE) // All items from the table
  const [currentMonthItemsByCategory, setCurrentMonthItemsByCategory] =
    React.useState({}) // An object with categories of the current month items

  const NOW = new Date()
  const DEFAULT_MONTH = NOW.getMonth()
  const DEFAULT_YEAR = NOW.getFullYear()
  const [selectedMonth, setSelectedMonth] = React.useState(DEFAULT_MONTH)
  const [selectedYear, setSelectedYear] = React.useState(DEFAULT_YEAR)
  const [chartData, setChartData] = React.useState([])

  const [salary] = useLocalStorage(LS_SALARY, DEFAULT_SALARY)

  const handleChangeSelectedMonth = (event) => {
    setSelectedMonth(parseInt(event.target.value))
  }

  const handleChangeSelectedYear = (event) => {
    setSelectedYear(parseInt(event.target.value))
  }

  React.useEffect(() => {
    ;(async function () {
      try {
        setLoading(true)

        // Construct start and end dates for the current month
        const startDate = new Date(selectedYear, selectedMonth, 1) // First day of current month
        const endDate = new Date(selectedYear, selectedMonth + 1) // First day of next month

        // Format start and end dates in 'YYYY-MM-DD' format
        const startDateString = dateWithoutTimezone(startDate).split('T')[0]
        const endDateString = dateWithoutTimezone(endDate).split('T')[0]

        let { data, error, status } = await supabase
          .from(DB_TABLE)
          .select(`name, category, date, price`)
          .eq('user_id', user.id)
          .gte('date', startDateString) // Greater than or equal to the start date of the current month
          .lte('date', endDateString) // Less than or equal to the end date of the current month
          .order('date')

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
  }, [session, selectedMonth, selectedYear])

  React.useEffect(() => {
    if (!expenseItems) return

    const sortedItemsByCategoryPerDate = sortItemsByCategory(expenseItems)
    setCurrentMonthItemsByCategory(sortedItemsByCategoryPerDate)
    setChartData(chartDataTotalPerCategory(sortedItemsByCategoryPerDate))
  }, [expenseItems, selectedMonth, selectedYear])

  const totalExpenseForThisMonth = sumBy(chartData, 'total')

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
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
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
          : <MonthlyTotal total={totalExpenseForThisMonth} />
          <Salary />
          <MonthlyBalance total={totalExpenseForThisMonth} salary={salary} />
          <br />
          <br />
          <ExpenseItemTable expenseItems={expenseItems} />
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
