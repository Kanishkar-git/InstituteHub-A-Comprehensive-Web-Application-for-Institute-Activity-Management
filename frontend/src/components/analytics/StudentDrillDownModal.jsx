import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'
import { X, TrendingUp, TrendingDown, Target, Loader2, Sparkles, ArrowRight, ShieldCheck, Award } from 'lucide-react'

export default function StudentDrillDownModal({ student, onClose }) {
  const { courseId } = useParams();
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPercentage, setShowPercentage] = useState(false)

  useEffect(() => {
    if (!student || !courseId) return;
    
    const fetchStudentDetails = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const response = await fetch(`http://localhost:8000/api/marks/course/${courseId}`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          const exactMatch = data.students.find(s => s.student_id === student.student_id || s.register_no === student.register_no);
          if (exactMatch) setDetails(exactMatch);
        }
      } catch (err) {
        console.error("Failed to fetch drilldown details:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudentDetails();
  }, [student, courseId])

  if (!student) return null;

  const internal = student.actual_internal || student.internal_marks || details?.internal_marks || 0;

  const getTargetMarks = (internalScore, targetTotal) => {
    let req = Math.ceil((targetTotal - internalScore) / 0.6);
    if (req > 100) return null;
    if (req < 50) return 50;
    return req;
  }

  const grades = [
    { name: 'O', target: 91, color: 'bg-purple-500', bg: 'bg-purple-100', text: 'text-purple-700' },
    { name: 'A+', target: 81, color: 'bg-blue-500', bg: 'bg-blue-100', text: 'text-blue-700' },
    { name: 'A', target: 71, color: 'bg-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { name: 'B+', target: 61, color: 'bg-teal-500', bg: 'bg-teal-100', text: 'text-teal-700' },
    { name: 'B', target: 56, color: 'bg-orange-500', bg: 'bg-orange-100', text: 'text-orange-700' },
    { name: 'C', target: 50, color: 'bg-slate-500', bg: 'bg-slate-100', text: 'text-slate-700' },
  ];

  // Calculate current grade trajectory
  let currentPos = 'No Grade';
  let nextGrade = null;
  let ptsToNext = null;
  let bestPossible = null;

  const validGrades = grades.map(g => ({ ...g, req: getTargetMarks(internal, g.target) })).filter(g => g.req !== null);
  if (validGrades.length > 0) {
     bestPossible = validGrades[0].name;
     // simple logic for "current setup": assume a standard 75% end sem performance
     const assumedEndSem = 75;
     const estTotal = internal + (assumedEndSem * 0.6);
     for (let g of grades) {
        if (estTotal >= g.target) {
           currentPos = g.name;
           break;
        }
     }
     
     // Finding next grade above current
     for (let i = validGrades.length - 1; i >= 0; i--) {
        if (validGrades[i].name !== currentPos && validGrades[i].target > (internal + (assumedEndSem * 0.6))) {
           nextGrade = validGrades[i];
           ptsToNext = nextGrade.req - assumedEndSem;
           break;
        }
     }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 sm:p-6 z-50 backdrop-blur-md">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100 opacity-100">
        
        {/* Header - Glassy */}
        <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-md border-b border-slate-100 z-10">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
                {student.name.charAt(0)}
             </div>
             <div>
               <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{student.name}</h2>
               <p className="text-slate-500 text-sm flex items-center gap-2">
                 <span>ID: {student.register_no}</span>
                 <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                 <span className="text-indigo-600 font-medium">Student Insight Panel</span>
               </p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex-1 flex flex-col justify-center items-center min-h-[400px]">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <span className="text-slate-500 font-medium">Analyzing student records...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
             <div className="flex flex-col md:flex-row h-full">
                
                {/* LEFT COL: Profile & Summary */}
                <div className="w-full md:w-[35%] bg-slate-50/50 p-6 md:p-8 border-r border-slate-100 flex flex-col space-y-8">
                   
                   {/* Primary Stats */}
                   <div className="space-y-4">
                      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                         <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Internal Score</p>
                            <p className="text-4xl font-extrabold text-slate-800">{internal}<span className="text-xl text-slate-400 font-medium tracking-normal">/40</span></p>
                         </div>
                         <div className="h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <Target className="h-6 w-6 text-indigo-600" />
                         </div>
                      </div>

                      {/* Small Badges */}
                      <div className="grid grid-cols-2 gap-3">
                         <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                            <ShieldCheck className="h-5 w-5 text-emerald-600 mb-2" />
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Min Safe Score</p>
                            <p className="text-lg font-bold text-emerald-900">50 in End Sem</p>
                         </div>
                         <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                            <Award className="h-5 w-5 text-purple-600 mb-2" />
                            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-0.5">Best Possible</p>
                            <p className="text-lg font-bold text-purple-900">Grade {bestPossible || 'C'}</p>
                         </div>
                      </div>
                   </div>

                   {/* AI Smart Insight */}
                   <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 rounded-2xl p-6 shadow-lg shadow-indigo-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-20">
                         <Sparkles className="w-24 h-24 text-white" />
                      </div>
                      <div className="relative z-10">
                         <div className="flex items-center gap-2 text-indigo-200 mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
                         </div>
                         <p className="text-white font-medium text-lg mb-3 leading-snug">
                            Student is currently positioned to achieve <span className="font-bold text-amber-300">Grade {currentPos}</span>.
                         </p>
                         {nextGrade && (
                           <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10 mt-4">
                              <p className="text-indigo-100 text-sm">
                                 To reach <span className="font-bold text-white text-base">Grade {nextGrade.name}</span>, an improvement of 
                                 <span className="font-bold text-emerald-400"> +{ptsToNext > 0 ? ptsToNext : 5} marks</span> is required.
                              </p>
                           </div>
                         )}
                         <div className="mt-5 flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5" />
                            <p className="text-xs text-indigo-200/80 leading-relaxed">
                               Focus on <span className="text-indigo-100 font-medium">Unit 3 & 4</span> to improve outcome in the final exam.
                            </p>
                         </div>
                      </div>
                   </div>

                   {/* Mini Gauge Chart (Placeholder static for visuals) */}
                   <div>
                       <h4 className="text-sm font-semibold text-slate-800 mb-3">Overall Performance Trend</h4>
                       <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                   <TrendingUp className="h-5 w-5 text-emerald-600" />
                               </div>
                               <div>
                                   <p className="text-sm font-bold text-slate-800">Improving</p>
                                   <p className="text-xs text-slate-500">Last 3 cycle tests</p>
                               </div>
                           </div>
                           <ArrowRight className="h-4 w-4 text-slate-300" />
                       </div>
                   </div>

                </div>

                {/* RIGHT COL: Grade Target Breakdown */}
                <div className="w-full md:w-[65%] p-6 md:p-10 bg-white">
                   <div className="flex items-end justify-between mb-8">
                       <div>
                           <h3 className="text-2xl font-extrabold text-slate-800">Target Breakdown</h3>
                           <p className="text-slate-500 mt-1">Required end semester marks dynamically generated</p>
                       </div>
                       <label className="flex items-center cursor-pointer bg-slate-50 border border-slate-200 rounded-lg p-1">
                           <button onClick={() => setShowPercentage(false)} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${!showPercentage ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Marks</button>
                           <button onClick={() => setShowPercentage(true)} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${showPercentage ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Percent</button>
                       </label>
                   </div>
                   
                   <div className="space-y-6">
                      {grades.map((grade, idx) => {
                         const reqMarks = getTargetMarks(internal, grade.target);
                         const isImpossible = reqMarks === null;
                         const percentage = isImpossible ? 100 : Math.min(100, Math.round((reqMarks / 100) * 100));
                         
                         return (
                            <div key={idx} className={`group transition-all duration-300 ${isImpossible ? 'opacity-40 grayscale' : 'hover:scale-[1.01]'}`}>
                               <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm tracking-wide ${grade.bg} ${grade.text}`}>
                                        {grade.name}
                                     </div>
                                     <span className="text-slate-700 font-semibold">
                                        {isImpossible ? 'Impossible to achieve' : `${reqMarks} required`}
                                     </span>
                                  </div>
                                  <span className="text-lg font-bold text-slate-800">
                                     {isImpossible ? 'NA' : (showPercentage ? `${percentage}%` : `${reqMarks}/100`)}
                                  </span>
                               </div>
                               <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner flex relative">
                                  {isImpossible ? (
                                      <div className="h-full w-full bg-slate-200"></div>
                                  ) : (
                                      <div 
                                        className={`h-full ${grade.color} transition-all duration-1000 ease-out`} 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                  )}
                               </div>
                            </div>
                         )
                      })}
                   </div>

                </div>

             </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </div>
  )
}
