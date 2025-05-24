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
  const [availableYears, setAvailableYears] = React.useState<number[]>([]) // New state for dynamic years

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

  // Effect to fetch available years using a Supabase RPC call
  React.useEffect(() => {
    ;(async function () {
      if (!user?.id) return // Ensure user ID is available

      try {
        const { data, error } = await supabase.rpc('get_unique_expense_years', {
          user_id_param: user.id,
        })

        if (error) {
          console.error('Error fetching unique years with RPC:', error)
          return
        }

        if (data && data.length > 0) {
          // 'data' will be an array of objects like [{ year_value: 2022 }, { year_value: 2023 }]
          const uniqueYears = data.map((row) => row.year_value)
          setAvailableYears(uniqueYears)

          // Set selectedYear to the latest available year if current selectedYear isn't present
          if (!uniqueYears.includes(selectedYear) && uniqueYears.length > 0) {
            setSelectedYear(uniqueYears[uniqueYears.length - 1])
          }
        } else {
          // If no data, default to current year
          setAvailableYears([NOW.getFullYear()])
          setSelectedYear(NOW.getFullYear())
        }
      } catch (error) {
        console.error('Error in fetching years useEffect:', error)
      }
    })()
  }, [user?.id, selectedYear]) // Depend on user.id and selectedYear for initial setup

  React.useEffect(() => {
    ;(async function () {
      if (!user) return // Ensure user is available before fetching

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
  }, [session, selectedMonth, selectedYear, user?.id]) // Added 'user' to dependency array

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
            {Object.entries(MONTHS).map(([monthNum, monthName]) => (
              <option key={monthNum} value={monthNum}>
                {monthName}
              </option>
            ))}
          </select>
          <select
            className={styles.chartSelectedYear}
            name="selectedYear"
            value={selectedYear}
            onChange={handleChangeSelectedYear}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
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
