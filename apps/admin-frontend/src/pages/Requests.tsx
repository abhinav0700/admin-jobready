import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Search, Check, X, Calendar, Mail } from 'lucide-react'
import api from '../lib/api'
import { motion } from 'framer-motion'

interface PendingRequest {
  id: string
  email: string
  status: 'pending' | 'approved' | 'rejected'
  college_id: string | null
  requested_at: string
  colleges?: { id: string; name: string } | null
}

const RequestsPage = () => {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const response = await api.get('/users/requests')
      setRequests(response.data)
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/users/requests/${id}`, { status })
      // Reload requests after action
      loadRequests()
    } catch (error) {
      console.error(`Error updating request to ${status}:`, error)
    }
  }

  const filteredRequests = requests.filter(request => {
    const email = request.email.toLowerCase()
    const term = searchTerm.toLowerCase()
    return email.includes(term)
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardList className="text-primary" size={32} />
            Access Requests
          </h1>
          <p className="text-muted-foreground mt-2">Manage pending access requests from students</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{filteredRequests.filter(r => r.status === 'pending').length}</div>
          <div className="text-sm text-muted-foreground">Pending Requests</div>
        </div>
      </div>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 rounded-2xl flex items-center gap-4"
        >
          <Search className="text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent w-full focus:outline-none placeholder:text-slate-500"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl overflow-hidden"
        >
          {loading ? (
            <div className="p-10 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading requests...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">College</th>
                  <th className="p-4 font-semibold">Requested At</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRequests.length > 0 ? filteredRequests.map((request) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-muted-foreground" />
                        <span className="text-slate-300 font-medium">{request.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-400">
                        {request.colleges?.name ?? 'Unknown'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span className="text-slate-400 text-sm">
                          {new Date(request.requested_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {request.status === 'pending' && (
                        <span className="text-orange-400 text-xs bg-orange-400/10 px-2 py-1 rounded-full">Pending</span>
                      )}
                      {request.status === 'approved' && (
                        <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-full">Approved</span>
                      )}
                      {request.status === 'rejected' && (
                        <span className="text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded-full">Rejected</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {request.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleAction(request.id, 'approved')}
                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleAction(request.id, 'rejected')}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-500 italic">
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default RequestsPage
