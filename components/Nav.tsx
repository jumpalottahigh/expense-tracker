import React from 'react'
import Link from 'next/link'
import { useUser } from '@supabase/auth-helpers-react'

import styles from './Nav.module.css'
import { useTheme } from '../context/ThemeContext'

export default function Nav() {
  const user = useUser()
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <div>
      <div className={styles.topNav}>
        <div>{user?.email}</div>
        <button
          className={styles.darkModeButton}
          onClick={toggleTheme}
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? '☀️' : '🌑'}
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
