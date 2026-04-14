import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { Users, GraduationCap, Target, Percent, Loader2, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

import Sidebar from '../components/analytics/Sidebar'
import TopNavbar from '../components/analytics/TopNavbar'
import StatCard from '../components/analytics/StatCard'
import COAttainmentChart from '../components/analytics/COAttainmentChart'
import MarksDistributionChart from '../components/analytics/MarksDistributionChart'
import PerformanceTrendChart from '../components/analytics/PerformanceTrendChart'
import TopStudentsTable from '../components/analytics/TopStudentsTable'
import WeakStudentsTable from '../components/analytics/WeakStudentsTable'
import PredictiveAnalytics from '../components/analytics/PredictiveAnalytics'
import AttendanceScatterChart from '../components/analytics/AttendanceScatterChart'
import TopicDifficultyHeatmap from '../components/analytics/TopicDifficultyHeatmap'
import PredictiveTrajectoryChart from '../components/analytics/PredictiveTrajectoryChart'
import CohortComparisonChart from '../components/analytics/CohortComparisonChart'
import StudentDrillDownModal from '../components/analytics/StudentDrillDownModal'
import FloatingAIChatbot from '../components/analytics/FloatingAIChatbot'

export default function TeacherAnalyticsDashboard() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState(null)
  
  // Data states
  const [summary, setSummary] = useState(null)
  const [coData, setCoData] = useState([])
  const [marksDist, setMarksDist] = useState([])
  const [trends, setTrends] = useState([])
  const [topStudents, setTopStudents] = useState([])
  const [weakStudents, setWeakStudents] = useState([])
  const [predictiveData, setPredictiveData] = useState(null)
  
  // Advanced Chart Data States
  const [attendanceData, setAttendanceData] = useState([])
  const [topicData, setTopicData] = useState([])
  const [trajectoryData, setTrajectoryData] = useState([])
  const [cohortData, setCohortData] = useState([])
  
  // Drilldown State
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        
        if (!courseId) {
          // If no courseId is provided, fetch the teacher's first course and redirect to it
          const { data: courses } = await supabase
            .from('courses')
            .select('id')
            .eq('teacher_id', session.user.id)
            .limit(1)
            
          if (courses && courses.length > 0) {
             navigate(`/teacher/courses/${courses[0].id}/analytics`, { replace: true })
             return
          } else {
             // No courses found at all
             setLoading(false)
             return
          }
        }

        // Fetch basic course info directly
        const { data: courseData } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single()
          
        if (courseData) setCourse(courseData)

        const headers = { 'Authorization': `Bearer ${session.access_token}` }
        
        // Fetch all analytics fully concurrently
        const [
          summaryRes, 
          coRes, 
          distRes, 
          trendsRes, 
          topRes, 
          weakRes,
          predictiveRes,
          attendanceRes,
          topicRes,
          trajectoryRes,
          cohortRes
        ] = await Promise.all([
          fetch(`http://localhost:8000/api/analytics/summary/${courseId}`, { headers }),
          fetch(`http://localhost:8000/api/analytics/co-attainment/${courseId}`, { headers }),
          fetch(`http://localhost:8000/api/analytics/marks-distribution/${courseId}`, { headers }),
          fetch(`http://localhost:8000/api/analytics/student-trends/${courseId}`, { headers }),
          fetch(`http://localhost:8000/api/analytics/top-students/${courseId}`, { headers }),
          fetch(`http://localhost:8000/api/analytics/weak-students/${courseId}`, { headers }),
          fetch(`http://localhost:8000/api/analytics/predictive-analytics/${courseId}`, { headers }),
          fetch(`http://localhost:8000/api/analytics/attendance-scatter/${courseId}`, { headers }),
          fetch(`http://localhost:8000/api/analytics/topic-heatmap/${courseId}`, { headers }),
          fetch(`http://localhost:8000/api/analytics/predictive-trajectory/${courseId}`, { headers }),
          fetch(`http://localhost:8000/api/analytics/cohort-comparison/${courseId}`, { headers })
        ])

        if (summaryRes.ok) setSummary(await summaryRes.json())
        if (coRes.ok) setCoData(await coRes.json())
        if (distRes.ok) setMarksDist(await distRes.json())
        if (trendsRes.ok) setTrends(await trendsRes.json())
        if (topRes.ok) setTopStudents(await topRes.json())
        if (weakRes.ok) setWeakStudents(await weakRes.json())
        if (predictiveRes.ok) setPredictiveData(await predictiveRes.json())
        if (attendanceRes.ok) setAttendanceData(await attendanceRes.json())
        if (topicRes.ok) setTopicData(await topicRes.json())
        if (trajectoryRes.ok) setTrajectoryData(await trajectoryRes.json())
        if (cohortRes.ok) setCohortData(await cohortRes.json())
          
      } catch (err) {
        console.error("Error fetching analytics:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [courseId])

  const exportToExcel = () => {
    // Basic export for predictive data and top students
    const wb = XLSX.utils.book_new();
    
    if (predictiveData && predictiveData.student_predictions) {
      const predWs = XLSX.utils.json_to_sheet(predictiveData.student_predictions.map(s => ({
        "Student Name": s.name,
        "Register No": s.register_no,
        "Actual Marks": s.actual_internal,
        "Predicted Marks": s.predicted_internal,
        "Risk": s.risk_level,
        "AI Recommendation": s.ai_recommendation || ""
      })));
      XLSX.utils.book_append_sheet(wb, predWs, "Predictions");
    }
    
    if (topStudents.length > 0) {
      const topWs = XLSX.utils.json_to_sheet(topStudents);
      XLSX.utils.book_append_sheet(wb, topWs, "Top Performers");
    }

    XLSX.writeFile(wb, `${course?.course_code || 'Course'}_Analytics_Report.xlsx`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Crunching analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  const aiContextData = {
    course: course?.course_name,
    class_average: summary?.class_average,
    total_students: summary?.total_students,
    pass_percentage: summary?.pass_percentage,
    weak_students: weakStudents.slice(0, 5).map(s => ({name: s.name, internal: s.internal_marks})),
    top_students: topStudents.slice(0, 5).map(s => ({name: s.name, internal: s.internal_marks})),
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans relative">
      <Sidebar />
      
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        <TopNavbar 
          courseCode={course?.course_code} 
          courseName={course?.course_name} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Overview</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Performance metrics and student outcomes for {course?.course_name}.
                </p>
              </div>
              <button 
                onClick={exportToExcel}
                className="inline-flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
              >
                <Download className="h-4 w-4 text-indigo-600" />
                <span>Export Report</span>
              </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Total Students" 
                value={summary?.total_students || 0} 
                icon={Users} 
                colorClass="bg-blue-500" 
              />
              <StatCard 
                title="Class Average" 
                value={summary?.class_average || 0} 
                subtitle={`/ ${summary?.credits === 4 ? 50 : 40}`}
                icon={Target} 
                colorClass="bg-indigo-500" 
              />
              <StatCard 
                title="Pass Percentage" 
                value={`${summary?.pass_percentage || 0}%`}
                trend={summary?.pass_percentage >= 80 ? 'up' : 'down'}
                trendValue="+5.2%"
                icon={Percent} 
                colorClass="bg-emerald-500" 
              />
              <StatCard 
                title="Highest Score" 
                value={summary?.highest_score || 0} 
                icon={GraduationCap} 
                colorClass="bg-purple-500" 
              />
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Radar Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-slate-900">CO Attainment</h3>
                  <p className="text-sm text-slate-500 mt-1">Average attainment across CO1-CO5</p>
                </div>
                <div className="p-4">
                  <COAttainmentChart data={coData} />
                </div>
              </div>

              {/* Line Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-slate-900">Performance Trends</h3>
                  <p className="text-sm text-slate-500 mt-1">Class average progression over cycle tests</p>
                </div>
                <div className="p-4">
                  <PerformanceTrendChart data={trends} />
                </div>
              </div>

            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
              
              {/* Pie Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-slate-900">Marks Distribution</h3>
                  <p className="text-sm text-slate-500 mt-1">Internal marks breakdown</p>
                </div>
                <div className="p-4">
                  <MarksDistributionChart data={marksDist} />
                </div>
              </div>

              {/* Student Tables Container */}
              <div className="lg:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                {/* Top Students */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-900">Top Performers</h3>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-b-2xl">
                    <TopStudentsTable data={topStudents} onRowClick={setSelectedStudent} />
                  </div>
                </div>

                {/* Weak Students */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-base font-semibold text-slate-900">Attention Required</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                      {weakStudents.length} Students
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-b-2xl">
                    <WeakStudentsTable data={weakStudents} onRowClick={setSelectedStudent} />
                  </div>
                </div>

              </div>
            </div>

            {/* Advanced Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
              {/* Attendance vs Performance */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-slate-900">Attendance vs. Performance</h3>
                  <p className="text-sm text-slate-500 mt-1">Correlation between attendance % and internal marks</p>
                </div>
                <div className="p-4">
                  <AttendanceScatterChart data={attendanceData} />
                </div>
              </div>

              {/* Topic Difficulty */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-slate-900">Topic Difficulty Heatmap</h3>
                  <p className="text-sm text-slate-500 mt-1">Class average score per topic / question</p>
                </div>
                <div className="p-4">
                  <TopicDifficultyHeatmap data={topicData} />
                </div>
              </div>
              
              {/* Predictive Trajectory */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-slate-900">Individual Predictive Trajectory</h3>
                  <p className="text-sm text-slate-500 mt-1">Historical scores mapped to AI-predicted final score (Sample Student)</p>
                </div>
                <div className="p-4">
                  <PredictiveTrajectoryChart data={trajectoryData} />
                </div>
              </div>

              {/* Cohort Comparison */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-slate-900">Historical Cohort Comparisons</h3>
                  <p className="text-sm text-slate-500 mt-1">Current batch (2026) vs. Previous batch (2025)</p>
                </div>
                <div className="p-4">
                  <CohortComparisonChart data={cohortData} />
                </div>
              </div>
            </div>

            {/* Predictive Analytics Section */}
            <div className="pb-12">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Predictive Insights Engine</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Powered by Machine Learning models analyzing historical data to forecast student performance. Click any row to drill down.
                  </p>
                </div>
              </div>
              <PredictiveAnalytics data={predictiveData} onRowClick={setSelectedStudent} />
            </div>

          </div>
        </main>
      </div>

      {/* Drilldown Modal */}
      {selectedStudent && (
        <StudentDrillDownModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
      
      {/* Floating AI Chatbot */}
      <FloatingAIChatbot contextData={aiContextData} />
    </div>
  )
}
