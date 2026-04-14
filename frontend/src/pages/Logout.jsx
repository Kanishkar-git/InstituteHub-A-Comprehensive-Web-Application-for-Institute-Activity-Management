import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function Logout() {
  const navigate = useNavigate()

  useEffect(() => {
    const performLogout = async () => {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.error('Logout error:', err)
      } finally {
        navigate('/login', { replace: true })
      }
    }

    performLogout()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-600 font-medium">Logging out...</p>
      </div>
    </div>
  )
}
