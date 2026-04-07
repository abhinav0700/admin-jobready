import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Search, ArrowRight, Building2 } from 'lucide-react'
import api from '../lib/api'
import { motion } from 'framer-motion'
import { College } from '@admin-panel/types'

const FacultyColleges = () => {
  const navigate = useNavigate()
  const [colleges, setColleges] = useState<College[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadColleges()
  }, [])

  const loadColleges = async () => {
    try {
      setLoading(true)
      const response = await api.get('/colleges')
      setColleges(response.data)
    } catch (error) {
      console.error('Error loading colleges:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.domain.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <Building2 className="text-orange-400" size={32} />
            Faculty Management
          </h1>
          <p className="text-slate-400 mt-2">Select a college to manage its faculty members</p>
        </div>
      </div>

      <div className="glass p-4 rounded-2xl flex items-center gap-4 max-w-md">
        <Search className="text-slate-500" size={20} />
        <input
          type="text"
          placeholder="Search colleges..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-transparent w-full focus:outline-none placeholder:text-slate-500 text-white"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map((college, index) => (
            <motion.div
              key={college.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/faculty/college/${college.id}`)}
              className="glass p-6 rounded-2xl hover:border-orange-400/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-orange-400/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="text-orange-400" size={24} />
                </div>
                <ArrowRight className="text-slate-600 group-hover:text-orange-400 transition-colors" size={20} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{college.name}</h3>
              <p className="text-slate-400 text-sm">{college.domain}</p>
              
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Status</span>
                <span className={`text-xs px-2 py-1 rounded-full ${college.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {college.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </motion.div>
          ))}
          {filteredColleges.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500 italic">
              No colleges found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FacultyColleges
