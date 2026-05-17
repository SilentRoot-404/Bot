import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Settings, 
  Zap, 
  AlertCircle,
  CheckCircle2,
  Terminal,
  Activity,
  LayoutDashboard,
  Play,
  RotateCcw,
  Check,
  X,
  History,
  TrendingUp,
  Percent,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  Bot
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

const NeonBadge = ({ children, variant = 'emerald' }: { children: React.ReactNode, variant?: 'emerald' | 'red' | 'zinc' | 'blue' }) => {
  const styles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 neon-glow-emerald',
    red: 'bg-red-500/10 text-red-500 border-red-500/20 neon-glow-red',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 neon-glow-blue',
    zinc: 'bg-zinc-800 text-zinc-400 border-zinc-700'
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", styles[variant])}>
      {children}
    </span>
  );
};

interface TradingResult {
  symbol: string;
  signal: 'CALL' | 'PUT';
  entry_price: number;
  close_price?: number;
  time: string;
  result: 'WIN' | 'LOSS' | 'REFUND' | 'Pending...';
}

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'history' | 'setup'>('dashboard');
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<TradingResult[]>([]);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      const resultsRes = await fetch('/api/results');
      if (resultsRes.ok) {
        const data = await resultsRes.json();
        setResults(Array.isArray(data) ? data : []);
      }

      const statusRes = await fetch('/api/status');
      if (statusRes.ok) {
        const status = await statusRes.json();
        setIsBotRunning(status.running);
      }

      const logsRes = await fetch('/api/logs');
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(Array.isArray(logsData) ? logsData : []);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const restartBot = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/restart', { method: 'POST' });
      setLogs(prev => [...prev, `${new Date().toISOString()} - [SYSTEM] Bot restart triggered...`]);
    } catch (e) {}
    setTimeout(() => setIsLoading(false), 2000);
  };

  const sendTest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/send-test', { method: 'POST' });
      const data = await res.json();
      alert(data.message);
    } catch (e) {
      alert("Failed to send test message");
    }
    setIsLoading(false);
  };

  const wins = results.filter(r => r.result === 'WIN').length;
  const losses = results.filter(r => r.result === 'LOSS').length;
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  const chartData = [
    { name: 'Wins', value: wins || 1, color: '#10b981' },
    { name: 'Losses', value: losses || (wins === 0 ? 1 : 0), color: '#ff3366' }
  ];

  const recentPrices = [
    { pair: "EUR/USD", change: "+0.02%", up: true },
    { pair: "GBP/USD", change: "-0.05%", up: false },
    { pair: "AUD/USD", change: "+0.11%", up: true },
    { pair: "USD/JPY", change: "+0.08%", up: true },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      {/* Top Banner Ticker */}
      <div className="h-10 bg-zinc-950 border-b border-white/5 flex items-center overflow-hidden whitespace-nowrap sticky top-0 z-50">
        <div className="flex items-center gap-8 animate-[marquee_30s_linear_infinite] px-8">
          {recentPrices.concat(recentPrices).map((m, i) => (
            <div key={i} className="flex items-center gap-4 text-[11px] font-mono">
              <span className="text-zinc-500">Live</span>
              <span className="text-zinc-300 font-bold uppercase tracking-tight">{m.pair}</span>
              <span className={cn("font-black", m.up ? "text-emerald-400" : "text-red-500")}>{m.change}</span>
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
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center neon-glow-blue">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div className="font-black text-lg tracking-tighter italic">TRADING<span className="text-blue-500">BOT</span></div>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Analytics' },
              { id: 'history', icon: History, label: 'Trade Log' },
              { id: 'setup', icon: Settings, label: 'Control' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group",
                  activeView === item.id 
                    ? "bg-white/5 border border-white/10 text-blue-400" 
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
                <span>Bot Status</span>
                <span className={isBotRunning ? "text-emerald-500" : "text-red-500"}>
                  {isBotRunning ? "Active" : "Offline"}
                </span>
              </div>
              <div className="w-full bg-zinc-910 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                   animate={{ width: isBotRunning ? '100%' : '10%' }} 
                   className={cn("h-full transition-all", isBotRunning ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500")} 
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto space-y-10">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-[0.3em] mb-2">
                <Activity className="w-4 h-4" />
                Real-time Analysis Engine
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                Binary Options <span className="text-zinc-500">Automator</span>
              </h1>
              <p className="text-zinc-500 font-medium">Fully automated trading bot using EMA Cross & Stochastic signals.</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={restartBot} 
                disabled={isLoading} 
                className="px-6 py-3 bg-blue-500 text-black rounded-2xl font-black text-sm tracking-tighter flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 neon-glow-blue"
              >
                {isLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                RESTART BOT
              </button>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div 
                key="dash" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: "Win Rate", value: `${winRate}%`, icon: Percent, color: "text-emerald-400" },
                    { label: "Successful Trades", value: wins, icon: CheckCircle2, color: "text-emerald-400" },
                    { label: "Failed Trades", value: losses, icon: AlertCircle, color: "text-red-500" },
                    { label: "Total signals", value: results.length, icon: Bot, color: "text-blue-400" },
                  ].map((s, i) => (
                    <div key={i}>
                      <GlassCard className="hover:bg-white/5 border-white/5">
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-zinc-900 rounded-xl">
                            <s.icon className={cn("w-6 h-6", s.color)} />
                          </div>
                          <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{s.label}</div>
                        </div>
                        <div className={cn("text-3xl font-black tracking-tighter", s.color)}>{s.value}</div>
                      </GlassCard>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Recent Signals */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                       <Clock className="w-4 h-4 text-emerald-400" />
                       Live signal Feed
                    </h3>
                    <div className="space-y-4">
                      {results.slice(0, 5).map((r, i) => (
                        <div key={i} className="glass p-5 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-all border-white/5">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center font-black",
                              r.signal === 'CALL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                            )}>
                              {r.signal === 'CALL' ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />}
                            </div>
                            <div>
                               <div className="font-black text-sm uppercase tracking-tight">{r.symbol} <span className="text-zinc-600">M1</span></div>
                               <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{r.time}</div>
                            </div>
                          </div>
                          <div className="text-right">
                             <div className="font-mono text-xs text-zinc-300">Price: {r.entry_price.toFixed(5)}</div>
                             <NeonBadge variant={r.result === 'WIN' ? 'emerald' : r.result === 'LOSS' ? 'red' : 'blue'}>
                               {r.result}
                             </NeonBadge>
                          </div>
                        </div>
                      ))}
                      {results.length === 0 && (
                        <div className="p-10 text-center glass rounded-2xl border-dashed border-white/5">
                           <p className="text-zinc-600 text-sm font-medium">Waiting for signals...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Accuracy & Logs */}
                  <div className="space-y-8">
                     <GlassCard title="Accuracy Distro" icon={TrendingUp}>
                       <div className="h-[200px] w-full mt-4">
                         <ResponsiveContainer>
                           <PieChart>
                             <Pie
                               data={chartData}
                               cx="50%"
                               cy="50%"
                               innerRadius={55}
                               outerRadius={75}
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
                       <div className="flex justify-center gap-8 mt-4">
                         <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 neon-glow-emerald" /> Win {winRate}%
                         </div>
                         <div className="flex items-center gap-2 text-xs font-bold text-red-500">
                           <div className="w-2 h-2 rounded-full bg-red-500 neon-glow-red" /> Loss {100 - winRate}%
                         </div>
                       </div>
                     </GlassCard>

                     <GlassCard title="System Console" icon={Terminal}>
                        <div className="bg-[#020202] rounded-xl p-4 font-mono text-[10px] h-[180px] overflow-y-auto border border-white/5 space-y-1 scrollbar-hide">
                          {logs.map((log, i) => (
                            <div key={i} className="flex gap-3 border-l border-white/5 pl-3 py-0.5">
                              <span className="text-zinc-700 font-bold shrink-0">{i.toString().padStart(2, '0')}</span>
                              <span className={cn(
                                log.includes('✅') ? 'text-emerald-400' : 
                                log.includes('🚀') ? 'text-blue-400' :
                                log.includes('ERROR') ? 'text-red-400' : 'text-zinc-500'
                              )}>
                                {log}
                              </span>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 text-blue-500/50 animate-pulse pt-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span>ENGINE_SCANNING_MARKET_TICKERS...</span>
                          </div>
                        </div>
                     </GlassCard>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'history' && (
              <motion.div key="hist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <GlassCard title="Full Trading History" icon={History}>
                   <div className="space-y-3">
                     {results.map((r, i) => (
                       <div key={i} className="glass p-4 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-all">
                         <div className="flex items-center gap-5">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-black",
                              r.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-500' : r.result === 'LOSS' ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 text-zinc-500'
                            )}>
                              {r.result === 'WIN' ? <Check className="w-5 h-5" /> : r.result === 'LOSS' ? <X className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="font-black tracking-tight text-sm uppercase">{r.symbol} <span className="text-blue-400 ml-2">{r.signal}</span></div>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-[10px] text-zinc-600 font-bold tracking-widest">{r.time}</span>
                                <span className="text-[10px] text-zinc-400 font-mono">Entry: {r.entry_price.toFixed(5)}</span>
                              </div>
                            </div>
                         </div>
                         <div className="text-right">
                           {r.close_price && (
                             <div className="text-[10px] font-mono text-zinc-500 mb-1">Close: {r.close_price.toFixed(5)}</div>
                           )}
                           <NeonBadge variant={r.result === 'WIN' ? 'emerald' : r.result === 'LOSS' ? 'red' : 'blue'}>
                             {r.result}
                           </NeonBadge>
                         </div>
                       </div>
                     ))}
                     {results.length === 0 && (
                       <div className="p-20 text-center">
                          <Bot className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                          <p className="text-zinc-500 font-medium">No trading history recorded yet.</p>
                       </div>
                     )}
                   </div>
                </GlassCard>
              </motion.div>
            )}

            {activeView === 'setup' && (
              <motion.div key="ctrl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <GlassCard title="System Diagnostics" icon={Settings}>
                    <p className="text-sm text-zinc-500 mb-8 font-medium">Verify your telegram connection and bot environment configuration.</p>
                    <div className="space-y-4">
                      <button 
                         onClick={sendTest}
                         disabled={isLoading}
                         className="w-full p-4 glass rounded-2xl flex items-center justify-between text-sm font-bold group hover:border-emerald-500/50 transition-all border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <Send className="w-5 h-5 text-emerald-500" />
                          Send Test Message
                        </div>
                        <span className="text-emerald-500 font-black">RUN TEST</span>
                      </button>
                      <div className="w-full p-4 glass rounded-2xl flex items-center justify-between text-sm font-bold border-white/5">
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-blue-500" />
                          Market Data API (yfinance)
                        </div>
                        <span className="text-emerald-500 font-black">READY</span>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard title="Runtime Status" icon={Bot}>
                    <div className="space-y-4">
                      <div className="p-6 bg-zinc-900/50 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Autonomous Core</span>
                          <NeonBadge variant={isBotRunning ? "emerald" : "red"}>
                            {isBotRunning ? "Running" : "Stopped"}
                          </NeonBadge>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className={cn(
                             "w-12 h-12 rounded-full flex items-center justify-center font-black text-black transition-all",
                             isBotRunning ? "bg-emerald-500 neon-glow-emerald" : "bg-zinc-800 text-zinc-500"
                           )}>
                             {isBotRunning ? "ON" : "OFF"}
                           </div>
                           <p className="text-[10px] font-medium text-zinc-500 italic max-w-[150px]">
                             The core analysis engine is {isBotRunning ? "monitoring" : "waiting for start"}.
                           </p>
                        </div>
                      </div>
                      <button 
                        onClick={restartBot}
                        disabled={isLoading}
                        className="w-full py-4 bg-zinc-900 border border-white/5 rounded-2xl font-black text-sm uppercase tracking-tighter hover:bg-zinc-800 transition-all"
                      >
                        Force Engine Cold-Restart
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
        .neon-glow-emerald { box-shadow: 0 0 15px rgba(16, 185, 129, 0.3); }
        .neon-glow-blue { box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
        .neon-glow-red { box-shadow: 0 0 15px rgba(239, 68, 68, 0.3); }
        .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); }
      `}</style>
    </div>
  );
}
