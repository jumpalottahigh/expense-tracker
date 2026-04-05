import '../styles/globals.css'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import { SupabaseProvider } from '../context/SupabaseContext'
import Head from 'next/head'

function ThemeMeta() {
  const { isDarkMode } = useTheme()
  return (
    <Head>
      <meta name="theme-color" content={isDarkMode ? '#121212' : '#f0f2f5'} />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </Head>
  )
}

function MyApp({ Component, pageProps }) {
  return (
    <SupabaseProvider initialSession={pageProps.initialSession}>
      <ThemeProvider>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
          />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        </Head>
        <ThemeMeta />
        <Component {...pageProps} />
      </ThemeProvider>
    </SupabaseProvider>
  )
}

export default MyApp
