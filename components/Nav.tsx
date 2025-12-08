import React from 'react'
import Link from 'next/link'
import { useUser } from '@supabase/auth-helpers-react'

import styles from './Nav.module.css'

const DARK_MODE_DEFAULT_VALUE = true
const LS_DARK_MODE = 'ExpenseTracker_DarkMode'

export default function Nav() {
  const user = useUser()
  const [darkMode, setDarkMode] = React.useState(DARK_MODE_DEFAULT_VALUE)

  const handleDarkModeButtonToggle = () => {
    setDarkMode(!darkMode)
    localStorage.setItem(LS_DARK_MODE, JSON.stringify(!darkMode))
  }

  React.useEffect(() => {
    // Check and set app dark mode
    const darkModeFromLS = localStorage.getItem(LS_DARK_MODE)
    if (darkModeFromLS) {
      setDarkMode(JSON.parse(darkModeFromLS))
    } else {
      localStorage.setItem(LS_DARK_MODE, JSON.stringify(darkMode))
    }
  }, [])

  return (
    <div>
      <div className={styles.topNav}>
        <div>{user?.email}</div>
        <button
          className={styles.darkModeButton}
          onClick={handleDarkModeButtonToggle}
        >
          {darkMode ? '☀️' : '🌑'}
        </button>
      </div>
      <div className={styles.dashboardButtons}>
        <Link href="/" legacyBehavior>
          <a className={styles.dashboardButton}>Add Expense</a>
        </Link>{' '}
        <Link href="/overview" legacyBehavior>
          <a className={styles.dashboardButton}>View Expenses</a>
        </Link>{' '}
      </div>
    </div>
  )
}
