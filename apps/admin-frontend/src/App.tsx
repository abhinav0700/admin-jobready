import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, Users, Upload } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Colleges from './pages/Colleges'
import BulkUpload from './pages/BulkUpload'

const UsersPage = () => <div className="p-8"><h1>Users List (Coming Soon)</h1></div>

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-950 text-slate-50">
        {/* Sidebar */}
        <div className="w-64 glass border-r border-white/10 p-6 flex flex-col gap-8">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent px-2">
            EduAdmin
          </div>
          <nav className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white group">
              <LayoutDashboard size={20} className="group-hover:text-blue-400" /> Dashboard
            </Link>
            <Link to="/colleges" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white group">
              <GraduationCap size={20} className="group-hover:text-purple-400" /> Colleges
            </Link>
            <Link to="/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white group">
              <Users size={20} className="group-hover:text-green-400" /> Users
            </Link>
            <Link to="/bulk-upload" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white group">
              <Upload size={20} className="group-hover:text-orange-400" /> Bulk Upload
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/bulk-upload" element={<BulkUpload />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
