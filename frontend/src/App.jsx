import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './services/supabaseClient'
import Login from './pages/Login'
import Register from './pages/Register'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import ManageClasses from './pages/ManageClasses'
import ManageStudents from './pages/ManageStudents'
import CourseManagement from './pages/CourseManagement'
import MarksEntry from './pages/MarksEntry'
import Logout from './pages/Logout'
import TeacherAnalyticsDashboard from './pages/TeacherAnalyticsDashboard'
import Settings from './pages/Settings'
import Reports from './pages/Reports'
import InstituteHub from './pages/InstituteHub'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Public Routes */}
        <Route path="/login" element={<Login session={session} />} />
        <Route path="/register" element={<Register session={session} />} />
        <Route path="/logout" element={<Logout />} />

        {/* Protected Routes */}
        <Route 
          path="/teacher/dashboard" 
          element={
            <ProtectedRoute session={session} allowedRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute session={session} allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/teacher/classes" 
          element={
            <ProtectedRoute session={session} allowedRole="teacher">
              <ManageClasses />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/teacher/classes/:classId/students" 
          element={
            <ProtectedRoute session={session} allowedRole="teacher">
              <ManageStudents />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/teacher/courses" 
          element={
            <ProtectedRoute session={session} allowedRole="teacher">
              <CourseManagement />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/teacher/courses/:courseId/marks" 
          element={
            <ProtectedRoute session={session} allowedRole="teacher">
              <MarksEntry />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/teacher/courses/:courseId/analytics" 
          element={
            <ProtectedRoute session={session} allowedRole="teacher">
              <TeacherAnalyticsDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/teacher/analytics" 
          element={
            <ProtectedRoute session={session} allowedRole="teacher">
              <TeacherAnalyticsDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/teacher/settings" 
          element={
            <ProtectedRoute session={session} allowedRole="teacher">
              <Settings />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/teacher/reports" 
          element={
            <ProtectedRoute session={session} allowedRole="teacher">
              <Reports />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/teacher/institute" 
          element={
            <ProtectedRoute session={session} allowedRole="teacher">
              <InstituteHub />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback component for unmatched paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
