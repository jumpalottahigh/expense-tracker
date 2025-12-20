import '../styles/globals.css'
import { ThemeProvider } from '../context/ThemeContext'
import { SupabaseProvider } from '../context/SupabaseContext'

function MyApp({ Component, pageProps }) {
  return (
    <SupabaseProvider initialSession={pageProps.initialSession}>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </SupabaseProvider>
  )
}

export default MyApp
