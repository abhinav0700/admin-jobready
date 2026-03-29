import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { GraduationCap, Users, UserCheck } from 'lucide-react'
import api from '../lib/api'
import { motion } from 'framer-motion'

const Dashboard = () => {
  const [stats, setStats] = useState({ totalColleges: 0, totalUsers: 0, activeUsers: 0 })

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data))
  }, [])

  const data = [
    { name: 'Colleges', value: stats.totalColleges },
    { name: 'Total Users', value: stats.totalUsers },
    { name: 'Active Users', value: stats.activeUsers },
  ]

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-slate-400">Welcome back, Super Admin</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Colleges" value={stats.totalColleges} icon={<GraduationCap className="text-blue-400" />} />
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="text-purple-400" />} />
        <StatCard title="Active Users" value={stats.activeUsers} icon={<UserCheck className="text-green-400" />} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 rounded-2xl h-[400px]"
      >
        <h2 className="text-xl font-semibold mb-6">Platform Statistics</h2>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={60} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

const StatCard = ({ title, value, icon }: any) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="glass p-6 rounded-2xl flex flex-col gap-4"
  >
    <div className="flex justify-between items-start">
      <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
    </div>
    <div>
      <div className="text-sm text-slate-400">{title}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  </motion.div>
)

export default Dashboard
