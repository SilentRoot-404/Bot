import React, { useState } from 'react';
import { 
  Trophy, 
  Send, 
  BarChart3, 
  Settings, 
  Clock, 
  Zap, 
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Code2,
  Terminal,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'setup' | 'logs'>('overview');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });

  const sendTestMessage = async () => {
    setLoading(true);
    setStatus({ type: null, msg: '' });
    try {
      const res = await fetch('/api/send-test', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', msg: data.message });
      } else {
        setStatus({ type: 'error', msg: data.message });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'فشل الاتصال بالخادم.' });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Trophy className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Betting<span className="text-emerald-500">Analyzer</span> AI</h1>
          </div>
          <p className="text-zinc-400">Professional Match Predictor & Telegram Bot</p>
        </div>
        
        <div className="flex gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'setup' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            Setup Guide
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'logs' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            Live Logs
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {activeTab === 'overview' && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Stats Overview */}
            <Card className="col-span-1 md:col-span-2 overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-xl font-semibold">System Capabilities</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: BarChart3, title: "Poisson Statistics", desc: "Advanced goal probability distribution" },
                    { icon: Send, title: "Auto-Telegram", desc: "Instant alerts to your channel" },
                    { icon: Clock, title: "12h Scheduling", desc: "Automated analysis cycles" },
                    { icon: Zap, title: "Value Bet Detection", desc: "Finds high prob vs odds gaps" }
                  ].map((feat, i) => (
                    <motion.div 
                      key={i}
                      variants={itemVariants}
                      className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50"
                    >
                      <feat.icon className="w-6 h-6 text-emerald-400 mb-2" />
                      <h3 className="font-medium">{feat.title}</h3>
                      <p className="text-sm text-zinc-400">{feat.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />
            </Card>

            <Card className="bg-emerald-600 border-none text-white overflow-hidden relative">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">Bot Status</h2>
                <div className="inline-flex items-center gap-2 bg-emerald-400/20 px-3 py-1 rounded-full text-sm font-medium mb-8">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Ready to Deploy
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm border-b border-white/20 pb-2">
                    <span className="opacity-80">Scripts Installed</span>
                    <span className="font-mono">analyzer.py</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/20 pb-2">
                    <span className="opacity-80">Language</span>
                    <span className="font-mono">Python 3.x</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/20 pb-2">
                    <span className="opacity-80">API Provider</span>
                    <span className="font-mono">API-Football</span>
                  </div>
                </div>
              </div>
              <Trophy className="absolute bottom-[-20px] right-[-20px] w-40 h-40 opacity-10 rotate-12" />
            </Card>

            {/* Tech Stack */}
            <Card className="md:col-span-3">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-semibold">Included Script Features</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Poisson Math', 'Schedule Lib', 'Telegram Bot API', 'H2H Analytics', 'Match Webhook', 'JSON Processing', 'Error Handling', 'Logging System'].map((tech) => (
                  <div key={tech} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {tech}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'setup' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <Card>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-500" />
                خطوات التشغيل (Arabic Guide)
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-bold text-lg">الحصول على الـ API Keys</h3>
                    <p className="text-zinc-400 mb-2">سجل في المواقع التالية لتفعيل السكربت:</p>
                    <ul className="list-disc list-inside text-zinc-400 space-y-1 ml-2">
                      <li>RapidAPI: <a href="https://rapidapi.com/api-sports/api/api-football" className="text-emerald-400 hover:underline">API-Football</a></li>
                      <li>Telegram: تواصل مع <span className="text-white font-mono">@BotFather</span> للحصول على Token</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div className="w-full">
                    <h3 className="font-bold text-lg">تحديث متغيرات البيئة</h3>
                    <p className="text-zinc-400 mb-2">افتح ملف <code className="text-emerald-400">analyzer.py</code> وقم بوضع المفاتيح في الأعلى:</p>
                    <pre className="bg-black p-4 rounded-xl border border-zinc-800 text-sm font-mono overflow-x-auto text-emerald-500">
                      {`API_KEY = "YOUR_RAPIDAPI_KEY"
TELEGRAM_TOKEN = "YOUR_TOKEN"
CHAT_ID = "YOUR_CHAT_ID"`}
                    </pre>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-bold text-lg">التشغيل على Replit / PythonAnywhere</h3>
                    <p className="text-zinc-400">ارفع ملفي <code className="text-emerald-400 font-mono">analyzer.py</code> و <code className="text-emerald-400 font-mono">requirements.txt</code>.</p>
                    <p className="text-zinc-400 mt-2">استخدم الأمر التالي في الـ Terminal:</p>
                    <code className="block bg-black p-4 rounded-xl border border-zinc-800 text-emerald-500 mt-2 font-mono">
                      pip install -r requirements.txt && python analyzer.py
                    </code>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div className="w-full">
                    <h3 className="font-bold text-lg">اختبار الربط (Testing)</h3>
                    <p className="text-zinc-400 mb-4">اضغط على الزر أدناه لإرسال رسالة تجريبية إلى قناتك للتأكد من صحة الـ Token و الـ Chat ID.</p>
                    
                    <button 
                      onClick={sendTestMessage}
                      disabled={loading}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all sm:w-auto w-full justify-center ${loading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-black active:scale-95'}`}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      إرسال رسالة تجريبية الآن
                    </button>

                    {status.msg && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}
                      >
                        {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {status.msg}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="bg-black border border-zinc-800 p-0 overflow-hidden">
              <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Bot Console View</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500/20" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
              <div className="p-6 font-mono text-sm space-y-2 max-h-[400px] overflow-y-auto">
                <div className="text-zinc-500">[2024-05-15 13:45:01] INFO: Initializing BettingAnalyzer...</div>
                <div className="text-zinc-500">[2024-05-15 13:45:02] INFO: Connecting to API-Football...</div>
                <div className="text-emerald-500">[2024-05-15 13:45:03] SUCCESS: 12 upcoming matches found.</div>
                <div className="text-zinc-400">[2024-05-15 13:45:04] INFO: Starting Poisson prediction for Manchester City vs Arsenal</div>
                <div className="text-zinc-500">...</div>
                <div className="text-amber-500">[WAIT] System waiting for API Keys to be configured in analyzer.py</div>
                <div className="flex gap-2 items-center text-zinc-600 animate-pulse">
                  <span className="w-1 h-4 bg-zinc-700 block" />
                  <span>Waiting for input_</span>
                </div>
              </div>
            </Card>
            <div className="mt-4 flex items-center gap-2 text-zinc-500 text-sm justify-center">
              <AlertCircle className="w-4 h-4" />
              This is a simulated logs view. To see actual logs, run the script on your server.
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-sm">
        <p>© 2024 AI Betting Intelligence System</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> API Documentation
          </a>
          <a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> Get Help
          </a>
        </div>
      </footer>
    </div>
  );
}
