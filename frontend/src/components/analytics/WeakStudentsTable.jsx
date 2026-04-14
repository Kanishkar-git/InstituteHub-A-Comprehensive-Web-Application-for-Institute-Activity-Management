import { AlertTriangle, AlertCircle } from 'lucide-react'

export default function WeakStudentsTable({ data, onRowClick }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-emerald-600">
        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-medium">Great news!</p>
        <p className="text-sm text-emerald-500 mt-1">No students are currently marked as at-risk.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead>
          <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="px-6 py-4 rounded-tl-lg">Student</th>
            <th className="px-6 py-4 text-center">Internal Marks</th>
            <th className="px-6 py-4 text-center rounded-tr-lg">Risk Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {data.map((student) => {
            const isRed = student.risk_level === 'Red'
            return (
              <tr 
                key={student.register_no} 
                className={`hover:bg-slate-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(student)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{student.name}</div>
                  <div className="text-xs text-slate-500">{student.register_no}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm font-semibold text-slate-700">
                    {student.internal_marks}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                    isRed 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {isRed ? (
                      <AlertTriangle className="mr-1.5 h-3.5 w-3.5 text-rose-500" />
                    ) : (
                      <AlertCircle className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                    )}
                    {isRed ? 'Critical' : 'At Risk'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
