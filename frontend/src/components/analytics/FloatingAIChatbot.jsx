import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, User, ChevronUp, ChevronDown, Activity, AlertTriangle, TrendingUp, BarChart2, Mic, Copy, Check } from 'lucide-react'

// Dummy dynamic data simulation (can be replaced with real props)
const defaultContext = {
  student: "Student Group",
  internal: "Average 32",
  required_end_exam: "Varies",
  risk: "Moderate",
  weak_topics: ["SQL Joins", "Transactions"]
};

export default function FloatingAIChatbot({ contextData = defaultContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', content: "Hi! I'm your AI Teaching Assistant. I've analyzed your dashboard data. How can I help you today?", timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryOverride) => {
    const textToSend = queryOverride || inputValue;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call Backend API
      const response = await fetch('http://localhost:8000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          context: contextData
        })
      });

      let aiResponse = "I'm sorry, I couldn't process that right now.";
      if (response.ok) {
         const data = await response.json();
         aiResponse = data.response;
      } else {
         console.error("AI API Error", response.status);
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: "Error connecting to AI service. Please make sure the backend is running and reachable.",
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Button */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-spring ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}>
        <button 
          onClick={() => setIsOpen(true)}
          className="group flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-[0_8px_30px_rgb(99,102,241,0.4)] hover:shadow-[0_8px_40px_rgb(99,102,241,0.6)] hover:-translate-y-1 transition-all duration-300"
        >
          <Sparkles className="w-7 h-7 text-white group-hover:rotate-12 transition-transform duration-300" />
        </button>
      </div>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-0 sm:right-6 w-full sm:w-[400px] h-[600px] max-h-[85vh] z-50 transition-all duration-500 ease-spring transform origin-bottom-right flex flex-col bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.15)] border border-slate-100 overflow-hidden ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none translate-y-10'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 shrink-0 relative overflow-hidden flex items-center justify-between z-10">
          <div className="absolute top-0 right-0 p-2 opacity-10">
             <Sparkles className="w-20 h-20 text-white" />
          </div>
          <div className="flex items-center gap-3 relative z-10">
             <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-indigo-300" />
             </div>
             <div>
                <h3 className="font-bold text-white tracking-wide">AI Assistant</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                   <span className="text-xs text-slate-300 font-medium">Online & Analyzing</span>
                </div>
             </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-slate-700/50 text-slate-300 transition-colors z-10"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-50/50">
          {messages.map((msg) => (
             <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                   
                   {/* Avatar */}
                   <div className="shrink-0 mt-1">
                      {msg.type === 'ai' ? (
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                            <Sparkles className="w-4 h-4 text-white" />
                         </div>
                      ) : (
                         <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-600" />
                         </div>
                      )}
                   </div>

                   {/* Bubble */}
                   <div className="group relative">
                      <div className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.type === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'}`}>
                         {/* Render text with basic markdown-like bullet support */}
                         {msg.content.split('\n').map((line, i) => {
                            if (line.trim().startsWith('•') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                               return <div key={i} className="flex gap-2 my-1"><span className="text-current opacity-60">•</span><span>{line.replace(/^[-•*]\s*/, '')}</span></div>
                            }
                            if (line.match(/^\d+\./)) {
                               return <div key={i} className="font-semibold mt-2 mb-1">{line}</div>
                            }
                            return <p key={i} className={i !== 0 ? 'mt-2' : ''}>{line}</p>
                         })}
                      </div>
                      
                      <div className={`flex items-center mt-1.5 gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <span className="text-[10px] font-medium text-slate-400">{msg.timestamp}</span>
                         {msg.type === 'ai' && (
                            <button 
                               onClick={() => copyToClipboard(msg.content, msg.id)}
                               className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600 p-0.5"
                            >
                               {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                         )}
                      </div>
                   </div>

                </div>
             </div>
          ))}

          {isTyping && (
             <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4 text-white" />
                 </div>
                 <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-11">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-100 shrink-0">
           
           {/* Quick Action Pills */}
           <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto custom-scrollbar">
              <button onClick={() => handleSend("Show me at-risk students")} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-100 transition-colors">
                 <AlertTriangle className="w-3.5 h-3.5" /> At-risk students
              </button>
              <button onClick={() => handleSend("Who are the top performers?")} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-100 transition-colors">
                 <TrendingUp className="w-3.5 h-3.5" /> Top performers
              </button>
              <button onClick={() => handleSend("How can I improve class performance?")} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-100 transition-colors">
                 <Activity className="w-3.5 h-3.5" /> Improve performance
              </button>
              <button onClick={() => handleSend("Please explain the recent charts")} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors">
                 <BarChart2 className="w-3.5 h-3.5" /> Explain chart
              </button>
           </div>

           {/* Input Box */}
           <div className="p-4 pt-2">
              <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                 <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-xl hover:bg-indigo-50">
                    <Mic className="w-5 h-5" />
                 </button>
                 <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about student performance..."
                    className="flex-1 max-h-32 min-h-10 bg-transparent resize-none outline-none py-2 text-sm text-slate-700 placeholder-slate-400"
                    rows="1"
                 />
                 <button 
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim() || isTyping}
                    className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 transition-colors shadow-sm"
                 >
                    <Send className="w-4 h-4" />
                 </button>
              </div>
           </div>
           
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
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
        .ease-spring {
           transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </>
  )
}
