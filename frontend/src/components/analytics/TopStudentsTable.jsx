import { Trophy, Medal, Award } from 'lucide-react'

export default function TopStudentsTable({ data, onRowClick }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        No student data available yet.
      </div>
    )
  }

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2: return <Medal className="h-5 w-5 text-slate-400" />
      case 3: return <Award className="h-5 w-5 text-amber-600" />
      default: return <span className="text-slate-500 font-semibold">{rank}</span>
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead>
          <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="px-6 py-4 rounded-tl-lg">Rank</th>
            <th className="px-6 py-4">Student</th>
            <th className="px-6 py-4 text-center rounded-tr-lg">Internal Marks</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {data.map((student) => (
            <tr 
              key={student.register_no} 
              className={`hover:bg-slate-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(student)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-slate-100">
                    {getRankIcon(student.rank)}
                  </div>
                  {/* Simulated Trend Indicator */}
                  {student.rank % 2 !== 0 ? (
                    <span className="flex items-center text-xs text-emerald-600 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      Up
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-slate-400 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414l5-5a1 1 0 011.414 0l2.586 2.586 4.293-4.293a1 1 0 011.414 1.414l-5 5a1 1 0 01-1.414 0L10 11.414l-4.293 4.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      Same
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-900">{student.name}</div>
                <div className="text-xs text-slate-500">{student.register_no}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  {student.internal_marks}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
