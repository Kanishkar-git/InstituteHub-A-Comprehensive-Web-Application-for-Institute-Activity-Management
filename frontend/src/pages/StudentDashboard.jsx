import { useState, useEffect } from 'react'
import { BookOpen, GraduationCap, Target, AlertCircle, Loader2, Trophy, Medal, Award, Star, Zap } from 'lucide-react'
import UserProfile from '../components/UserProfile'
import { supabase } from '../services/supabaseClient'

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`http://localhost:8000/api/students/profile?token=${session.access_token}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data) // Will be null if not mapped
      } else {
         setErrorMsg("Failed to load profile details")
      }
    } catch (err) {
      console.error(err)
      setErrorMsg("Network error loading profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-teal-600 border-b border-teal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex border-b-2 border-transparent hover:border-white transition-all items-center cursor-pointer">
              <BookOpen className="h-8 w-8 text-white mr-3" />
              <span className="text-xl font-bold text-white">Analytics Platform</span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-teal-100 font-medium hidden sm:block">Student Portal</span>
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin h-8 w-8 text-teal-600" />
          </div>
        ) : (
          <>
            {profile ? (
              <div className="bg-white shadow sm:rounded-lg mb-8 border border-slate-200 overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-teal-50 border-b border-teal-100">
                  <h3 className="text-lg leading-6 font-bold text-teal-900">Welcome, {profile.name}</h3>
                  <p className="mt-1 max-w-2xl text-sm text-teal-700">Student Profile Information.</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">   
                      <dt className="text-sm font-medium text-gray-500">Class Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-bold">{profile.classes?.class_name}</dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">   
                      <dt className="text-sm font-medium text-gray-500">Register No</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.register_no}</dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">   
                      <dt className="text-sm font-medium text-gray-500">Department</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.classes?.department}</dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">   
                      <dt className="text-sm font-medium text-gray-500">Year / Section</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.classes?.year} - {profile.classes?.section}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 cursor-pointer hover:bg-yellow-100 transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-1" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-md text-yellow-800 font-bold">
                      You are not assigned to any class yet.
                    </h3>
                    <p className="mt-2 text-sm text-yellow-700">
                      Please contact your teacher to enroll your login email into the correct class roster. 
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <h2 className="text-xl font-bold text-slate-900 mb-4 mt-8">Dashboard Options</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GraduationCap className="h-6 w-6 text-slate-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">My Courses</dt>
                    <dd className="text-lg font-medium text-slate-900">Current enrollments</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-sm">
              <span className="text-teal-600 font-medium hover:text-teal-900">View Courses &rarr;</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-6 w-6 text-slate-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">Learning Outcomes</dt>
                    <dd className="text-lg font-medium text-slate-900">View my progress</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-sm">
              <span className="text-teal-600 font-medium hover:text-teal-900">View Outcomes &rarr;</span>
            </div>
          </div>
          </div>

          {/* Gamification & Badges Section */}
          <h2 className="text-xl font-bold text-slate-900 mb-4 mt-10">Achievements & Badges</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              
              {/* Badge 1 */}
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-yellow-50 to-white border border-yellow-100 rounded-2xl text-center hover:scale-105 transition-transform cursor-pointer">
                 <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3 shadow-inner">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                 </div>
                 <h4 className="font-bold text-slate-800 text-sm">Top Performer</h4>
                 <p className="text-xs text-slate-500 mt-1">Database Systems</p>
              </div>

              {/* Badge 2 */}
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-indigo-50 to-white border border-indigo-100 rounded-2xl text-center hover:scale-105 transition-transform cursor-pointer">
                 <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3 shadow-inner">
                    <Zap className="h-8 w-8 text-indigo-500" />
                 </div>
                 <h4 className="font-bold text-slate-800 text-sm">Most Improved</h4>
                 <p className="text-xs text-slate-500 mt-1">+15% in CT2 vs CT1</p>
              </div>

              {/* Badge 3 */}
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-emerald-50 to-white border border-emerald-100 rounded-2xl text-center hover:scale-105 transition-transform cursor-pointer">
                 <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3 shadow-inner">
                    <Star className="h-8 w-8 text-emerald-500" />
                 </div>
                 <h4 className="font-bold text-slate-800 text-sm">100% Attendance</h4>
                 <p className="text-xs text-slate-500 mt-1">30 days streak</p>
              </div>

              {/* Badge 4 (Locked) */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center opacity-60">
                 <div className="h-16 w-16 bg-slate-200 rounded-full flex items-center justify-center mb-3 shadow-inner">
                    <Medal className="h-8 w-8 text-slate-400" />
                 </div>
                 <h4 className="font-bold text-slate-600 text-sm">Perfect Score</h4>
                 <p className="text-xs text-slate-500 mt-1">Locked</p>
              </div>

            </div>
          </div>
          </>
        )}
      </main>
    </div>
  )
}
