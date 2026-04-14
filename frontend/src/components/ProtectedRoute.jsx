import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const ProtectedRoute = ({ session, allowedRole, children }) => {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      if (session?.user) {
        // Fetch role from the users table based on user id
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (data && !error) {
          setRole(data.role)
        }
      }
      setLoading(false)
    }

    fetchRole()
  }, [session])

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
  }

  if (allowedRole && role && role !== allowedRole) {
    // Redirect standard users from teacher dashboard to student dashboard and vice versa
    if (role === 'teacher') return <Navigate to="/teacher/dashboard" replace />
    if (role === 'student') {
      supabase.auth.signOut()
      return <Navigate to="/login" replace />
    }
    return <Navigate to="/login" replace />
  }

  if (role === 'student') {
    supabase.auth.signOut()
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
