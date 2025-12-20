import React, { createContext, useContext, useEffect, useState } from 'react'
import { useLocalStorage, useMediaQuery } from 'usehooks-ts'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDarkMode: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // We initialize with null to detect if it's the first time and no value is in LS
  const [theme, setTheme] = useLocalStorage<Theme | null>(
    'ExpenseTracker_Theme',
    null
  )
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // If no theme is stored (value is null), revert to system preference
    if (theme === null) {
      setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    }
  }, [theme, setTheme])

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync theme with document element
  useEffect(() => {
    if (mounted && theme) {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const value = {
    theme: (mounted && theme) ? theme : 'light',
    toggleTheme,
    isDarkMode: mounted ? theme === 'dark' : false,
  }

  // Prevent flash of incorrect theme
  // We must always wrap with Provider so children can use hooks
  return (
    <ThemeContext.Provider value={value}>
      {!mounted ? (
        <div style={{ visibility: 'hidden' }}>{children}</div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
