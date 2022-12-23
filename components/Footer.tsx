import Link from 'next/link'

import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.dashboardButtons}>
        <Link className={styles.dashboardButton} href="/">
          Add Expense
        </Link>{' '}
        <Link className={styles.dashboardButton} href="/overview">
          View Expenses
        </Link>{' '}
      </div>
      <p>Copyright © 2022-{new Date().getFullYear()} Georgi Yanev</p>
    </footer>
  )
}
