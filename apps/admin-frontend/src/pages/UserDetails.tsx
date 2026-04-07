import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Users, ArrowLeft, Mail, User, Calendar, Shield, TrendingUp, Target, Clock, AlertTriangle, GraduationCap, BarChart3 } from 'lucide-react'
import api from '../lib/api'
import { motion } from 'framer-motion'
import StudentMetrics from '../components/StudentMetrics'

type UserDetails = {
  user: any
  stats: {
    totalActions: number
    lastActivity: string | null
    accountAge: number
  }
  recentActivity: any[]
}

const UserDetailsPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMetrics, setShowMetrics] = useState(false)

  useEffect(() => {
    if (id) {
      loadUserDetails(id)
    }
  }, [id])

  const loadUserDetails = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/users/${userId}/details`)
      setUserDetails(response.data)
    } catch (err: any) {
      console.error('Error loading user details:', err)
      setError(err.response?.data?.message || 'Failed to load user details')
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">Error: {error}</div>
          <button
            onClick={() => navigate('/users')}
            className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Users
          </button>
        </div>
      </div>
    )
  }

  if (!userDetails) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 mb-4">User not found</div>
          <button
            onClick={() => navigate('/users')}
            className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Users
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="text-primary" size={32} />
              User Details
            </h1>
            <p className="text-muted-foreground mt-2">
              {userDetails.user?.username || 'Unknown User'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">User ID</div>
          <div className="text-xs font-mono text-slate-400">{id}</div>
        </div>
      </div>

      {/* User Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="glass p-6 rounded-2xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User size={18} />
            Account Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold">Username</label>
              <p className="text-white">{userDetails.user?.username || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold">Email</label>
              <p className="text-white">{userDetails.user?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold">College</label>
              <p className="text-white flex items-center gap-2">
                <GraduationCap size={14} />
                {userDetails.user?.colleges?.name || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold">Role</label>
              <div className="mt-1">
                {getRoleBadge(userDetails.user?.role || 'student')}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold">Status</label>
              <div className="mt-1">
                {userDetails.user?.is_password_changed ? (
                  <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                    <Shield size={12} />
                    Active
                  </span>
                ) : (
                  <span className="text-orange-400 text-xs bg-orange-400/10 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                    <Shield size={12} />
                    Pending Reset
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold">Joined</label>
              <p className="text-white flex items-center gap-2">
                <Calendar size={14} className="text-muted-foreground" />
                {userDetails.user?.created_at ? new Date(userDetails.user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} />
            Account Statistics
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold">Total Actions</label>
              <p className="text-white text-lg font-bold">{userDetails.stats.totalActions}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold">Account Age</label>
              <p className="text-white">{userDetails.stats.accountAge} days</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold">Last Activity</label>
              <p className="text-white">
                {userDetails.stats.lastActivity
                  ? new Date(userDetails.stats.lastActivity).toLocaleDateString()
                  : 'No activity'
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMetrics(true)}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl border border-primary/20 transition-all font-semibold text-sm"
          >
            <BarChart3 size={16} />
            View Full Performance
          </button>
        </div>

        <div className="glass p-6 rounded-2xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target size={18} />
            College Details
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold">College Name</label>
              <p className="text-white">{userDetails.user?.colleges?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold">Domain</label>
              <p className="text-white">{userDetails.user?.colleges?.domain || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold">College Status</label>
              <p className="text-white">
                {userDetails.user?.colleges?.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      {userDetails.recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={18} />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {userDetails.recentActivity.map((activity: any, index: number) => (
              <div key={activity.id || index} className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-white">{activity.action}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(activity.created_at).toLocaleString()}
                  </div>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="text-xs text-slate-400 mt-1">
                      {JSON.stringify(activity.metadata, null, 2)}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs px-3 py-1 rounded-full font-medium bg-blue-500/20 text-blue-400">
                    Action
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {showMetrics && id && (
        <StudentMetrics
          userId={id}
          fullName={userDetails.user?.username || 'Student'}
          onClose={() => setShowMetrics(false)}
        />
      )}
    </div>
  )
}

export default UserDetailsPage