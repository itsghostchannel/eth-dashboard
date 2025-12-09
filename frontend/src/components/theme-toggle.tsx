import React from 'react'
import { Moon, Sun, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/providers/theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    const checkDarkMode = () => {
      const root = document.documentElement
      setIsDark(root.classList.contains('dark'))
    }

    checkDarkMode()

    // Listen for changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  const toggleDarkMode = () => {
    const root = document.documentElement
    const newDarkMode = !isDark

    if (newDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem('vite-ui-theme-dark', String(newDarkMode))
    setIsDark(newDarkMode)
  }

  const cycleTheme = () => {
    const themes = ['default', 'blue', 'gray'] as const
    const currentIndex = themes.indexOf(theme as any)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'blue':
        return <div className="w-4 h-4 bg-blue-500 rounded-full" />
      case 'gray':
        return <div className="w-4 h-4 bg-gray-500 rounded-full" />
      default:
        return <Palette className="h-4 w-4" />
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={cycleTheme}
        title={`Current theme: ${theme} - Click to change`}
      >
        {getThemeIcon()}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleDarkMode}
        title={`Dark mode: ${isDark ? 'on' : 'off'}`}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  )
}