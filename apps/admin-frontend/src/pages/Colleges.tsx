import { useEffect, useState } from 'react'
import { GraduationCap, Plus, Trash, Check, X, Edit } from 'lucide-react'
import api from '../lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { College } from '@admin-panel/types'

const Colleges = () => {
  const [colleges, setColleges] = useState<College[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCollege, setEditingCollege] = useState<College | null>(null)
  const [newCollege, setNewCollege] = useState({ name: '', domain: '' })

  const fetchColleges = async () => {
    const res = await api.get('/colleges')
    setColleges(res.data)
  }

  useEffect(() => {
    fetchColleges()
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (editingCollege) {
      await api.put(`/colleges/${editingCollege.id}`, newCollege)
    } else {
      await api.post('/colleges', newCollege)
    }
    setIsModalOpen(false)
    setEditingCollege(null)
    setNewCollege({ name: '', domain: '' })
    fetchColleges()
  }

  const handleEdit = (college: College) => {
    setEditingCollege(college)
    setNewCollege({ name: college.name, domain: college.domain })
    setIsModalOpen(true)
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.patch(`/colleges/${id}/toggle`, { is_active: !isActive })
    fetchColleges()
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCollege(null)
    setNewCollege({ name: '', domain: '' })
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Colleges Management</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Add College
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-xs">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Domain</th>
              <th className="p-4 font-semibold">Users</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Created At</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {colleges.map((college) => (
              <motion.tr 
                key={college.id} 
                className="hover:bg-white/5 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <td className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                    <GraduationCap size={18} />
                  </div>
                  {college.name}
                </td>
                <td className="p-4 text-slate-400">{college.domain}</td>
                <td className="p-4 text-slate-400">{college.user_count || 0}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${college.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {college.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="p-4 text-slate-400 h-10">{new Date(college.created_at).toLocaleDateString()}</td>
                <td className="p-4 flex gap-2">
                  <button 
                    onClick={() => handleEdit(college)}
                    className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => toggleActive(college.id, college.is_active)}
                    className={`p-2 rounded-lg transition-colors ${college.is_active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                  >
                    {college.is_active ? <X size={18} /> : <Check size={18} />}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl"
            >
              <h2 className="text-2xl font-bold">{editingCollege ? 'Edit College' : 'Add New College'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">College Name</label>
                  <input 
                    type="text" required
                    value={newCollege.name}
                    onChange={e => setNewCollege({...newCollege, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Stanford University"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Email Domain</label>
                  <input 
                    type="text" required
                    value={newCollege.domain}
                    onChange={e => setNewCollege({...newCollege, domain: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. stanford.edu"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" onClick={closeModal}
                    className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    {editingCollege ? 'Update College' : 'Create College'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Colleges
