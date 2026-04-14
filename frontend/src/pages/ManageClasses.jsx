import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import UserProfile from '../components/UserProfile'
import { BookOpen, Plus, Users, ChevronRight, Loader2 } from 'lucide-react'

export default function ManageClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  const [className, setClassName] = useState('')
  const [year, setYear] = useState(1)
  const [department, setDepartment] = useState('')
  const [section, setSection] = useState('')
  const [semester, setSemester] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('http://localhost:8000/api/classes?token=' + session.access_token)
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClass = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const payload = {
        class_name: className,
        year: parseInt(year),
        department,
        section,
        semester: parseInt(semester)
      }

      const response = await fetch(`http://localhost:8000/api/classes?token=${session.access_token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Failed to create class')
      }

      setSuccessMsg('Class created successfully!')
      setShowForm(false)
      // Reset form
      setClassName('')
      setDepartment('')
      setSection('')
      // Refresh list
      fetchClasses()
      
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setSubmitting(false)
    }
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Manage Classes</h1>
            <p className="mt-2 text-sm text-slate-600">Create new classes and view your active roster.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            {showForm ? 'Cancel' : 'Create Class'}
          </button>
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

        {showForm && (
          <div className="bg-white shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">New Class Details</h3>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Class Name</label>
                    <input type="text" required value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g. III Year CSE B" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input type="text" required value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. CSE" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <select value={year} onChange={e => setYear(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Semester</label>
                    <input type="number" min="1" max="8" required value={semester} onChange={e => setSemester(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Section</label>
                    <input type="text" required value={section} onChange={e => setSection(e.target.value)} placeholder="e.g. A, B" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={submitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                    {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Class'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No classes</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new class.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {classes.map((cls) => (
                <li key={cls.id}>
                  <Link to={`/teacher/classes/${cls.id}/students`} className="block hover:bg-gray-50 transition-colors">
                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-lg font-bold text-indigo-600 truncate">{cls.class_name}</p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          Dep: {cls.department} | Year: {cls.year} | Sem: {cls.semester} | Sec: {cls.section}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center justify-center bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100">
                          <span className="text-xs text-indigo-500 uppercase font-semibold">Students</span>
                          <span className="text-lg font-bold text-indigo-700">{cls.student_count}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
