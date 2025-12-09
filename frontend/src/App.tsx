import { Routes, Route } from 'react-router-dom'
import { BlockDashboard } from './pages/BlockDashboard'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<BlockDashboard />} />
      </Routes>
    </div>
  )
}

export default App