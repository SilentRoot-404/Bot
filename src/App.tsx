import React, { useState, useEffect } from 'react';
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
  Activity,
  LayoutDashboard,
  Globe,
  Database,
  Play,
  RotateCcw,
  Check,
  X,
  History,
  TrendingUp,
  Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Reusable Components
const Card = ({ children, className = "", title, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, icon?: any }) => (
  <div className={cn("bg-[#121212] border border-zinc-800/50 rounded-xl overflow-hidden", className)}>
    {title && (
      <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-emerald-500" />}
          {title}
        </h3>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'danger' | 'warning' }) => {
  const variants = {
    default: 'bg-zinc-800 text-zinc-400',
    success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest", variants[variant])}>
      {children}
    </span>
  );
};

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'leagues' | 'history' | 'settings'>('dashboard');
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, history: [] });
  const [leagues, setLeagues] = useState<any[]>([]);
  const [isTriggering, setIsTriggering] = useState(false);
  const [testStatus, setTestStatus] = useState<{ msg: string, type: 'success' | 'error' | null }>({ msg: '', type: null });

  // Data Fetching
  const fetchData = async () => {
    try {
      const statsRes = await fetch('/api/stats');
      const leaguesRes = await fetch('/api/leagues');
      const logsRes = await fetch('/api/logs');
      
      setStats(await statsRes.json());
      setLeagues(await leaguesRes.json());
      setLogs(await logsRes.json());
    } catch (e) {
      console.error("Fetch error", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleLeague = async (id: number) => {
    try {
      const res = await fetch('/api/leagues/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) setLeagues(data.leagues);
    } catch (e) { console.error(e); }
  };

  const triggerAnalysis = async () => {
    setIsTriggering(true);
    try {
      const res = await fetch('/api/trigger', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLogs(prev => [...prev, "Analysis cycle triggered..."]);
      }
    } catch (e) { console.error(e); }
    setTimeout(() => setIsTriggering(false), 2000);
  };

  const sendTest = async () => {
    setTestStatus({ msg: 'Sending...', type: null });
    try {
      const res = await fetch('/api/send-test', { method: 'POST' });
      const data = await res.json();
      setTestStatus({ msg: data.message, type: data.success ? 'success' : 'error' });
    } catch (e) {
      setTestStatus({ msg: 'Server error', type: 'error' });
    }
  };

  const winRate = stats.wins + stats.losses > 0 
    ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) 
    : 0;

  const chartData = [
    { name: 'Wins', value: stats.wins, color: '#10b981' },
    { name: 'Losses', value: stats.losses, color: '#ef4444' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800/50 bg-[#0d0d0d] hidden lg:flex flex-col">
        <div className="p-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-emerald-500" />
            <span className="font-bold text-lg tracking-tight">BETTING<span className="text-emerald-500">AI</span></span>
          </div>
        </div>
        
        <nav className="p-4 flex-1 space-y-1">
          {[
            { id: 'dashboard', label: 'Terminal Control', icon: LayoutDashboard },
            { id: 'leagues', label: 'Global Leagues', icon: Globe },
            { id: 'history', label: 'Prediction History', icon: History },
            { id: 'settings', label: 'System Setup', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                activeView === item.id 
                  ? "bg-emerald-500/10 text-emerald-500" 
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800/50">
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Bot Status</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            </div>
            <div className="text-xs text-zinc-400">Version 2.0.5 Global</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top bar */}
        <header className="h-16 border-b border-zinc-800/50 bg-[#0d0d0d] px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-zinc-500">Server Time:</span>
            <span className="text-zinc-300 font-mono italic">{new Date().toLocaleTimeString()}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              className="p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button 
              onClick={triggerAnalysis}
              disabled={isTriggering}
              className="px-4 py-1.5 bg-emerald-500 text-black text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-current" />
              {isTriggering ? 'RUNNING...' : 'START CYCLE'}
            </button>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Calculated Win Rate', value: `${winRate}%`, icon: Percent, color: 'text-emerald-500' },
                    { label: 'Total Predictions', value: stats.wins + stats.losses, icon: Database, color: 'text-blue-500' },
                    { label: 'Success (WIN)', value: stats.wins, icon: Check, color: 'text-emerald-500' },
                    { label: 'Failed (LOSS)', value: stats.losses, icon: X, color: 'text-red-500' },
                  ].map((stat, i) => (
                    <Card key={i} className="relative group">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</div>
                          <div className={cn("text-3xl font-bold tracking-tight mb-2", stat.color)}>{stat.value}</div>
                        </div>
                        <div className="p-2 bg-zinc-800/50 rounded-lg">
                          <stat.icon className={cn("w-5 h-5", stat.color)} />
                        </div>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full mt-4 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: stat.label.includes('Rate') ? `${winRate}%` : '100%' }}
                          className={cn("h-full", stat.color.replace('text-', 'bg-'))}
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Chart and Activity */}
                  <Card title="Performance Analytics" icon={TrendingUp} className="lg:col-span-1">
                    <div className="h-[240px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                      {chartData.map(item => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-zinc-400 font-medium">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Console Log */}
                  <Card title="Real-Time Terminal" icon={Terminal} className="lg:col-span-2">
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-[11px] leading-relaxed h-[300px] overflow-y-auto border border-zinc-800/50">
                      {logs.map((log, i) => (
                        <div key={i} className="mb-1 flex gap-3">
                          <span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span>
                          <span className={cn(
                            log.includes('SUCCESS') ? 'text-emerald-500' : 
                            log.includes('INFO') ? 'text-zinc-500' : 
                            log.includes('ERROR') ? 'text-red-500' : 'text-zinc-400'
                          )}>
                            {log}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center gap-1 text-zinc-700 animate-pulse mt-1">
                        <span className="w-1.5 h-3 bg-emerald-500/50" />
                        <span>LISTENING FOR EVENTS_</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeView === 'leagues' && (
              <motion.div 
                key="leagues"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {leagues.map((league) => (
                  <Card key={league.id} className="cursor-pointer hover:border-emerald-500/50 transition-colors p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                          league.active ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                        )}>
                          {league.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-sm tracking-tight">{league.name}</div>
                          <div className="text-[10px] text-zinc-500 uppercase font-mono italic">ID: {league.id}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleLeague(league.id)}
                        className={cn(
                          "w-12 h-6 rounded-full p-1 transition-all",
                          league.active ? "bg-emerald-500" : "bg-zinc-800"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full transition-all",
                          league.active ? "translate-x-6" : "translate-x-0"
                        )} />
                      </button>
                    </div>
                  </Card>
                ))}
              </motion.div>
            )}

            {activeView === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card title="Prediction Audit History" icon={History}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-zinc-500 border-b border-zinc-800/50 text-[11px] uppercase tracking-widest font-bold">
                          <th className="text-left py-4 px-4">Match Event</th>
                          <th className="text-left py-4 px-4">Prediction</th>
                          <th className="text-center py-4 px-4">Score</th>
                          <th className="text-right py-4 px-4">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/30">
                        {stats.history.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-20 text-center text-zinc-600 font-medium">No historical data found. Complete an analysis cycle first.</td>
                          </tr>
                        ) : [...stats.history].reverse().map((h: any, i) => (
                          <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                            <td className="py-4 px-4 font-medium">{h.match}</td>
                            <td className="py-4 px-4">
                              <Badge>{h.bet}</Badge>
                            </td>
                            <td className="py-4 px-4 text-center font-mono">{h.score}</td>
                            <td className="py-4 px-4 text-right">
                              <Badge variant={h.result === 'win' ? 'success' : 'danger'}>{h.result}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeView === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl"
              >
                <Card title="System Setup & Verification" icon={Settings}>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-emerald-500" />
                        Verification Panel
                      </h4>
                      <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                        Use this panel to debug your connection with Telegram and RapidAPI. Ensure your API keys are set in the environment variables panel.
                      </p>
                      
                      <button 
                        onClick={sendTest}
                        className="w-full sm:w-auto px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        Send Test Integration Message
                      </button>

                      {testStatus.msg && (
                        <div className={cn(
                          "mt-4 p-4 rounded-xl border flex items-center gap-3 text-sm",
                          testStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                        )}>
                          {testStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                          {testStatus.msg}
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-zinc-800/50">
                      <h4 className="text-sm font-bold mb-3">Model Parameters (Algorithm v2.5)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800/50">
                          <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Poisson Weight</div>
                          <div className="text-lg font-mono">0.85</div>
                        </div>
                        <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800/50">
                          <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Form Delta</div>
                          <div className="text-lg font-mono">1.12</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
