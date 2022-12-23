import React from 'react'
import Head from 'next/head'
import {
  useUser,
  useSession,
  useSupabaseClient,
} from '@supabase/auth-helpers-react'

import { ExpenseItem } from '../types/general'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { DB_TABLE } from '../components/constants'

const ITEMS_DEFAULT_VALUE = [] as ExpenseItem[]

export default function Overview() {
  const user = useUser()
  const session = useSession()
  const supabase = useSupabaseClient()
  const [loading, setLoading] = React.useState(false)
  const [expenseItems, setExpenseItems] = React.useState(ITEMS_DEFAULT_VALUE)

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

  return (
    <div
      // TODO: make darkMode a hook and reuse it
      className="expense-tracker-app-container dark-mode"
    >
      <Head>
        <title>Expense Tracker: Overview</title>
      </Head>
      {/* <main className={styles.main}> */}
      <main className="">
        <Nav />
        hi
        <div>
          {loading && 'Loading...'}
          <pre>{JSON.stringify(expenseItems, null, 4)}</pre>
        </div>
      </main>
      <Footer />
    </div>
  )
}
