import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, Filter, Mail, User, Calendar, Shield } from 'lucide-react'
import api from '../lib/api'
import { motion } from 'framer-motion'
import { User as UserType, College } from '@admin-panel/types'

type UserWithCollege = UserType & { college?: string | null; colleges?: College | null; full_name?: string | null }

const UsersPage = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserWithCollege[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [selectedCollege, setSelectedCollege] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadColleges()
  }, [])

  useEffect(() => {
    if (selectedCollege) {
      loadUsers(selectedCollege)
    } else {
      setUsers([])
    }
  }, [selectedCollege])

  const loadColleges = async () => {
    try {
      const response = await api.get('/colleges')
      setColleges(response.data)
    } catch (error) {
      console.error('Error loading colleges:', error)
    }
  }

  const loadUsers = async (collegeId: string) => {
    setLoading(true)
    try {
      const response = await api.get(`/users/college/${collegeId}`)
      setUsers(response.data)
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const email = (user.email || '').toString().toLowerCase();
    const username = (user.username || user.full_name || '').toString().toLowerCase();
    const term = searchTerm.toLowerCase();
    return email.includes(term) || username.includes(term);
  })

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-red-500/20 text-red-400', label: 'Admin' },
      college_admin: { color: 'bg-blue-500/20 text-blue-400', label: 'College Admin' },
      student: { color: 'bg-green-500/20 text-green-400', label: 'Student' }
    }
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.student
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-primary" size={32} />
            Users Directory
          </h1>
          <p className="text-muted-foreground mt-2">Manage and view users by college</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{filteredUsers.length}</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl space-y-4"
          >
            <h2 className="font-semibold flex items-center gap-2">
              <Filter size={18} /> Filters
            </h2>
            <div className="space-y-2">
              <label className="text-xs text-slate-500 uppercase font-bold">Select College</label>
              <select
                value={selectedCollege}
                onChange={e => setSelectedCollege(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-primary/50 transition-colors"
              >
                <option value="">Select a college...</option>
                {colleges.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {selectedCollege && (
              <div className="pt-4 border-t border-white/10">
                <div className="text-sm text-muted-foreground">
                  College: <span className="text-white font-medium">
                    {colleges.find(c => c.id === selectedCollege)?.name}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Domain: <span className="text-white font-medium">
                    {colleges.find(c => c.id === selectedCollege)?.domain}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="md:col-span-3 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-4 rounded-2xl flex items-center gap-4"
          >
            <Search className="text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search by email or username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent w-full focus:outline-none placeholder:text-slate-500"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl overflow-hidden"
          >
            {loading ? (
              <div className="p-10 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">College</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => navigate(`/users/${user.id}`)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <User size={16} className="text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-muted-foreground" />
                          <span className="text-slate-400">{user.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-300 text-sm">
                          {user.colleges?.name ?? user.college ?? 'Unknown'}
                        </span>
                      </td>
                      <td className="p-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="p-4">
                        {user.is_password_changed ? (
                          <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-full flex items-center gap-1">
                            <Shield size={12} />
                            Active
                          </span>
                        ) : (
                          <span className="text-orange-400 text-xs bg-orange-400/10 px-2 py-1 rounded-full flex items-center gap-1">
                            <Shield size={12} />
                            Pending Reset
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-muted-foreground" />
                          <span className="text-slate-400 text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-slate-500 italic">
                        {selectedCollege ? (
                          searchTerm ? 'No users found matching your search.' : 'No users found for this college.'
                        ) : 'Please select a college to view users.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default UsersPage
