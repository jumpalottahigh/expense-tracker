import '../styles/globals.css'
import { ThemeProvider } from '../context/ThemeContext'
import { SupabaseProvider } from '../context/SupabaseContext'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <SupabaseProvider initialSession={pageProps.initialSession}>
      <ThemeProvider>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
          />
        </Head>
        <Component {...pageProps} />
      </ThemeProvider>
    </SupabaseProvider>
  )
}

export default MyApp
