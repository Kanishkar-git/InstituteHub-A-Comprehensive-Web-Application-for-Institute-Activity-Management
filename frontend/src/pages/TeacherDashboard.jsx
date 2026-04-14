import { BookOpen, Users, BarChart3, Settings } from 'lucide-react'
import UserProfile from '../components/UserProfile'
import { Link } from 'react-router-dom'

export default function TeacherDashboard() {

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-indigo-600 border-b border-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex border-b-2 border-transparent hover:border-white transition-all items-center cursor-pointer">
              <BookOpen className="h-8 w-8 text-white mr-3" />
              <span className="text-xl font-bold text-white">Analytics Platform</span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-indigo-100 font-medium hidden sm:block">Teacher Portal</span>
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Welcome, Teacher</h1>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Manage Classes Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-indigo-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Class Management</dt>
                      <dd>
                        <div className="text-lg font-bold text-gray-900">Manage Classes</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/teacher/courses" className="font-medium text-indigo-700 hover:text-indigo-900">
                    View classes and students &rarr;
                  </Link>
                </div>
              </div>
            </div>

          {/* Card 1 */}
          <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">Manage Students</dt>
                    <dd className="text-lg font-bold text-slate-900">View roster & performance</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-sm">
              <Link to="/teacher/classes" className="text-indigo-600 font-medium hover:text-indigo-900">
                View Details &rarr;
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-slate-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">Outcomes Analytics</dt>
                    <dd className="text-lg font-medium text-slate-900">Class averages & trends</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-sm">
              <Link to="/teacher/analytics" className="text-indigo-600 font-medium hover:text-indigo-900">View Analytics &rarr;</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
