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
  Percent,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Reusable Components
const GlassCard = ({ children, className = "", title, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, icon?: any }) => (
  <div className={cn("glass rounded-2xl overflow-hidden transition-all hover:border-white/10", className)}>
    {title && (
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/2">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-emerald-400" />}
          {title}
        </h3>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

const NeonBadge = ({ children, variant = 'emerald' }: { children: React.ReactNode, variant?: 'emerald' | 'red' | 'zinc' }) => {
  const styles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 neon-glow-emerald',
    red: 'bg-red-500/10 text-red-500 border-red-500/20 neon-glow-red',
    zinc: 'bg-zinc-800 text-zinc-400 border-zinc-700'
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", styles[variant])}>
      {children}
    </span>
  );
};

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'history' | 'setup'>('dashboard');
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, history: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [tickerMatches, setTickerMatches] = useState([
    { teams: "Real Madrid vs Barcelona", score: "2-1", status: "75'" },
    { teams: "Al-Nassr vs Al-Ittihad", score: "0-0", status: "12'" },
    { teams: "Liverpool vs Man City", score: "1-1", status: "HT" },
    { teams: "Zamalek vs Al-Ahly", score: "0-2", status: "FT" },
  ]);

  const fetchData = async () => {
    try {
      const statsRes = await fetch('/api/stats');
      const logsRes = await fetch('/api/logs');
      setStats(await statsRes.json());
      setLogs(await logsRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const triggerAnalysis = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/trigger', { method: 'POST' });
      setLogs(prev => [...prev, "🚀 [SYSTEM] SportAPI Analysis Cycle Triggered..."]);
    } catch (e) {}
    setTimeout(() => setIsLoading(false), 3000);
  };

  const winRate = stats.wins + stats.losses > 0 
    ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) 
    : 0;

  const chartData = [
    { name: 'Wins', value: stats.wins || 1, color: '#10b981' },
    { name: 'Losses', value: stats.losses || 1, color: '#ff3366' }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      {/* Top Banner Ticker */}
      <div className="h-10 bg-zinc-950 border-b border-white/5 flex items-center overflow-hidden whitespace-nowrap sticky top-0 z-50">
        <div className="flex items-center gap-8 animate-[marquee_30s_linear_infinite] px-8">
          {tickerMatches.concat(tickerMatches).map((m, i) => (
            <div key={i} className="flex items-center gap-4 text-[11px] font-mono">
              <span className="text-zinc-500">{m.status}</span>
              <span className="text-zinc-300 font-bold uppercase tracking-tight">{m.teams}</span>
              <span className="text-emerald-400 font-black">{m.score}</span>
              <div className="w-1 h-1 bg-zinc-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Navigation */}
        <aside className="w-20 lg:w-64 border-r border-white/5 h-[calc(100vh-40px)] sticky top-10 hidden md:flex flex-col bg-zinc-950/20 p-4">
          <div className="p-4 mb-8 hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center neon-glow-emerald">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <div className="font-black text-lg tracking-tighter italic">SPORT<span className="text-emerald-500">API</span></div>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Analytics' },
              { id: 'history', icon: History, label: 'History' },
              { id: 'setup', icon: Settings, label: 'Control' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group",
                  activeView === item.id 
                    ? "bg-white/5 border border-white/10 text-emerald-400" 
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/2"
                )}
              >
                <item.icon className={cn("w-6 h-6", activeView === item.id && "shadow-[0_0_8px_currentColor]")} />
                <span className="hidden lg:block text-sm font-bold tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto p-4 hidden lg:block">
            <div className="glass rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                <span>AI Engine</span>
                <span className="text-emerald-500">v3.0.1</span>
              </div>
              <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                <motion.div animate={{ width: '85%' }} className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto space-y-10">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-[0.3em] mb-2">
                <Zap className="w-4 h-4 fill-current" />
                Live Network Active
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                Sport Intelligence <span className="text-zinc-500">Hub</span>
              </h1>
              <p className="text-zinc-500 font-medium">Advanced Poisson distributions powered by Sofascore SportAPI7.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={triggerAnalysis} disabled={isLoading} className="px-6 py-3 bg-emerald-500 text-black rounded-2xl font-black text-sm tracking-tighter flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 neon-glow-emerald">
                {isLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                RE-SYNC ENGINE
              </button>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div 
                key="dash" 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-10"
              >
                {/* Category Filter Bar */}
                <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  <div className="p-3 glass rounded-xl text-emerald-500">
                    <Filter className="w-5 h-5" />
                  </div>
                  {['All World', 'Europe Top 5', 'Saudi & Arab', 'Champions League', 'South America'].map((cat, i) => (
                    <button key={i} className={cn(
                      "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-tighter whitespace-nowrap transition-all border",
                      i === 0 ? "bg-emerald-500 text-black border-emerald-500 neon-glow-emerald" : "glass text-zinc-500 border-white/5 hover:border-white/20"
                    )}>
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: "Predictive Win Rate", value: `${winRate}%`, icon: Percent, color: "text-emerald-400" },
                    { label: "Successful Predictions", value: stats.wins, icon: CheckCircle2, color: "text-emerald-400" },
                    { label: "Failed Predictions", value: stats.losses, icon: AlertCircle, color: "text-red-500" },
                    { label: "Total Audited", value: stats.wins + stats.losses, icon: Database, color: "text-zinc-300" },
                  ].map((s, i) => (
                    <GlassCard key={i} className="hover:bg-white/5 border-white/5">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-zinc-900 rounded-xl">
                          <s.icon className={cn("w-6 h-6", s.color)} />
                        </div>
                        <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{s.label}</div>
                      </div>
                      <div className={cn("text-3xl font-black tracking-tighter", s.color)}>{s.value}</div>
                    </GlassCard>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Chart */}
                  <GlassCard title="Accuracy Distro" icon={TrendingUp} className="lg:col-span-1 border-white/10">
                    <div className="h-[240px] w-full mt-4">
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-8 mt-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 neon-glow-emerald" /> Win {winRate}%
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-red-500">
                        <div className="w-2 h-2 rounded-full bg-red-500 neon-glow-red" /> Loss {100 - winRate}%
                      </div>
                    </div>
                  </GlassCard>

                  {/* Log */}
                  <GlassCard title="Deep AI Reasoning" icon={Terminal} className="lg:col-span-2 border-white/5">
                    <div className="bg-[#020202] rounded-xl p-6 font-mono text-[11px] h-[300px] overflow-y-auto border border-white/5 space-y-1.5 scrollbar-hide">
                      {logs.map((log, i) => (
                        <div key={i} className="flex gap-4 border-l border-white/5 pl-4 py-0.5">
                          <span className="text-zinc-700 font-bold shrink-0">{i.toString().padStart(2, '0')}</span>
                          <span className={cn(
                            log.includes('✅') ? 'text-emerald-400 font-bold' : 
                            log.includes('🚀') ? 'text-blue-400' :
                            log.includes('🧠') ? 'text-purple-400 italic' :
                            log.includes('❌') ? 'text-red-400' : 'text-zinc-500'
                          )}>
                            {log}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 text-emerald-500/50 animate-pulse pt-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span>KERNEL_LISTENING_FOR_MATCH_WEBHOOKS...</span>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {activeView === 'history' && (
              <motion.div key="hist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <GlassCard title="Historical Intelligence" icon={History}>
                   <div className="space-y-4">
                     {[...stats.history].reverse().map((h: any, i) => (
                       <div key={i} className="glass p-5 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-all">
                         <div className="flex items-center gap-6">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center font-black",
                              h.result === 'win' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                            )}>
                              {h.result === 'win' ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                            </div>
                            <div>
                              <div className="font-black tracking-tight text-lg group-hover:text-emerald-400 transition-colors uppercase">{h.match}</div>
                              <div className="flex items-center gap-3 mt-1">
                                <NeonBadge variant={h.result === 'win' ? 'emerald' : 'red'}>{h.bet}</NeonBadge>
                                <span className="text-xs text-zinc-600 font-bold tracking-widest">{h.score} FINAL</span>
                              </div>
                            </div>
                         </div>
                         <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">SportAPI EventID: {Math.floor(Math.random()*100000)}</div>
                       </div>
                     ))}
                   </div>
                </GlassCard>
              </motion.div>
            )}

            {activeView === 'setup' && (
              <motion.div key="ctrl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <GlassCard title="Integration Secrets" icon={Settings}>
                    <p className="text-sm text-zinc-500 mb-8 font-medium">Verify your credentials and manual triggers here. API usage is tracked against RapidAPI quotas.</p>
                    <div className="space-y-4">
                      <button className="w-full p-4 glass rounded-2xl flex items-center justify-between text-sm font-bold group hover:border-emerald-500/50 transition-all">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-emerald-500" />
                          SportAPI Endpoint Status
                        </div>
                        <span className="text-emerald-500 font-black">200 OK</span>
                      </button>
                      <button className="w-full p-4 glass rounded-2xl flex items-center justify-between text-sm font-bold group hover:border-blue-500/50 transition-all">
                        <div className="flex items-center gap-3">
                          <Send className="w-5 h-5 text-blue-500" />
                          Telegram Webhook
                        </div>
                        <span className="text-blue-500 font-black">ACTIVE</span>
                      </button>
                    </div>
                  </GlassCard>

                  <GlassCard title="Bot Control Panel" icon={Zap}>
                    <div className="space-y-4">
                      <div className="p-6 bg-zinc-900/50 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Autonomous Mode</span>
                          <NeonBadge>Experimental</NeonBadge>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center font-black text-black neon-glow-emerald">ON</div>
                           <p className="text-[10px] font-medium text-zinc-500 italic max-w-[150px]">The engine is currently cycles every 6 hours automatically.</p>
                        </div>
                      </div>
                      <button className="w-full py-4 bg-zinc-900 border border-white/5 rounded-2xl font-black text-sm uppercase tracking-tighter hover:bg-zinc-800 transition-all">
                        Invalidate Local Cache
                      </button>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
