import { useEffect, useState } from 'react'
import { Users, Search, CheckCircle2 } from 'lucide-react'
import api from '../lib/api'
import { motion } from 'framer-motion'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Assignment {
  faculty_id: string
  student_id: string
}

const AssignStudents = () => {
  const [faculties, setFaculties] = useState<User[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('')
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())
  
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // When faculty changes, update selected students based on existing assignments
    if (selectedFacultyId) {
      const assigned = assignments
        .filter(a => a.faculty_id === selectedFacultyId)
        .map(a => a.student_id)
      setSelectedStudentIds(new Set(assigned))
    } else {
      setSelectedStudentIds(new Set())
    }
  }, [selectedFacultyId, assignments])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await api.post('/faculty/assignments/get-role-users')
      if (res.data.success) {
        setFaculties(res.data.faculties || [])
        setStudents(res.data.students || [])
        setAssignments(res.data.assignments || [])
      }
    } catch (error) {
      console.error('Error loading role users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStudent = (studentId: string) => {
    const newSet = new Set(selectedStudentIds)
    if (newSet.has(studentId)) {
      newSet.delete(studentId)
    } else {
      newSet.add(studentId)
    }
    setSelectedStudentIds(newSet)
  }

  const handleSave = async () => {
    if (!selectedFacultyId) return
    
    try {
      setSaving(true)
      setSuccessMsg('')
      const res = await api.post('/faculty/assignments/assign-students', { 
        facultyId: selectedFacultyId,
        studentIds: Array.from(selectedStudentIds)
      })
      if (res.data.success) {
        setSuccessMsg(res.data.message)
        loadData() // Refresh assignments
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (error) {
      console.error('Error saving assignments:', error)
    } finally {
      setSaving(false)
    }
  }

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
          <Users className="text-orange-400" size={32} />
          Student Assignments
        </h1>
        <p className="text-slate-400 mt-2">Assign students to faculty or trainers.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Faculty Selector */}
          <div className="glass p-6 rounded-2xl flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white mb-2">1. Select Faculty ({faculties.length} found)</h2>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl focus:border-orange-400/50 outline-none transition-colors text-white"
            >
              <option value="" className="bg-slate-900 text-white">-- Choose Faculty / Trainer --</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                  {f.name || 'Unknown Name'} ({f.email || 'No Email'}) - {f.role}
                </option>
              ))}
            </select>

            {selectedFacultyId && (
              <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-sm text-slate-400">Currently Selected:</p>
                <p className="font-bold text-white mt-1">
                  {faculties.find(f => f.id === selectedFacultyId)?.name}
                </p>
                <p className="text-xs text-orange-400 mt-1 uppercase">
                  {faculties.find(f => f.id === selectedFacultyId)?.role}
                </p>
              </div>
            )}
          </div>

          {/* Student Selector */}
          <div className="lg:col-span-2 glass p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-white">2. Select Students ({students.length} found)</h2>
              <button
                disabled={!selectedFacultyId || saving}
                onClick={handleSave}
                className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-5 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Assignments'}
              </button>
            </div>

            {successMsg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 flex items-center gap-2">
                <CheckCircle2 size={18} /> {successMsg}
              </motion.div>
            )}

            {!selectedFacultyId ? (
              <div className="p-10 text-center text-slate-500 italic bg-black/20 rounded-xl">
                Please select a faculty member first to assign students.
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 bg-slate-900 border border-white/10 p-2 rounded-xl">
                  <Search className="text-slate-500 ml-2" size={20} />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-transparent w-full focus:outline-none placeholder:text-slate-500 text-white p-1"
                  />
                </div>
                
                <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {filteredStudents.length === 0 && (
                    <p className="text-slate-500 italic p-4 text-center">No students found.</p>
                  )}
                  {filteredStudents.map(student => {
                    const isSelected = selectedStudentIds.has(student.id)
                    return (
                      <div 
                        key={student.id} 
                        onClick={() => toggleStudent(student.id)}
                        className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                          isSelected 
                            ? 'bg-orange-400/10 border-orange-400 text-white' 
                            : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div>
                          <p className="font-bold">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                        <div className={`w-6 h-6 rounded border flex items-center justify-center ${
                          isSelected ? 'bg-orange-400 border-orange-400 text-white' : 'border-slate-500'
                        }`}>
                          {isSelected && <CheckCircle2 size={16} />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
          
        </div>
      )}
    </div>
  )
}

export default AssignStudents
