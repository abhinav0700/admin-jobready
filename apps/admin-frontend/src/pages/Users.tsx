import { useEffect, useState } from 'react'
import { Users, Search, Filter } from 'lucide-react'
import api from '../lib/api'
import { motion } from 'framer-motion'
import { User, College } from '@admin-panel/types'

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [selectedCollege, setSelectedCollege] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    api.get('/colleges').then(res => setColleges(res.data))
  }, [])

  useEffect(() => {
    if (selectedCollege) {
      api.get(`/users/college/${selectedCollege}`).then(res => setUsers(res.data))
    } else {
        setUsers([])
    }
  }, [selectedCollege])

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users Directory</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 space-y-4">
          <div className="glass p-6 rounded-2xl space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Filter size={18} /> Filters
            </h2>
            <div className="space-y-2">
              <label className="text-xs text-slate-500 uppercase font-bold">Select College</label>
              <select 
                value={selectedCollege}
                onChange={e => setSelectedCollege(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 p-2 rounded-lg focus:outline-none"
              >
                <option value="">Select a college...</option>
                {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          <div className="glass p-4 rounded-2xl flex items-center gap-4">
            <Search className="text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search by email or username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent w-full focus:outline-none"
            />
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="p-4 font-semibold">Username</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Joined At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{user.username}</td>
                    <td className="p-4 text-slate-400">{user.email}</td>
                    <td className="p-4">
                      {user.is_password_changed ? (
                        <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-full">Active</span>
                      ) : (
                        <span className="text-orange-400 text-xs bg-orange-400/10 px-2 py-1 rounded-full">Pending Reset</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-slate-500 italic">
                      {selectedCollege ? 'No users found matching your search.' : 'Please select a college to view users.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsersPage
