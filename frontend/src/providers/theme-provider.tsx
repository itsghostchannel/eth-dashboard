import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'default' | 'blue' | 'gray'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'default',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'default',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('dark', 'blue-theme', 'gray-theme')

    if (theme === 'default') {
      // Default theme (neutral/light)
      // No additional classes needed
    } else if (theme === 'blue') {
      root.classList.add('blue-theme')
    } else if (theme === 'gray') {
      root.classList.add('gray-theme')
    }

    // Check for dark mode preference
    const darkModePreference = localStorage.getItem(`${storageKey}-dark`) === 'true'
    if (darkModePreference) {
      root.classList.add('dark')
    }

    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}