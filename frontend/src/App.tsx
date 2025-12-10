import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/providers/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { Dashboard } from '@/components/Dashboard'
import ErrorBoundary from '@/components/ErrorBoundary'

import { Box } from 'lucide-react'

function App() {
  return (
    <ThemeProvider defaultTheme="default" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Box className="h-6 w-6" />
              Ethereum Block Explorer
            </h1>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1">
          <div className="container mx-auto p-6">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </main>
        <footer className="border-t bg-card py-6">
          <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
            2025 Made in Berlin
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}

export default App