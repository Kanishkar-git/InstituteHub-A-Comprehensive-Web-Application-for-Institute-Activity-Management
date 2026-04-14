import { useState } from 'react'
import { Target, ChevronRight, Calculator, AlertCircle, Info, Sparkles } from 'lucide-react'

export default function PredictiveAnalytics({ data, onRowClick }) {
  if (!data) return null;

  if (data.error) {
    return (
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex items-center space-x-3 text-amber-800">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium text-sm">Target Predictor unavailable: {data.error}</p>
        </div>
    )
  }

  const { student_predictions } = data;

  const getTargetMarks = (internal, targetTotal) => {
    let req = Math.ceil((targetTotal - internal) / 0.6);
    if (req > 100) return null; // Impossible
    if (req < 50) return 50; // Minimum passing mark
    return req;
  }

  const getDifficulty = (marks, isMinimumPass) => {
    if (marks === null) return { label: 'Impossible', color: 'text-slate-400', bg: 'bg-slate-100/50', border: 'border-slate-200' };
    if (isMinimumPass && marks === 50) return { label: 'Safe', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (marks > 90) return { label: 'Very Hard', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
    if (marks >= 70) return { label: 'Challenging', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { label: 'Achievable', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  }

  const grades = [
    { name: 'O', target: 91, color: 'from-fuchsia-500 to-purple-600', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200' },
    { name: 'A+', target: 81, color: 'from-blue-500 to-indigo-600', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
    { name: 'A', target: 71, color: 'from-emerald-400 to-emerald-600', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { name: 'B+', target: 61, color: 'from-teal-400 to-teal-600', badgeClass: 'bg-teal-100 text-teal-800 border-teal-200' },
    { name: 'B', target: 56, color: 'from-orange-400 to-orange-600', badgeClass: 'bg-orange-100 text-orange-800 border-orange-200' },
    { name: 'C', target: 50, color: 'from-slate-400 to-slate-600', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <Calculator className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-indigo-900 to-slate-800 bg-clip-text text-transparent">
              Grade Target Predictor
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Marks required in End Exam (out of 100) to achieve each grade</p>
          </div>
        </div>
        <div className="flex items-center text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
          <Info className="w-4 h-4 mr-2 text-indigo-400" />
          Click a student row to view expanded insights
        </div>
      </div>

      {/* Grid Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-xs uppercase tracking-widest text-slate-400 font-semibold border-b border-slate-100">
              <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">Student</th>
              <th className="px-6 py-4 text-center whitespace-nowrap">Internal Score</th>
              <th className="px-6 py-4">Required End Sem Targets</th>
              <th className="px-6 py-4 text-right rounded-tr-xl"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {student_predictions?.map((student, idx) => {
              const internal = student.actual_internal || 0;
              return (
                <tr 
                  key={idx} 
                  onClick={() => onRowClick && onRowClick(student)}
                  className="group hover:bg-slate-50/50 transition-all duration-200 cursor-pointer"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100/50 group-hover:scale-105 transition-transform">
                        {student.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{student.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{student.register_no}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <div className="inline-flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 shadow-sm border border-slate-100">
                      <span className="text-lg font-bold text-slate-800">{internal}</span>
                      <span className="text-[10px] text-slate-400 font-medium">/ 40</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 min-w-[500px]">
                    <div className="flex gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
                      {grades.map(grade => {
                        const required = getTargetMarks(internal, grade.target);
                        if (required === null) {
                           return (
                             <div key={grade.name} className="flex-shrink-0 flex items-center bg-slate-50/50 border border-slate-100 rounded-xl px-3 py-1.5 opacity-50">
                                <span className={`text-xs font-bold w-6 text-center ${grade.badgeClass.split(' ')[1]}`}>{grade.name}</span>
                                <div className="h-4 w-px bg-slate-200 mx-2"></div>
                                <span className="text-xs font-medium text-slate-400">NA</span>
                             </div>
                           )
                        }
                        const isMinPass = grade.name === 'C' || grade.name === 'B' || grade.name === 'B+';
                        const diff = getDifficulty(required, isMinPass);
                        
                        return (
                          <div 
                            key={grade.name} 
                            title="Hover for detail"
                            className="group/pill flex-shrink-0 flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200 transition-all duration-300"
                          >
                            <span className={`flex items-center justify-center h-6 w-6 rounded text-[10px] font-bold border ${grade.badgeClass}`}>
                              {grade.name}
                            </span>
                            <div className="h-4 w-px bg-slate-100 mx-2.5"></div>
                            <div className="flex flex-col items-start pr-1">
                                <span className="text-sm font-bold text-slate-800 leading-none">{required}</span>
                            </div>
                            <div className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${diff.bg} ${diff.color} ${diff.border}`}>
                              {diff.label}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right whitespace-nowrap">
                     <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 group-hover:shadow transition-all mx-auto">
                        <ChevronRight className="w-5 h-5" />
                     </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}
