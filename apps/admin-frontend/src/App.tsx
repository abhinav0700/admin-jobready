import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, Users as UsersIcon, Upload } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Colleges from './pages/Colleges'
import Users from './pages/Users'
import UserDetails from './pages/UserDetails'

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-950 text-slate-50">
        {/* Sidebar */}
        <div className="w-64 glass border-r border-white/10 p-6 flex flex-col gap-8">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent px-2">
            JobReady
          </div>
          <nav className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white group">
              <LayoutDashboard size={20} className="group-hover:text-blue-400" /> Dashboard
            </Link>
            <Link to="/colleges" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white group">
              <GraduationCap size={20} className="group-hover:text-purple-400" /> Colleges
            </Link>
            <Link to="/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white group">
              <UsersIcon size={20} className="group-hover:text-green-400" /> Users
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
