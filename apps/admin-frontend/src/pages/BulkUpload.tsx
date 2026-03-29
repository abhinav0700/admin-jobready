import { useState, useCallback, useEffect } from 'react'
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import api from '../lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { College } from '@admin-panel/types'

const BulkUpload = () => {
  const [colleges, setColleges] = useState<College[]>([])
  const [selectedCollege, setSelectedCollege] = useState('')
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    api.get('/colleges').then(res => setColleges(res.data))
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        setFileContent(event.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedCollege || !fileContent) return
    setIsUploading(true)
    try {
      const res = await api.post('/users/bulk-upload', {
        collegeId: selectedCollege,
        csvContent: fileContent
      })
      setResult(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Bulk User Onboarding</h1>
        <p className="text-slate-400">Upload a CSV file to create student accounts automatically.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Loader2 className={isUploading ? 'animate-spin' : 'hidden'} size={18} />
              1. Select College
            </h2>
            <select 
              value={selectedCollege}
              onChange={e => setSelectedCollege(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a college...</option>
              {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="glass p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-semibold">2. Upload CSV</h2>
            <label className="border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors group">
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <div className="text-center">
                <div className="font-semibold">{fileName || 'Click to select CSV'}</div>
                <div className="text-sm text-slate-500 mt-1 uppercase tracking-wider">Supports .csv files only</div>
              </div>
            </label>
          </div>

          <button 
            disabled={!selectedCollege || !fileContent || isUploading}
            onClick={handleUpload}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            {isUploading ? 'Processing...' : 'Start Onboarding'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl h-full min-h-[400px]">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity size={18} className="text-slate-400" />
              Upload Summary
            </h2>
            
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                      <div className="text-xs text-green-400 uppercase font-bold tracking-wider mb-1">Success</div>
                      <div className="text-2xl font-bold">{result.success}</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                      <div className="text-xs text-red-400 uppercase font-bold tracking-wider mb-1">Failed</div>
                      <div className="text-2xl font-bold">{result.failed}</div>
                    </div>
                  </div>

                  {result.errors.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-slate-400">Error Details</div>
                      <div className="max-h-[200px] overflow-auto space-y-2 pr-2 custom-scrollbar">
                        {result.errors.map((err: any, i: number) => (
                          <div key={i} className="bg-white/5 p-3 rounded-lg text-xs space-y-1">
                            <div className="text-red-400 font-semibold">{err.email || 'Unknown Row'}</div>
                            <div className="text-slate-500">{err.error}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4 opacity-50">
                  <FileText size={48} strokeWidth={1} />
                  <p>Results will appear here after upload</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkUpload
