import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, Search, User, Bell, Shield, Palette, Lock, 
  Database, Plug, Accessibility, HelpCircle, Save, Upload, 
  Monitor, Smartphone, Download, RefreshCw, Trash2, 
  CheckCircle2, X
} from 'lucide-react'
import UserProfile from '../components/UserProfile'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [unsaved, setUnsaved] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'data', label: 'Data & Reports', icon: Database },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'support', label: 'Help & Support', icon: HelpCircle },
  ]

  const handleSave = () => {
    setToast({ show: true, message: 'Preferences saved successfully!', type: 'success' })
    setUnsaved(false)
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const handleReset = () => {
    setUnsaved(false)
    setToast({ show: true, message: 'Settings reset to default.', type: 'info' })
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000)
  }

  // Common UI Elements
  const Toggle = ({ label, desc, defaultChecked = false }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-1 max-w-[80%]">{desc}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} onChange={() => setUnsaved(true)} />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
      </label>
    </div>
  )

  const SelectMenu = ({ label, options }) => (
    <div className="py-3 border-b border-slate-100 last:border-0 flex justify-between items-center bg-white rounded-lg px-2">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <select onChange={() => setUnsaved(true)} className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none">
        {options.map((opt, i) => <option key={i}>{opt}</option>)}
      </select>
    </div>
  )

  const ButtonAction = ({ label, icon: Icon, onClick, danger = false }) => (
    <button 
      onClick={onClick}
      className={`flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium rounded-xl transition ${danger ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-12">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div className="flex items-center bg-white border border-slate-100 shadow-xl rounded-xl p-4">
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3" /> : <RefreshCw className="h-5 w-5 text-blue-500 mr-3" />}
            <span className="text-sm font-bold text-slate-800">{toast.message}</span>
            <button className="ml-4 text-slate-400 hover:text-slate-600" onClick={() => setToast({show:false})}><X className="h-4 w-4"/></button>
          </div>
        </div>
      )}

      {/* Header */}
      <nav className="bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-800 border-b border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link className="flex items-center text-white/90 hover:text-white transition group" to="/teacher/dashboard">
               <div className="bg-white/10 p-2 rounded-lg mr-3 group-hover:bg-white/20 transition">
                 <ArrowLeft className="h-5 w-5" />
               </div>
               <h1 className="text-xl font-bold tracking-tight">Settings Workspace</h1>
            </Link>
            <div className="flex items-center space-x-4">
               <div className="hidden md:flex items-center bg-white/10 rounded-full px-4 py-1.5 border border-white/10">
                 <div className="h-8 w-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">K</div>
                 <div className="ml-3 text-left">
                    <p className="text-sm font-bold text-white leading-tight">Kanishkar</p>
                    <p className="text-xs text-indigo-200">Teacher Account</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition" 
              placeholder="Search settings..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
             {unsaved && <span className="text-xs font-bold text-amber-500 hidden md:block mr-2 animate-pulse">Unsaved changes</span>}
             <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm w-full sm:w-auto">Reset</button>
             <button onClick={handleSave} className="flex px-5 py-2 items-center justify-center text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20 w-full sm:w-auto"><Save className="w-4 h-4 mr-2" /> Save Changes</button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
           
           {/* Sidebar */}
           <div className="lg:w-1/4">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-3 sticky top-6">
                <nav className="space-y-1">
                   {tabs.map((tab) => {
                     if (searchTerm && !tab.label.toLowerCase().includes(searchTerm.toLowerCase())) return null;
                     return (
                       <button 
                         key={tab.id}
                         onClick={() => setActiveTab(tab.id)}
                         className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                       >
                         <tab.icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} /> 
                         {tab.label}
                       </button>
                     )
                   })}
                </nav>
             </div>
           </div>

           {/* Content Panel */}
           <div className="lg:w-3/4">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 min-h-[600px] animate-fade-in">
               
               {activeTab === 'profile' && (
                  <div className="max-w-2xl">
                     <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Overview</h2>
                     <p className="text-slate-500 text-sm mb-8">Manage your personal information and account details.</p>
                     
                     <div className="flex items-center mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="h-20 w-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md ring-4 ring-white">K</div>
                        <div className="ml-6 flex-1">
                           <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-xl shadow-sm hover:bg-slate-50 transition"><Upload className="w-4 h-4 mr-2"/> Upload Avatar</button>
                           <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                        </div>
                     </div>

                     <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div><label className="block text-sm font-semibold text-slate-700 mb-1">Display Name</label><input type="text" onChange={() => setUnsaved(true)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm" defaultValue="Kanishkar" /></div>
                           <div><label className="block text-sm font-semibold text-slate-700 mb-1">Email <span className="text-xs font-normal text-slate-400">(readonly)</span></label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed outline-none shadow-sm" value="kanishkar@example.edu" readOnly /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div><label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label><input type="text" onChange={() => setUnsaved(true)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm" defaultValue="+91 98765 43210" /></div>
                           <div><label className="block text-sm font-semibold text-slate-700 mb-1">Department</label><input type="text" onChange={() => setUnsaved(true)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm" defaultValue="Computer Science & Engineering" /></div>
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 mb-1">Bio</label>
                           <textarea onChange={() => setUnsaved(true)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm min-h-[100px]" defaultValue="Passionate software educator focusing on data structures, algorithms, and full-stack web development. Head of the upcoming CSE Hackathon 2026." />
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'notifications' && (
                  <div className="max-w-2xl">
                     <h2 className="text-2xl font-bold text-slate-900 mb-2">Notifications</h2>
                     <p className="text-slate-500 text-sm mb-8">Choose what alerts you want to receive and how you receive them.</p>

                     <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
                       <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4">Delivery Channels</h3>
                       <SelectMenu label="Notification Frequency" options={["Instant Delivery", "Daily Digest", "Weekly Digest", "Paused"]} />
                       <SelectMenu label="Primary Channel" options={["Email Delivery", "In-App Only", "SMS Alerts (Critical)"]} />
                     </div>

                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Push Alerts</h3>
                     <div className="space-y-2">
                        <Toggle label="Email alerts for at-risk students" desc="Get instantly notified if the AI flags a student dropping below threshold." defaultChecked={true} />
                        <Toggle label="Weekly performance reports" desc="Receive an automated spreadsheet generated every Friday morning." defaultChecked={true} />
                        <Toggle label="Assignment reminders" desc="Remind you to grade pending assignments 48hrs before deadline." defaultChecked={false} />
                        <Toggle label="New badge unlock alerts" desc="Notify when a student under your care achieves a new gamified milestone." defaultChecked={true} />
                        <Toggle label="System announcements" desc="Important platform maintenance and new feature rollouts." defaultChecked={false} />
                     </div>
                  </div>
               )}

               {activeTab === 'security' && (
                  <div className="max-w-2xl">
                     <h2 className="text-2xl font-bold text-slate-900 mb-2">Security Hub</h2>
                     <p className="text-slate-500 text-sm mb-8">Protect your account with modern security configurations.</p>

                     <div className="bg-white border text-center border-slate-200 p-6 rounded-2xl mb-8 flex flex-col justify-center items-center shadow-sm">
                       <Shield className="h-10 w-10 text-emerald-500 mb-3" />
                       <h3 className="text-lg font-bold text-slate-800">Your account is highly secure.</h3>
                       <p className="text-sm text-slate-500 max-w-sm mt-1">Configured strictly with modern AES encryption and protected via Supabase Auth services.</p>
                     </div>

                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Authentication</h3>
                     <div className="space-y-4 mb-8">
                        <Toggle label="Two-Factor Authentication (2FA)" desc="Require an extra TOTP code generated by an authenticator app when logging in." defaultChecked={true} />
                        <ButtonAction label="Change Password" icon={Lock} />
                     </div>

                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Active Sessions</h3>
                     <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                           <div className="flex items-center">
                              <Monitor className="h-8 w-8 text-indigo-500 bg-indigo-100 p-1.5 rounded-lg mr-4" />
                              <div>
                                 <p className="text-sm font-bold text-slate-800">Windows Desktop • Chrome</p>
                                 <p className="text-xs text-emerald-600 font-medium">Active now — Tamil Nadu, India</p>
                              </div>
                           </div>
                           <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Current</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100">
                           <div className="flex items-center">
                              <Smartphone className="h-8 w-8 text-slate-400 bg-slate-100 p-1.5 rounded-lg mr-4" />
                              <div>
                                 <p className="text-sm font-bold text-slate-800">Apple iPhone 14</p>
                                 <p className="text-xs text-slate-400">Last active 2 days ago — Tamil Nadu, India</p>
                              </div>
                           </div>
                           <button className="text-slate-400 hover:text-rose-500 text-xs font-bold transition">Revoke</button>
                        </div>
                     </div>
                     <ButtonAction label="Logout from all devices" icon={Monitor} danger={true} />
                  </div>
               )}

               {activeTab === 'appearance' && (
                  <div className="max-w-2xl">
                     <h2 className="text-2xl font-bold text-slate-900 mb-2">Appearance</h2>
                     <p className="text-slate-500 text-sm mb-8">Customize how the platform looks and feels.</p>

                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Interface Theme</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        <div className="border-2 border-indigo-500 rounded-xl p-1 cursor-pointer">
                           <div className="bg-slate-50 h-24 rounded-lg flex items-center justify-center border border-slate-200">
                              <p className="text-slate-800 font-bold text-sm">Light (Active)</p>
                           </div>
                        </div>
                        <div className="border-2 border-transparent hover:border-slate-300 rounded-xl p-1 cursor-pointer transition">
                           <div className="bg-slate-900 h-24 rounded-lg flex items-center justify-center border border-slate-700">
                              <p className="text-slate-200 font-bold text-sm">Dark Mode</p>
                           </div>
                        </div>
                     </div>

                     <SelectMenu label="Accent Color Preference" options={["System Purple", "Emerald Green", "Ocean Blue", "Crimson Red"]} />
                     <div className="mt-4">
                        <SelectMenu label="Font Size" options={["Small (Compact)", "Medium (Default)", "Large (Comfortable)", "Extra Large"]} />
                     </div>
                     <div className="mt-4">
                        <Toggle label="Compact Mode" desc="Reduces padding across all tables allowing more rows to fit on screen." defaultChecked={false} />
                     </div>
                  </div>
               )}

               {activeTab === 'privacy' && (
                  <div className="max-w-2xl">
                     <h2 className="text-2xl font-bold text-slate-900 mb-2">Privacy Control</h2>
                     <p className="text-slate-500 text-sm mb-8">Manage how your data is handled and displayed to others.</p>

                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Visibility</h3>
                     <div className="space-y-2 mb-8">
                        <SelectMenu label="Profile Visibility" options={["Public (All Faculty)", "Private (Only Admins)"]} />
                        <Toggle label="Data Sharing" desc="Allow anonymous analytics data to improve the platform's AI predictions." defaultChecked={true} />
                        <Toggle label="Activity Tracking" desc="Share your usage telemetry to let us optimize the dashboard layout." defaultChecked={true} />
                     </div>

                     <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-4 border-b border-rose-100 pb-2">Danger Zone</h3>
                     <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl">
                        <ButtonAction label="Download My Institutional Data Archive" icon={Download} />
                        <div className="mt-4 pt-4 border-t border-rose-200/50">
                           <h4 className="text-rose-900 font-bold text-sm mb-1">Delete Account</h4>
                           <p className="text-rose-700 text-xs mb-4 max-w-sm">Permanently wipe all your records and disassociate from mapped courses. This action is irreversible.</p>
                           <ButtonAction label="Delete Account Permanently" icon={Trash2} danger={true} />
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'data' && (
                  <div className="max-w-2xl">
                     <h2 className="text-2xl font-bold text-slate-900 mb-2">Data & Reports</h2>
                     <p className="text-slate-500 text-sm mb-8">Automate and export your class performance insights.</p>

                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Automation Preferences</h3>
                     <div className="space-y-4 mb-8">
                        <Toggle label="Auto-generate end of semester reports" desc="Automatically compile a PDF summarizing the performance when course closes." defaultChecked={true} />
                        <SelectMenu label="Default Export Format" options={["Microsoft Excel (.xlsx)", "PDF Document (.pdf)", "Raw CSV (.csv)"]} />
                        <SelectMenu label="Schedule Routine Backups" options={["Disable", "Weekly on Friday", "Monthly on 1st"]} />
                     </div>
                     <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center shadow-sm hover:shadow-md transition">
                        <div>
                           <p className="text-sm font-bold text-slate-800">Archive_2025_SEM1.zip</p>
                           <p className="text-xs text-slate-500">Auto-generated • 4.2 MB</p>
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">Download</button>
                     </div>
                  </div>
               )}

               {activeTab === 'integrations' && (
                  <div className="max-w-2xl">
                     <h2 className="text-2xl font-bold text-slate-900 mb-2">Integrations</h2>
                     <p className="text-slate-500 text-sm mb-8">Connect external third-party software and environments.</p>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-indigo-300 transition">
                           <div className="flex items-center">
                              <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold mr-4">G</div>
                              <div>
                                 <p className="text-sm font-bold text-slate-800">Google Classroom</p>
                                 <p className="text-xs text-emerald-600 font-medium">Connected</p>
                              </div>
                           </div>
                           <button className="text-slate-400 hover:text-slate-600 text-sm font-bold">Manage</button>
                        </div>
                        
                        <div className="flex items-center justify-between p-5 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-indigo-300 transition">
                           <div className="flex items-center">
                              <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 font-bold mr-4">T</div>
                              <div>
                                 <p className="text-sm font-bold text-slate-800">Microsoft Teams</p>
                                 <p className="text-xs text-slate-400 font-medium">Not configured</p>
                              </div>
                           </div>
                           <button className="text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition">Connect</button>
                        </div>

                        <Toggle label="Canvas LMS Bi-directional Sync" desc="Pull assignments and push graded marks automatically back to LMS." defaultChecked={false} />
                     </div>

                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 mt-8">Developer Keys</h3>
                     <div className="flex items-center justify-between bg-slate-900 rounded-xl p-4">
                        <div>
                           <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">REST API Key</p>
                           <p className="text-sm font-mono text-slate-200 mt-1">sk_test_••••••••••••••••</p>
                        </div>
                        <button className="text-indigo-400 hover:text-indigo-300 text-xs font-bold transition">Roll Key</button>
                     </div>
                  </div>
               )}

               {activeTab === 'accessibility' && (
                  <div className="max-w-2xl">
                     <h2 className="text-2xl font-bold text-slate-900 mb-2">Accessibility</h2>
                     <p className="text-slate-500 text-sm mb-8">Adjust the UI to ensure everyone can navigate seamlessly.</p>

                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Visual Enhancements</h3>
                     <div className="space-y-4">
                        <Toggle label="High Contrast Mode" desc="Increase screen contrast significantly for charts and datatables." defaultChecked={false} />
                        <Toggle label="Screen Reader Support" desc="Add ARIA labels intelligently across all dynamic React components." defaultChecked={true} />
                        <Toggle label="Keyboard Navigation Mode" desc="Highlight focused interactive elements clearly using an orange ring." defaultChecked={true} />
                        <SelectMenu label="Motion & Animation" options={["Reduced Motion (Static)", "Full Modern Animations"]} />
                     </div>
                  </div>
               )}

               {activeTab === 'support' && (
                  <div className="max-w-2xl">
                     <h2 className="text-2xl font-bold text-slate-900 mb-2">Help & Support</h2>
                     <p className="text-slate-500 text-sm mb-8">Access documentation, submit a ticket, or speak to support.</p>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center shadow-sm cursor-pointer hover:shadow-md transition">
                           <HelpCircle className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
                           <h4 className="font-bold text-indigo-900">Knowledge Base</h4>
                           <p className="text-indigo-700 text-xs mt-1">Read tutorials and guides.</p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm cursor-pointer hover:border-indigo-300 transition">
                           <Search className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                           <h4 className="font-bold text-slate-800">Frequently Asked Questions</h4>
                           <p className="text-slate-500 text-xs mt-1">Solve common issues instantly.</p>
                        </div>
                     </div>

                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Direct Contact</h3>
                     <div className="space-y-3">
                        <ButtonAction label="Report a Bug or Issue" />
                        <ButtonAction label="Start Live Support Chat" />
                     </div>
                  </div>
               )}

             </div>
           </div>
        </div>
      </main>
    </div>
  )
}
