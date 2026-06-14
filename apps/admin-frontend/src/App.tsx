import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, Users as UsersIcon, Upload, ShieldCheck } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Colleges from './pages/Colleges'
import Users from './pages/Users'
import UserDetails from './pages/UserDetails'
import FacultyColleges from './pages/FacultyColleges'
import FacultyManagement from './pages/FacultyManagementPage'
import Requests from './pages/Requests'


function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border p-6 flex flex-col gap-8 shadow-soft">
          <Link to="/" className="flex items-center gap-2 mb-2 w-full hover:opacity-80 transition-opacity">
            <img 
                src="/JobReady.png" 
                alt="JobReady Logo" 
                className="h-8 w-auto shrink-0 object-contain" 
            />
          </Link>
          <nav className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-primary/10 hover:text-primary text-muted-foreground group">
              <LayoutDashboard size={20} className="group-hover:text-primary transition-colors" /> Dashboard
            </Link>
            <Link to="/colleges" className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-primary/10 hover:text-primary text-muted-foreground group">
              <GraduationCap size={20} className="group-hover:text-primary transition-colors" /> Colleges
            </Link>
            <Link to="/users" className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-primary/10 hover:text-primary text-muted-foreground group">
              <UsersIcon size={20} className="group-hover:text-primary transition-colors" /> Users
            </Link>
            <Link to="/faculty" className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-primary/10 hover:text-primary text-muted-foreground group">
              <ShieldCheck size={20} className="group-hover:text-primary transition-colors" /> Faculty
            </Link>
            <Link to="/requests" className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-primary/10 hover:text-primary text-muted-foreground group">
              <Upload size={20} className="group-hover:text-primary transition-colors" /> Requests
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background/50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetails />} />
            <Route path="/faculty" element={<FacultyColleges />} />
            <Route path="/faculty/college/:id" element={<FacultyManagement />} />
            <Route path="/requests" element={<Requests />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
