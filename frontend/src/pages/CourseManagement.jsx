import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import UserProfile from '../components/UserProfile'
import { BookOpen, Plus, FileText, ChevronRight, Loader2, BarChart3 } from 'lucide-react'

export default function CourseManagement() {
  const [courses, setCourses] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  const [courseCode, setCourseCode] = useState('')
  const [courseName, setCourseName] = useState('')
  const [faculty, setFaculty] = useState('')
  const [credits, setCredits] = useState(4)
  const [classId, setClassId] = useState('')
  
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Fetch classes for dropdown
      const classRes = await fetch('http://localhost:8000/api/classes?token=' + session.access_token)
      if (classRes.ok) {
        setClasses(await classRes.json())
      }

      // Fetch courses
      const courseRes = await fetch('http://localhost:8000/api/courses?token=' + session.access_token)
      if (courseRes.ok) {
        setCourses(await courseRes.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const payload = {
        course_code: courseCode,
        course_name: courseName,
        faculty: faculty,
        credits: parseInt(credits),
        class_id: classId
      }

      const response = await fetch(`http://localhost:8000/api/courses?token=${session.access_token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Failed to create course')
      }

      setSuccessMsg('Course created and students auto-enrolled successfully!')
      setShowForm(false)
      // Reset form
      setCourseCode('')
      setCourseName('')
      setFaculty('')
      setCredits(4)
      setClassId('')
      // Refresh list
      fetchData()
      
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
            <h1 className="text-3xl font-extrabold text-slate-900">Manage Courses</h1>
            <p className="mt-2 text-sm text-slate-600">Create new courses and enter marks for enrolled students.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            {showForm ? 'Cancel' : 'Create Course'}
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
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">New Course Details</h3>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Course Code</label>
                    <input type="text" required value={courseCode} onChange={e => setCourseCode(e.target.value)} placeholder="e.g. CS301" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
                  </div>
                  
                  <div className="sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700">Course Name</label>
                    <input type="text" required value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g. Data Structures" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Faculty In Charge</label>
                    <input type="text" required value={faculty} onChange={e => setFaculty(e.target.value)} placeholder="e.g. Dr. Kumar" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Credits</label>
                    <select value={credits} onChange={e => setCredits(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value={0}>0</option>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Select Class</label>
                    <select required value={classId} onChange={e => setClassId(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="" disabled>Select a class</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.class_name} (Year {cls.year}, {cls.department}-{cls.section})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500 italic">Students belonging to the selected class will automatically perfectly be enrolled.</p>
                  <button type="submit" disabled={submitting} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                    {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Course'}
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
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {courses.map((course) => (
                <li key={course.id}>
                  <div className="block hover:bg-gray-50 transition-colors">
                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-lg font-bold text-indigo-600 truncate">{course.course_code}: {course.course_name}</p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                           Credits: {course.credits} | Faculty: {course.faculty} | Class: {course.classes ? `${course.classes.class_name} (${course.classes.department} - ${course.classes.section})` : 'Unknown'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Link to={`/teacher/courses/${course.id}/analytics`} className="flex bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100 shadow-sm cursor-pointer hover:bg-emerald-100 transition-colors">
                          <span className="text-xs text-emerald-700 font-semibold text-center mt-1"><BarChart3 className="inline h-4 w-4 mr-1 pb-1" />Analytics</span>
                        </Link>
                        <Link to={`/teacher/courses/${course.id}/marks`} className="flex bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100 shadow-sm cursor-pointer hover:bg-indigo-100 transition-colors">
                          <span className="text-xs text-indigo-700 font-semibold text-center mt-1"><BookOpen className="inline h-4 w-4 mr-1 pb-1" />Marks Flow</span>
                        </Link>
                        <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
