import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileEdit,
  BarChart3,
  FileText,
  Settings,
  Building2
} from 'lucide-react'

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation()
  
  const navigation = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Classes', href: '/teacher/classes', icon: Users },
    { name: 'Courses', href: '/teacher/courses', icon: BookOpen },
    { name: 'Students', href: '/teacher/classes', icon: GraduationCap },
    { name: 'Marks Entry', href: '/teacher/courses', icon: FileEdit }, // Pointing to courses as entry point
    { name: 'Analytics', href: '/teacher/courses', icon: BarChart3, current: true }, // Directed to courses list
    { name: 'Institute Hub', href: '/teacher/institute', icon: Building2 },
    { name: 'Reports', href: '/teacher/reports', icon: FileText },
    { name: 'Settings', href: '/teacher/settings', icon: Settings },
  ]

  const SidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-indigo-500 p-2 rounded-lg">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Analytics Pro</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href) && item.href !== '#' || item.current
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-indigo-600/10 text-indigo-400' 
                  : 'hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon 
                className={`flex-shrink-0 mr-3 h-5 w-5 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} 
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20 shadow-2xl">
        {SidebarContent}
      </div>

      {/* Mobile Sidebar overlay could go here in a real implementation */}
    </>
  )
}
