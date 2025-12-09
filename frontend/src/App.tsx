import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/providers/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { Dashboard } from '@/components/Dashboard'

function App() {
  return (
    <ThemeProvider defaultTheme="default" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Ethereum Block Explorer</h1>
            <ThemeToggle />
          </div>
        </header>
        <main>
          <div className="container mx-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App