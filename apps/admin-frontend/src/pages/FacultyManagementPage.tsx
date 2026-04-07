import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ShieldCheck, ArrowLeft, Plus, Search, Mail, 
  Trash2, Edit2, X, Check, Building2, Briefcase, AlertCircle 
} from 'lucide-react'
import api from '../lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { College } from '@admin-panel/types'

interface Department {
  id: string;
  name: string;
}

interface Faculty {
  id: string;
  full_name: string;
  email: string;
  department_id: string;
  college_id: string;
  departments?: {
    id: string;
    name: string;
  };
  created_at: string;
}

const FacultyManagement = () => {
  const { id: collegeId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [college, setCollege] = useState<College | null>(null)
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentFaculty, setCurrentFaculty] = useState<Partial<Faculty> | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (collegeId) {
      loadData()
    }
  }, [collegeId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [collegeRes, facultyRes, deptRes] = await Promise.all([
        api.get(`/colleges`), // Fetch all to find current one (standard pattern here)
        api.get(`/faculty/college/${collegeId}`),
        api.get(`/faculty/departments`)
      ])
      
      const currentCollege = collegeRes.data.find((c: College) => c.id === collegeId)
      setCollege(currentCollege)
      setFaculties(facultyRes.data)
      setDepartments(deptRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (faculty?: Faculty) => {
    if (faculty) {
      setIsEditing(true)
      setCurrentFaculty(faculty)
    } else {
      setIsEditing(false)
      setCurrentFaculty({ full_name: '', email: '', department_id: '' })
    }
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentFaculty) return

    try {
      setFormLoading(true)
      setFormError(null)
      if (isEditing) {
        await api.put(`/faculty/${currentFaculty.id}`, {
          name: currentFaculty.full_name,
          departmentId: currentFaculty.department_id
        })
      } else {
        await api.post(`/faculty`, {
          name: currentFaculty.full_name,
          email: currentFaculty.email,
          departmentId: currentFaculty.department_id,
          collegeId: collegeId
        })
      }
      setIsModalOpen(false)
      loadData()
    } catch (error: any) {
      console.error('Error saving faculty:', error)
      const message = error.response?.data?.message || error.message || 'Failed to save faculty member'
      setFormError(message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty member? This will also remove their authentication access.')) return
    
    try {
      await api.delete(`/faculty/${id}`)
      loadData()
    } catch (error) {
      console.error('Error deleting faculty:', error)
    }
  }

  const filteredFaculties = faculties.filter(f =>
    f.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.departments?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center p-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/faculty')}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
              <ShieldCheck className="text-orange-400" size={32} />
              {college?.name} Faculty
            </h1>
            <p className="text-slate-400 mt-2">Manage teachers and departmental assignments</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-orange-950/20"
        >
          <Plus size={20} /> Add Teacher
        </button>
      </div>

      <div className="glass p-4 rounded-2xl flex items-center gap-4 max-w-md">
        <Search className="text-slate-500" size={20} />
        <input
          type="text"
          placeholder="Search by name, email, or department..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-transparent w-full focus:outline-none placeholder:text-slate-500 text-white"
        />
      </div>

      {/* Faculty List */}
      <div className="glass rounded-2xl overflow-hidden border border-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5 text-slate-400 uppercase text-xs">
            <tr>
              <th className="p-4 font-semibold tracking-wider">Teacher Info</th>
              <th className="p-4 font-semibold tracking-wider">Department</th>
              <th className="p-4 font-semibold tracking-wider">Joined</th>
              <th className="p-4 font-semibold tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredFaculties.length > 0 ? filteredFaculties.map((faculty) => (
              <tr key={faculty.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-400/20 rounded-full flex items-center justify-center">
                      <span className="text-orange-400 font-bold uppercase">{faculty.full_name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-bold text-white">{faculty.full_name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail size={12} /> {faculty.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                    <Briefcase size={14} className="text-orange-400" />
                    {faculty.departments?.name || 'Unassigned'}
                  </div>
                </td>
                <td className="p-4 text-slate-400 text-sm">
                  {new Date(faculty.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(faculty)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(faculty.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-20 text-center text-slate-500 italic">
                  {searchTerm ? 'No teachers found matching your search.' : 'No teachers registered for this college yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    {isEditing ? <Edit2 className="text-orange-400" /> : <Plus className="text-orange-400" />}
                    {isEditing ? 'Edit Faculty' : 'Register New Faculty'}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Teacher Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Dr. Jane Smith"
                      value={currentFaculty?.full_name || ''}
                      onChange={e => setCurrentFaculty({ ...currentFaculty, full_name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-orange-400/50 outline-none transition-colors text-white"
                    />
                  </div>

                  {!isEditing && (
                    <div className="space-y-2">
                      <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email Address</label>
                      <input
                        required
                        type="email"
                        placeholder="jane.smith@college.edu"
                        value={currentFaculty?.email || ''}
                        onChange={e => setCurrentFaculty({ ...currentFaculty, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-orange-400/50 outline-none transition-colors text-white"
                      />
                      <p className="text-[10px] text-slate-500 italic uppercase">Note: An invitation for password setup will be sent to this email.</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Department</label>
                    <select
                      required
                      value={currentFaculty?.department_id || ''}
                      onChange={e => setCurrentFaculty({ ...currentFaculty, department_id: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl focus:border-orange-400/50 outline-none transition-colors text-white"
                    >
                      <option value="">Select Department...</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  {formError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 text-red-400 text-sm"
                    >
                      <AlertCircle size={18} className="shrink-0" />
                      {formError}
                    </motion.div>
                  )}

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-5 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 px-5 py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {formLoading && <Check className="animate-pulse" size={18} />}
                      {isEditing ? 'Save Changes' : 'Register Faculty'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FacultyManagement
