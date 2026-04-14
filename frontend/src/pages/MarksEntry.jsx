import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import UserProfile from '../components/UserProfile'
import { BookOpen, ArrowLeft, Save, Loader2, CheckCircle, Upload, Edit, X } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function MarksEntry() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const fileInputRef = useRef(null)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws)
        
        console.log("Excel first row:", data[0])

        const updatedStudents = [...students]
        let matchCount = 0

        data.forEach(row => {
          const cleanRow = {}
          for (let key in row) {
            // Remove all spaces and make lowercase for very robust matching
            const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '')
            cleanRow[cleanKey] = row[key]
          }

          const regno = cleanRow['regno'] || cleanRow['registerno'] || cleanRow['register_no'] || cleanRow['rollno'] || cleanRow['registrationno'] || cleanRow['reg_no']
          if (!regno) return

          const studentIndex = updatedStudents.findIndex(s => String(s.register_no).trim().toLowerCase() === String(regno).trim().toLowerCase())
          
          if (studentIndex !== -1) {
            const st = updatedStudents[studentIndex]
            matchCount++
            
            const getMark = (...keys) => {
              for (let k of keys) {
                if (cleanRow[k] !== undefined && cleanRow[k] !== '') {
                  return cleanRow[k]
                }
              }
              return undefined
            }

            let co1 = getMark('co1(25)', 'co1', 'courseoutcome1') ?? st.co1
            let co2 = getMark('co2(25)', 'co2', 'courseoutcome2') ?? st.co2
            let co3 = getMark('co3(25)', 'co3', 'courseoutcome3') ?? st.co3
            let co4 = getMark('co4(25)', 'co4', 'courseoutcome4') ?? st.co4
            let co5 = getMark('co5(25)', 'co5', 'courseoutcome5') ?? st.co5
            
            let ct1 = getMark('ct1(100)', 'cat1(100)', 'ct1', 'cat1', 'cycletest1') ?? st.cycle_test1
            let ct2 = getMark('ct2(100)', 'cat2(100)', 'ct2', 'cat2', 'cycletest2') ?? st.cycle_test2
            let ct3 = getMark('ct3(100)', 'cat3(100)', 'ct3', 'cat3', 'cycletest3') ?? st.cycle_test3
            
            let assign = getMark('assign(50)', 'assignment(50)', 'assign', 'assignment', 'ass') ?? st.assignment

            const parseMark = (val) => {
              if (val === undefined || val === null || val === '') return null;
              const parsed = Number(val);
              return isNaN(parsed) ? null : parsed;
            }

            st.co1 = parseMark(co1)
            st.co2 = parseMark(co2)
            st.co3 = parseMark(co3)
            st.co4 = parseMark(co4)
            st.co5 = parseMark(co5)
            st.cycle_test1 = parseMark(ct1)
            st.cycle_test2 = parseMark(ct2)
            st.cycle_test3 = parseMark(ct3)
            st.assignment = parseMark(assign)

            const credits = course?.credits || 0
            let internal = 0
            const c_ct1 = st.cycle_test1 || 0
            const c_ct2 = st.cycle_test2 || 0
            const c_ct3 = st.cycle_test3 || 0
            const c_assign = st.assignment || 0

            if (credits === 4) {
              const co_total = (st.co1||0) + (st.co2||0) + (st.co3||0) + (st.co4||0) + (st.co5||0)
              internal = (co_total / 125.0 * 20.0) + (c_assign * 0.1) + (c_ct1 * 0.09) + (c_ct2 * 0.09) + (c_ct3 * 0.0625)
            } else {
              const student_total = c_ct1 + c_ct2 + c_ct3 + c_assign
              internal = (student_total / 350.0) * 40.0
            }
            
            st.internal_marks = Number(internal.toFixed(2))
          }
        })

        setStudents(updatedStudents)
        if (matchCount > 0) {
          setIsEditing(true)
          setMessage({ text: `Excel parsed: ${matchCount} students updated successfully!`, type: 'success' })
        } else {
          console.log("No matches found. Students state:", students.map(s => s.register_no))
          setMessage({ text: 'Excel parsed, but no matching registration numbers found. Check console for details.', type: 'error' })
        }
      } catch (err) {
        console.error("Excel parse error", err)
        setMessage({ text: 'Failed to parse Excel file.', type: 'error' })
      }
    }
    reader.readAsBinaryString(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  useEffect(() => {
    fetchMarksData()
  }, [courseId])

  const fetchMarksData = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`http://localhost:8000/api/marks/course/${courseId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setCourse(data.course)
        setStudents(data.students)
      } else {
        const err = await response.json()
        setMessage({ text: err.detail || 'Failed to fetch tracking data', type: 'error' })
      }
    } catch (err) {
      console.error(err)
      setMessage({ text: 'Network error', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (studentIndex, field, value) => {
    const updated = [...students]
    const val = value === '' ? null : Number(value)
    updated[studentIndex][field] = val
    
    // Auto-calculate internal roughly for display (backend will recalculate definitively)
    const s = updated[studentIndex]
    const credits = course?.credits || 0
    let internal = 0

    const ct1 = s.cycle_test1 || 0
    const ct2 = s.cycle_test2 || 0
    const ct3 = s.cycle_test3 || 0
    const assign = s.assignment || 0

    if (credits === 4) {
      const co_total = (s.co1||0) + (s.co2||0) + (s.co3||0) + (s.co4||0) + (s.co5||0)
      internal = (co_total / 125.0 * 20.0) + (assign * 0.1) + (ct1 * 0.09) + (ct2 * 0.09) + (ct3 * 0.0625)
    } else {
      const student_total = ct1 + ct2 + ct3 + assign
      internal = (student_total / 350.0) * 40.0
    }
    
    updated[studentIndex].internal_marks = Number(internal.toFixed(2))
    setStudents(updated)
  }

  const handleSaveMarks = async () => {
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const payload = {
        marks: students.map(s => ({
          student_id: s.student_id,
          course_id: courseId,
          co1: s.co1,
          co2: s.co2,
          co3: s.co3,
          co4: s.co4,
          co5: s.co5,
          assignment: s.assignment,
          cycle_test1: s.cycle_test1,
          cycle_test2: s.cycle_test2,
          cycle_test3: s.cycle_test3
        }))
      }

      const response = await fetch(`http://localhost:8000/api/marks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setMessage({ text: 'Marks saved successfully!', type: 'success' })
        setIsEditing(false)
        // Refetch to get exact backend calculations
        fetchMarksData()
      } else {
        const err = await response.json()
        setMessage({ text: err.detail || 'Failed to save marks', type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Network Error', type: 'error' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    }
  }

  const isFourCredits = course?.credits === 4

  const renderCell = (value, idx, field, max) => (
    <td className="px-2 py-2 text-center">
      {isEditing ? (
        <input 
          type="number" 
          min="0" 
          max={max} 
          value={value ?? ''} 
          onChange={e => handleInputChange(idx, field, e.target.value)} 
          className="w-16 p-1 mx-auto border border-gray-300 rounded text-center focus:ring-indigo-500 focus:border-indigo-500" 
        />
      ) : (
        <span className="text-gray-700 font-medium">{value ?? '-'}</span>
      )}
    </td>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-indigo-600 border-b border-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link to="/teacher/dashboard" className="flex items-center cursor-pointer border-b-2 border-transparent hover:border-white transition-all">
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

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/teacher/courses" className="text-gray-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {loading ? 'Loading...' : `Marks Entry: ${course?.course_code || ''}`}
              </h1>
              {course && (
                <p className="text-sm text-slate-500 mt-1">
                  Credits: {course.credits} | Internal Max: {isFourCredits ? '50' : '40'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            {isEditing ? (
              <>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  <Upload className="-ml-1 mr-2 h-4 w-4 text-slate-500" />
                  Upload Excel
                </button>
                <button 
                  onClick={() => { setIsEditing(false); fetchMarksData(); }} 
                  disabled={saving || loading}
                  className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  <X className="-ml-1 mr-2 h-4 w-4 text-slate-500" />
                  Cancel
                </button>
                <button 
                  onClick={handleSaveMarks} 
                  disabled={saving || loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> : <Save className="-ml-1 mr-2 h-4 w-4" />}
                  Save All Marks
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)} 
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                <Edit className="-ml-1 mr-2 h-4 w-4" />
                Edit Marks
              </button>
            )}
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-md flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.type === 'success' && <CheckCircle className="h-5 w-5 mr-2 text-green-500" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="bg-white shadow rounded-lg border border-slate-200 overflow-x-auto">
          {loading ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">No students enrolled in this course.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-48">Student Info</th>
                  {isFourCredits && (
                    <>
                      <th className="px-2 py-3 text-center font-medium text-gray-500 uppercase tracking-wider title" title="Max 25">CO1 (25)</th>
                      <th className="px-2 py-3 text-center font-medium text-gray-500 uppercase tracking-wider title" title="Max 25">CO2 (25)</th>
                      <th className="px-2 py-3 text-center font-medium text-gray-500 uppercase tracking-wider title" title="Max 25">CO3 (25)</th>
                      <th className="px-2 py-3 text-center font-medium text-gray-500 uppercase tracking-wider title" title="Max 25">CO4 (25)</th>
                      <th className="px-2 py-3 text-center font-medium text-gray-500 uppercase tracking-wider title" title="Max 25">CO5 (25)</th>
                    </>
                  )}
                  <th className="px-2 py-3 text-center font-medium text-gray-500 uppercase tracking-wider title" title="Max 100">{!isFourCredits ? 'CAT1' : 'CT1'} (100)</th>
                  <th className="px-2 py-3 text-center font-medium text-gray-500 uppercase tracking-wider title" title="Max 100">{!isFourCredits ? 'CAT2' : 'CT2'} (100)</th>
                  <th className="px-2 py-3 text-center font-medium text-gray-500 uppercase tracking-wider title" title="Max 100">{!isFourCredits ? 'CAT3' : 'CT3'} (100)</th>
                  <th className="px-2 py-3 text-center font-medium text-gray-500 uppercase tracking-wider title" title="Max 50">Assign (50)</th>
                  <th className="px-4 py-3 text-center font-bold text-indigo-600 uppercase tracking-wider w-24">Internal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((st, idx) => (
                  <tr key={st.student_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-inherit z-10 font-medium text-gray-900 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <div>{st.name}</div>
                      <div className="text-xs text-gray-500">{st.register_no}</div>
                    </td>
                    
                    {isFourCredits && (
                      <>
                        {renderCell(st.co1, idx, 'co1', 25)}
                        {renderCell(st.co2, idx, 'co2', 25)}
                        {renderCell(st.co3, idx, 'co3', 25)}
                        {renderCell(st.co4, idx, 'co4', 25)}
                        {renderCell(st.co5, idx, 'co5', 25)}
                      </>
                    )}
                    
                    {renderCell(st.cycle_test1, idx, 'cycle_test1', 100)}
                    {renderCell(st.cycle_test2, idx, 'cycle_test2', 100)}
                    {renderCell(st.cycle_test3, idx, 'cycle_test3', 100)}
                    {renderCell(st.assignment, idx, 'assignment', 50)}
                    
                    <td className="px-4 py-2 font-bold text-center text-indigo-700 bg-indigo-50/50">
                      {st.internal_marks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
