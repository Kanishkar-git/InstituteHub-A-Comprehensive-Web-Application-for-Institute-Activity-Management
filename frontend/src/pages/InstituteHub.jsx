import { useState, useEffect } from 'react'
import { 
  Calendar as CalendarIcon, MapPin, Megaphone, Users, CheckSquare, 
  Monitor, Clock, Plus, ChevronRight, MoreVertical, Bell, Search, 
  AlertTriangle, Lightbulb, BarChart2, Briefcase, FileText, Settings, 
  X, GripVertical, CheckCircle2, ChevronDown, Check
} from 'lucide-react'
import { Link } from 'react-router-dom'
import UserProfile from '../components/UserProfile'

export default function InstituteHub() {
  const [searchTerm, setSearchTerm] = useState('')
  const [announcementFilter, setAnnouncementFilter] = useState('All')
  const [showToast, setShowToast] = useState(false)
  const [activeAlert, setActiveAlert] = useState(true)

  const handleTaskToggle = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Smart Insights Data
  const insights = [
    { label: "Total Events", value: "24", subtext: "This month", progress: 65, color: "bg-indigo-500" },
    { label: "Resource Utilization", value: "82%", subtext: "Peak time", progress: 82, color: "bg-emerald-500" },
    { label: "Pending Tasks", value: "8", subtext: "2 Urgent", progress: 40, color: "bg-rose-500" },
  ]

  const events = [
    { title: "AI/ML Workshop 2026", date: "OCT 15", time: "10:00 AM - 04:00 PM", attendees: 120, location: "Main Auditorium", type: "Workshop", color: "bg-purple-100 text-purple-700 border-purple-200" },
    { title: "End Semester Faculty Meeting", date: "OCT 18", time: "02:00 PM - 03:30 PM", attendees: 45, location: "Conference Hall B", type: "Meeting", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { title: "Cultural Fest - TechX", date: "NOV 02", time: "All Day", attendees: 850, location: "Campus Grounds", type: "Festival", color: "bg-amber-100 text-amber-700 border-amber-200" }
  ]

  const announcements = [
    { sender: "Admin Office", time: "2 hours ago", subject: "Diwali Holiday Schedule Updates", content: "Please review the attached schedule for the upcoming Diwali break.", priority: "High", read: false, attachment: "Schedule_2026.pdf" },
    { sender: "IT Department", time: "Yesterday", subject: "Server Maintenance Alert", content: "LMS will be down from 2 AM to 4 AM on Sunday for database indexing upgrades.", priority: "Normal", read: true },
    { sender: "Dean of Academics", time: "3 days ago", subject: "Revised Grading Policy", content: "The new continuous assessment grading schema has been approved.", priority: "Important", read: true }
  ]

  const resources = [
    { name: "Lab 4 (Computer Science)", status: "Available", type: "Facility", badge: "bg-emerald-100 text-emerald-700" },
    { name: "Projector X1 (Sony)", status: "In Use (Dr. Smith)", type: "Equipment", badge: "bg-amber-100 text-amber-700" },
    { name: "Seminar Hall A", status: "Maintenance", type: "Facility", badge: "bg-rose-100 text-rose-700" },
  ]

  const tasks = [
    { desc: "Finalize AI syllabus revision", deadline: "Today", assignedTo: "Self", priority: "High", complete: false },
    { desc: "Review lab equipment budget", deadline: "Tomorrow", assignedTo: "Dept Head", priority: "Medium", complete: false },
    { desc: "Approve TechX setup", deadline: "In 3 Days", assignedTo: "Committee", priority: "Low", complete: true },
    { desc: "Submit term attendance", deadline: "Oct 20", assignedTo: "Self", priority: "High", complete: false },
  ]

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-rose-600 bg-rose-50'
      case 'Important': return 'text-amber-600 bg-amber-50'
      default: return 'text-slate-500 bg-slate-50'
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col font-sans relative overflow-hidden">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div className="flex items-center bg-slate-900 shadow-xl rounded-xl p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mr-3" />
            <span className="text-sm font-medium text-white">Task marked successfully.</span>
            <button className="ml-4 text-slate-400 hover:text-white transition" onClick={() => setShowToast(false)}><X className="h-4 w-4"/></button>
          </div>
        </div>
      )}

      {/* Real-time Alert Pop-up */}
      {activeAlert && (
         <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white px-4 py-3 flex justify-between items-center z-40 relative shadow-md">
            <div className="flex items-center max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
               <AlertTriangle className="h-5 w-5 mr-3 animate-pulse" />
               <p className="text-sm font-medium"><strong>Resource Conflict Detected:</strong> Seminar Hall A is double-booked on OCT 15 at 10:00 AM.</p>
               <button onClick={() => setActiveAlert(false)} className="ml-auto text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded transition"><X className="h-4 w-4"/></button>
            </div>
         </div>
      )}

      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
               
               <div className="flex items-center">
                 <Link to="/teacher/dashboard" className="flex items-center text-slate-800 hover:text-indigo-600 transition group mr-8">
                    <div className="bg-indigo-600 p-1.5 rounded-lg mr-2 group-hover:bg-indigo-700 transition shadow-sm border border-indigo-700">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight">Institute<span className="text-indigo-600">Hub</span></span>
                 </Link>

                 {/* Global Search */}
                 <div className="hidden md:block relative w-96">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Search className="h-4 w-4 text-slate-400" />
                   </div>
                   <input 
                     type="text" 
                     className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white sm:text-sm transition" 
                     placeholder="Search events, resources, announcements..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                 </div>
               </div>

               <div className="flex items-center space-x-4">
                  <button className="hidden sm:flex bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold items-center shadow-[0_2px_10px_-3px_rgba(99,102,241,0.5)] hover:shadow-[0_4px_14px_-3px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 transition-all">
                     <Plus className="w-4 h-4 mr-1.5"/> Create New
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition relative">
                     <Bell className="w-5 h-5" />
                     <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                  </button>
                  <div className="pl-2 border-l border-slate-200">
                     <UserProfile />
                  </div>
               </div>
            </div>
          </div>
      </nav>

      <main className="flex-1 overflow-y-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT SIDE (Primary Content) */}
          <div className="xl:col-span-2 space-y-8 animate-fade-in">
            
            {/* Smart Insights Widget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {insights.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition group overflow-hidden relative">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition group-hover:scale-110">
                        <BarChart2 className="w-24 h-24" />
                     </div>
                     <p className="text-sm font-semibold text-slate-500 mb-1 relative z-10">{item.label}</p>
                     <div className="flex items-end justify-between relative z-10">
                        <h3 className="text-3xl font-extrabold text-slate-800">{item.value}</h3>
                        <span className="text-xs font-medium text-slate-400 mb-1">{item.subtext}</span>
                     </div>
                     <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 relative z-10">
                        <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${item.progress}%` }}></div>
                     </div>
                  </div>
               ))}
            </div>
            
            {/* Upcoming Events Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group/card hover:shadow-md transition">
               <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center">
                     <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg mr-2"><CalendarIcon className="w-5 h-5"/></div>
                     Upcoming Events
                  </h3>
                  <button className="text-indigo-600 font-semibold text-sm hover:underline flex items-center">View Calendar <ChevronRight className="w-4 h-4 ml-0.5"/></button>
               </div>
               <div className="divide-y divide-slate-100 bg-white">
                  {events.map((ev, i) => (
                     <div key={i} className="flex flex-col sm:flex-row sm:items-center p-6 hover:bg-slate-50 transition cursor-pointer group/item">
                        
                        {/* Date Badge */}
                        <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-2 w-16 h-16 text-center shadow-sm shrink-0 mb-4 sm:mb-0">
                           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{ev.date.split(' ')[0]}</span>
                           <span className="text-xl text-indigo-700 font-black leading-none mt-0.5">{ev.date.split(' ')[1]}</span>
                        </div>
                        
                        {/* Event Details */}
                        <div className="sm:ml-6 flex-1">
                           <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="font-bold text-slate-900 text-base">{ev.title}</h4>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${ev.color}`}>{ev.type}</span>
                           </div>
                           <div className="flex flex-wrap items-center text-sm text-slate-500 gap-y-2 gap-x-4 mt-1.5 font-medium">
                              <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5 text-slate-400"/> {ev.time}</span>
                              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-slate-400"/> {ev.location}</span>
                              <span className="flex items-center"><Users className="w-4 h-4 mr-1.5 text-slate-400"/> {ev.attendees} Registered</span>
                           </div>
                        </div>

                        <div className="hidden sm:flex text-slate-300 group-hover/item:text-indigo-500 transition-colors transform group-hover/item:translate-x-1 shrink-0 ml-4">
                           <ChevronRight className="w-6 h-6"/>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Announcements Feed */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
               <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center">
                     <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg mr-2"><Megaphone className="w-5 h-5"/></div>
                     Announcements Feed
                  </h3>
                  <div className="flex items-center space-x-3">
                     <select 
                       className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-2.5 py-1.5 outline-none"
                       value={announcementFilter}
                       onChange={(e) => setAnnouncementFilter(e.target.value)}
                     >
                       <option>All</option>
                       <option>Important</option>
                       <option>Unread</option>
                     </select>
                     <button className="text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-100 transition flex items-center">
                       <Megaphone className="w-3.5 h-3.5 mr-1.5"/> Broadcast
                     </button>
                  </div>
               </div>
               <div className="divide-y divide-slate-100">
                  {announcements.filter(a => announcementFilter === 'All' || a.priority === announcementFilter || (announcementFilter === 'Unread' && !a.read)).map((ann, i) => (
                     <div key={i} className={`p-6 relative hover:bg-slate-50 transition ${!ann.read ? 'bg-indigo-50/20' : ''}`}>
                        {/* Priority Strip */}
                        {ann.priority === 'High' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>}
                        
                        <div className="flex justify-between items-start mb-1">
                           <div className="flex items-center space-x-2">
                             {!ann.read && <span className="h-2 w-2 rounded-full bg-indigo-500"></span>}
                             <p className={`text-base font-bold text-slate-900 ${!ann.read ? 'text-indigo-900' : ''}`}>{ann.subject}</p>
                           </div>
                           <span className="text-xs font-medium text-slate-400 shrink-0">{ann.time}</span>
                        </div>
                        
                        <p className="text-slate-600 text-sm mt-1.5 mb-3 leading-relaxed max-w-3xl">{ann.content}</p>
                        
                        <div className="flex flex-wrap items-center justify-between gap-3">
                           <div className="flex items-center space-x-3">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{ann.sender}</span>
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${getPriorityColor(ann.priority)} border border-transparent`}>{ann.priority} Priority</span>
                           </div>
                           
                           {ann.attachment && (
                              <button className="flex items-center px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition">
                                 <FileText className="w-3 h-3 mr-1.5 text-slate-400" /> {ann.attachment}
                              </button>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
               <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center">
                 <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">View all announcements</button>
               </div>
            </div>

          </div>

          {/* RIGHT SIDE (Secondary Widgets) */}
          <div className="space-y-8 animate-fade-in-up">

            {/* AI Suggestions (BONUS) */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden border border-indigo-800">
               <div className="absolute -top-10 -right-10 opacity-10">
                 <Lightbulb className="w-40 h-40" />
               </div>
               <h3 className="text-lg font-bold flex items-center mb-4 relative z-10"><Lightbulb className="w-5 h-5 mr-2 text-yellow-400"/> AI Assistant</h3>
               <ul className="space-y-4 relative z-10">
                 <li className="flex items-start">
                   <div className="bg-indigo-800/50 p-1.5 rounded-lg mr-3 shrink-0"><CalendarIcon className="w-4 h-4 text-indigo-300"/></div>
                   <p className="text-sm text-indigo-100 leading-snug"><strong>Best time to schedule event:</strong> Thursday 2 PM (90% faculty available).</p>
                 </li>
                 <li className="flex items-start">
                   <div className="bg-indigo-800/50 p-1.5 rounded-lg mr-3 shrink-0"><Monitor className="w-4 h-4 text-indigo-300"/></div>
                   <p className="text-sm text-indigo-100 leading-snug"><strong>High demand:</strong> Projector X1 is booked for 80% of tomorrow.</p>
                 </li>
                 <li className="flex items-start">
                   <div className="bg-indigo-800/50 p-1.5 rounded-lg mr-3 shrink-0"><Users className="w-4 h-4 text-indigo-300"/></div>
                   <p className="text-sm text-indigo-100 leading-snug"><strong>Engagement:</strong> Upcoming TechX fest predicted to have 25% higher turnout.</p>
                 </li>
               </ul>
            </div>

            {/* Resources Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
               <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="text-base font-bold text-slate-900 flex items-center">
                    <Monitor className="w-4 h-4 mr-2 text-slate-400"/> Resources
                  </h3>
                  <button className="text-slate-400 hover:text-indigo-600 transition"><Search className="w-4 h-4"/></button>
               </div>
               <ul className="divide-y divide-slate-100">
                  {resources.map((res, i) => (
                     <li key={i} className="p-5 hover:bg-slate-50 transition flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-tight">{res.name}</p>
                          <div className="flex items-center mt-1 space-x-2">
                             <span className="text-xs font-medium text-slate-500">{res.type}</span>
                             <span className="text-xs text-slate-300">•</span>
                             <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${res.badge}`}>
                                {res.status}
                             </span>
                          </div>
                        </div>
                        <button className="text-indigo-600 bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                           Book
                        </button>
                     </li>
                  ))}
               </ul>
               <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                 <button className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition flex items-center justify-center w-full">View Availability Calendar <ChevronRight className="w-4 h-4 ml-1"/></button>
               </div>
            </div>

            {/* Task Delegation Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
               <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="text-base font-bold text-slate-900 flex items-center">
                    <CheckSquare className="w-4 h-4 mr-2 text-slate-400"/> Task Delegation
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">1/4 Done</span>
               </div>
               <div className="p-3">
                  <div className="space-y-1">
                     {tasks.map((task, i) => (
                        <div key={i} className="flex items-start p-3 hover:bg-slate-50 rounded-xl transition group">
                           <div className="mr-3 cursor-grab text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition pt-1">
                              <GripVertical className="w-4 h-4" />
                           </div>
                           <label className="flex items-start flex-1 cursor-pointer">
                              <div className="relative flex items-start pt-0.5">
                                 <input 
                                   type="checkbox" 
                                   defaultChecked={task.complete} 
                                   onChange={handleTaskToggle}
                                   className="peer shrink-0 appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-indigo-500 checked:bg-indigo-500 checked:border-0 transition" 
                                 />
                                 <Check className="absolute left-0.5 top-1 w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition"/>
                              </div>
                              <div className="ml-3">
                                 <p className={`text-sm font-bold ${task.complete ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.desc}</p>
                                 <div className={`flex flex-wrap items-center mt-1 gap-2 text-[11px] font-bold uppercase tracking-wider ${task.complete ? 'opacity-50' : ''}`}>
                                    <span className={task.deadline === 'Today' ? 'text-rose-500' : 'text-slate-500'}>Due {task.deadline}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">For: {task.assignedTo}</span>
                                    {task.priority === 'High' && <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Urgent</span>}
                                 </div>
                              </div>
                           </label>
                        </div>
                     ))}
                  </div>
                  <button className="w-full mt-3 py-2.5 bg-slate-50 text-indigo-600 text-sm font-bold rounded-xl border-2 border-dashed border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 transition flex items-center justify-center">
                     <Plus className="w-4 h-4 mr-1.5"/> Add New Task
                  </button>
               </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  )
}
