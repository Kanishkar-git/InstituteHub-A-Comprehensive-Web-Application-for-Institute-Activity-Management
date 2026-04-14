import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import UserProfile from '../components/UserProfile'
import { BookOpen, Users, ArrowLeft, Upload, UserPlus, FileSpreadsheet, Loader2, Trash2 } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function ManageStudents() {
  const { classId } = useParams()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [removingId, setRemovingId] = useState(null)

  // Manual Form
  const [showManualForm, setShowManualForm] = useState(false)
  const [name, setName] = useState('')
  const [registerNo, setRegisterNo] = useState('')
  const [email, setEmail] = useState('')
  const [submittingManual, setSubmittingManual] = useState(false)

  // Excel Upload
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [classId])

  const fetchStudents = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`http://localhost:8000/api/students/class/${classId}?token=${session.access_token}`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      } else {
        const err = await response.json()
        setErrorMsg(err.detail || 'Failed to fetch students')
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('Error loading students')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student mapping?')) return;
    
    setRemovingId(studentId)
    setErrorMsg('')
    setSuccessMsg('')
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`http://localhost:8000/api/students/${studentId}?token=${session.access_token}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Failed to remove student')
      }

      setSuccessMsg('Student mapping removed successfully!')
      fetchStudents()
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setRemovingId(null)
    }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    setSubmittingManual(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const payload = { name, register_no: registerNo, email, class_id: classId }

      const response = await fetch(`http://localhost:8000/api/students?token=${session.access_token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Failed to add student')
      }

      setSuccessMsg('Student added successfully!')
      setShowManualForm(false)
      setName('')
      setRegisterNo('')
      setEmail('')
      fetchStudents()
    } catch (err) {
        setErrorMsg(err.message)
    } finally {
        setSubmittingManual(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setErrorMsg('')
    setSuccessMsg('')
    
    try {
        const { data: { session } } = await supabase.auth.getSession()
        const formData = new FormData()
        formData.append('file', file)
        formData.append('class_id', classId)
        formData.append('token', session.access_token)

        const response = await fetch(`http://localhost:8000/api/students/upload`, {
            method: 'POST',
            body: formData,
        })

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.detail || 'Failed to upload students')
        }

        let msg = result.message
        if (result.errors && result.errors.length > 0) {
            msg += ` However, ${result.errors.length} rows had errors (possibly duplicates). Check console loop for info.`
            console.warn('Upload issues:', result.errors)
        }

        setSuccessMsg(msg)
        fetchStudents()
    } catch (err) {
        setErrorMsg(err.message)
    } finally {
        setUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const triggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-indigo-600 border-b border-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link to="/teacher/dashboard" className="flex border-b-2 border-transparent hover:border-white transition-all items-center cursor-pointer">
              <BookOpen className="h-8 w-8 text-white mr-3" />
              <span className="text-xl font-bold text-white">Analytics Platform</span>
            </Link>
            <div className="flex items-center space-x-6">
              <span className="text-indigo-100 font-medium hidden sm:block">Teacher Portal</span>
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Link to="/teacher/classes" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Classes
        </Link>
        
        <div className="flex md:flex-row flex-col md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center">
              Student Roster <span className="ml-3 text-sm font-medium bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full">{students.length} Enrolled</span>
            </h1>
            <p className="mt-2 text-sm text-slate-600">Manage students manually or via bulk Excel upload.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
            >
              <UserPlus className="-ml-1 mr-2 h-5 w-5 text-slate-400" />
              {showManualForm ? 'Cancel Form' : 'Add Manually'}
            </button>
            <button
                onClick={triggerFileSelect}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="-ml-1 mr-2 h-5 w-5 animate-spin"/> : <FileSpreadsheet className="-ml-1 mr-2 h-5 w-5" />}
              {uploading ? 'Processing File...' : 'Upload Excel'}
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".xlsx, .xls" 
                className="hidden" 
            />
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <p className="text-sm text-green-700">{successMsg}</p>
          </div>
        )}

        {showManualForm && (
          <div className="bg-white shadow sm:rounded-lg mb-8 border border-slate-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add Student</h3>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Arun Kumar" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md p-2" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Register Number</label>
                    <input type="text" required value={registerNo} onChange={e => setRegisterNo(e.target.value)} placeholder="e.g. 21CS101" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md p-2" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">College Email</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. arun@college.edu" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md p-2" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={submittingManual} className="inline-flex justify-center py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 border border-transparent disabled:opacity-50">
                    {submittingManual ? <Loader2 className="animate-spin h-5 w-5" /> : 'Add to Roster'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Students Table */}
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Register No
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan="4" className="px-6 py-10 text-center">
                                <Loader2 className="mx-auto h-8 w-8 text-indigo-500 animate-spin" />
                            </td>
                        </tr>
                    ) : students.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                                <Users className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                                No students found. Add one manually or upload an Excel file.
                            </td>
                        </tr>
                    ) : (
                        students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border-l-4 border-transparent hover:border-indigo-500 transition-colors">
                            {student.register_no}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleRemoveStudent(student.id)}
                                disabled={removingId === student.id}
                                className="text-red-600 hover:text-red-900 focus:outline-none disabled:opacity-50"
                                title="Remove Student"
                              >
                                {removingId === student.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                              </button>
                            </td>
                        </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
