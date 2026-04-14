import { Link } from 'react-router-dom'
import { FileText, ArrowLeft, Download, ExternalLink } from 'lucide-react'
import UserProfile from '../components/UserProfile'

export default function Reports() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-indigo-600 border-b border-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link className="flex items-center text-white" to="/teacher/dashboard">
               <ArrowLeft className="h-5 w-5 mr-2" />
               <h1 className="text-xl font-bold">Reports Center</h1>
            </Link>
            <UserProfile />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Standard Reports</h2>
           <p className="text-slate-500 mt-1">Export analytics and outcome documents across all your assigned subjects.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center space-x-3 mb-4 text-indigo-600">
                 <FileText className="h-6 w-6" />
                 <h3 className="text-lg font-bold">Course-level Export</h3>
              </div>
              <p className="text-slate-600 text-sm mb-6 pb-6 border-b border-slate-100">
                  Select a specific course to download a complete spreadsheet outlining predictions, risk metrics, and top performers.
              </p>
              <Link to="/teacher/courses" className="flex items-center justify-between text-indigo-600 font-medium hover:text-indigo-800">
                  <span>Go to Courses</span>
                  <ExternalLink className="h-4 w-4" />
              </Link>
           </div>

           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center space-x-3 mb-4 text-emerald-600">
                 <Download className="h-6 w-6" />
                 <h3 className="text-lg font-bold">Batch Global Report</h3>
              </div>
              <p className="text-slate-600 text-sm mb-6 pb-6 border-b border-slate-100">
                  Compile a massive, multi-faceted summary combining all classes you teach. (Coming Soon)
              </p>
              <button disabled className="w-full flex items-center justify-center py-2 bg-slate-100 text-slate-400 font-medium rounded-lg cursor-not-allowed">
                  Export Unavailable
              </button>
           </div>
        </div>
      </main>
    </div>
  )
}
