import { useState, useEffect, useRef } from 'react'
import { supabase } from '../services/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'

export default function UserProfile() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          const { data: profileData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          if (!error && profileData) {
            setProfile(profileData)
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndProfile()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) {
    return <div className="h-10 w-32 animate-pulse bg-white/20 rounded-md"></div>
  }

  if (!user || !profile) return null

  // Generate initials for avatar
  const initials = profile.name 
    ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center space-x-3 focus:outline-none p-1 rounded-md hover:bg-black/10 transition-colors"
      >
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-sm font-medium text-white">{profile.name}</span>
          <span className="text-xs text-white/80 capitalize">{profile.role}</span>
        </div>
        
        <div className="h-9 w-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-semibold">
          {initials}
        </div>
        
        <ChevronDown className={`h-4 w-4 text-white/70 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 focus:outline-none z-50 origin-top-right transform transition-all">
          <div className="px-4 py-3">
            <p className="text-sm text-slate-900 font-medium truncate">{profile.name}</p>
            <p className="text-xs text-slate-500 truncate">{profile.email}</p>
          </div>
          
          <div className="py-1">
            <a href="#" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-indigo-900">
              <User className="mr-3 h-4 w-4 text-slate-400" />
              View Profile
            </a>
            <a href="#" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-indigo-900">
              <Settings className="mr-3 h-4 w-4 text-slate-400" />
              Account Settings
            </a>
          </div>
          
          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-3 h-4 w-4 text-red-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
