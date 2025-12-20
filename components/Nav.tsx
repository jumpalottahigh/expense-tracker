import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useUser } from '../context/SupabaseContext'

import styles from './Nav.module.css'
import { useTheme } from '../context/ThemeContext'

export default function Nav() {
  const user = useUser()
  const router = useRouter()
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
      {user && (
        <div className={styles.dashboardButtons}>
          <Link href="/" legacyBehavior>
            <a
              className={`${styles.dashboardButton} ${
                router.pathname === '/' ? styles.active : ''
              }`}
            >
              Add Expense
            </a>
          </Link>{' '}
          <Link href="/overview" legacyBehavior>
            <a
              className={`${styles.dashboardButton} ${
                router.pathname === '/overview' ? styles.active : ''
              }`}
            >
              View Expenses
            </a>
          </Link>{' '}
        </div>
      )}
    </div>
  )
}
