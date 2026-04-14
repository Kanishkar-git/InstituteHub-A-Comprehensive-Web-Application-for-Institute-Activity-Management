import { Menu, Search, Bell, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import UserProfile from '../UserProfile' // Using your existing UserProfile component

export default function TopNavbar({ courseCode, courseName }) {
  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-slate-200 shadow-sm">
      <button
        type="button"
        className="px-4 border-r border-slate-200 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 flex justify-between h-full items-center">
        {/* Breadcrumb / Title */}
        <div className="flex items-center max-w-2xl overflow-hidden whitespace-nowrap">
          <nav className="flex items-center text-sm font-medium text-slate-500">
            <Link to="/teacher/dashboard" className="hover:text-slate-900 transition-colors">
              Teacher Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 shrink-0 text-slate-400" />
            <Link to="/teacher/courses" className="hover:text-slate-900 transition-colors">
              Courses
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 shrink-0 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate">
              {courseCode} - {courseName || 'Analytics'}
            </span>
          </nav>
        </div>

        {/* Right Nav */}
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          <div className="relative hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors"
              placeholder="Search reports..."
            />
          </div>

          <button className="bg-white p-2 rounded-full text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            <span className="sr-only">View notifications</span>
            <div className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
            </div>
          </button>

          <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

          {/* Render the actual drop down you already built */}
          <div className="bg-slate-900 rounded-md">
             <UserProfile />
          </div>
        </div>
      </div>
    </div>
  )
}
