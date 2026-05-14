import { motion } from "framer-motion";
import { BarChart3, Zap, Brain, TrendingUp, Clock, CheckCircle2, Star, Users, ArrowUpRight } from "lucide-react";

interface DashboardProps {
  runHistory: { agent: string; prompt: string; timestamp: number; outputType: string }[];
  totalRuns: number;
}

const agentColors: Record<string, string> = {
  "Crypto Analyst": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Content Engine": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Game Builder": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "Research Agent": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Quiz Builder": "text-pink-400 bg-pink-500/10 border-pink-500/20",
  "Debate Agent": "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
};

const agentDots: Record<string, string> = {
  "Crypto Analyst": "bg-emerald-400",
  "Content Engine": "bg-blue-400",
  "Game Builder": "bg-orange-400",
  "Research Agent": "bg-purple-400",
  "Quiz Builder": "bg-pink-400",
  "Debate Agent": "bg-cyan-400",
};

const DEMO_HISTORY = [
  { agent: "Research Agent", prompt: "What is the Rialo agent economy?", timestamp: Date.now() - 120000, outputType: "Research Brief" },
  { agent: "Game Builder", prompt: "Build a quiz about AI agents", timestamp: Date.now() - 240000, outputType: "Interactive Game" },
  { agent: "Content Engine", prompt: "Write a thread on AI execution vs AI chat", timestamp: Date.now() - 360000, outputType: "X Thread" },
  { agent: "Debate Agent", prompt: "Should AI agents have legal identity?", timestamp: Date.now() - 480000, outputType: "Debate" },
  { agent: "Crypto Analyst", prompt: "Analyze the AI agent economy thesis", timestamp: Date.now() - 600000, outputType: "Analysis Report" },
  { agent: "Quiz Builder", prompt: "Create a Web3 fundamentals quiz", timestamp: Date.now() - 720000, outputType: "Quiz Game" },
];

const AGENT_STATS = [
  { name: "Research Agent", runs: 847, color: "text-purple-400", dot: "bg-purple-400", bar: "bg-purple-500", pct: 85 },
  { name: "Game Builder", runs: 634, color: "text-orange-400", dot: "bg-orange-400", bar: "bg-orange-500", pct: 63 },
  { name: "Content Engine", runs: 521, color: "text-blue-400", dot: "bg-blue-400", bar: "bg-blue-500", pct: 52 },
  { name: "Crypto Analyst", runs: 412, color: "text-emerald-400", dot: "bg-emerald-400", bar: "bg-emerald-500", pct: 41 },
  { name: "Debate Agent", lines: 289, runs: 289, color: "text-cyan-400", dot: "bg-cyan-400", bar: "bg-cyan-500", pct: 29 },
  { name: "Quiz Builder", runs: 144, color: "text-pink-400", dot: "bg-pink-400", bar: "bg-pink-500", pct: 14 },
];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const Dashboard = ({ runHistory, totalRuns }: DashboardProps) => {
  const allHistory = [...runHistory, ...DEMO_HISTORY].slice(0, 8);
  const total = totalRuns + 2847;

  const topStats = [
    { label: "Total Executions", value: total.toLocaleString(), icon: <Zap className="w-4 h-4" />, color: "text-purple-400", bg: "bg-purple-500/10", change: "+12% this week" },
    { label: "Agents Active", value: "6", icon: <Brain className="w-4 h-4" />, color: "text-blue-400", bg: "bg-blue-500/10", change: "All systems live" },
    { label: "Outputs Generated", value: "1,204", icon: <BarChart3 className="w-4 h-4" />, color: "text-emerald-400", bg: "bg-emerald-500/10", change: "+8% this week" },
    { label: "Avg Response Time", value: "2.4s", icon: <Clock className="w-4 h-4" />, color: "text-orange-400", bg: "bg-orange-500/10", change: "Powered by Groq" },
  ];

  return (
    <div className="px-6 md:px-12 max-w-[1100px] mx-auto w-full pb-24">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono text-white/30 uppercase tracking-widest">Agent Dashboard</span>
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-1">Workspace Overview</h2>
        <p className="text-white/40 text-sm">Real-time agent activity and execution metrics across RialAI.</p>
      </motion.div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {topStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass rounded-2xl p-5 border border-white/5"
          >
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center ${s.color} mb-4`}>
              {s.icon}
            </div>
            <p className="text-2xl font-display font-bold text-white mb-0.5">{s.value}</p>
            <p className="text-xs text-white/40 font-mono mb-2">{s.label}</p>
            <p className="text-[11px] text-white/20 font-mono">{s.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-5 gap-6 mb-6">

        {/* Agent Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-3 glass rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-display font-semibold text-white mb-0.5">Agent Usage</h3>
              <p className="text-xs text-white/30 font-mono">Executions per agent</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/25 font-mono bg-white/4 px-2.5 py-1 rounded-full border border-white/6">
              <TrendingUp className="w-3 h-3" />
              All time
            </div>
          </div>
          <div className="space-y-4">
            {AGENT_STATS.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${a.dot}`} />
                <span className="text-xs text-white/50 font-mono w-36 shrink-0">{a.name}</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${a.pct}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className={`h-full rounded-full ${a.bar}`}
                  />
                </div>
                <span className="text-xs text-white/30 font-mono w-12 text-right">{a.runs}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Rialo Status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="md:col-span-2 glass rounded-2xl p-6 border border-white/5"
        >
          <h3 className="text-sm font-display font-semibold text-white mb-1">Rialo Status</h3>
          <p className="text-xs text-white/30 font-mono mb-5">Infrastructure readiness</p>
          <div className="space-y-3">
            {[
              { label: "Agent Execution", status: "Live", color: "text-green-400", dot: "bg-green-400" },
              { label: "Multi-Agent Mode", status: "Live", color: "text-green-400", dot: "bg-green-400" },
              { label: "Groq AI Backend", status: "Live", color: "text-green-400", dot: "bg-green-400" },
              { label: "Agent Identity", status: "Phase 2", color: "text-yellow-400", dot: "bg-yellow-400" },
              { label: "Reputation System", status: "Phase 3", color: "text-orange-400", dot: "bg-orange-400" },
              { label: "Agent Marketplace", status: "Phase 4", color: "text-purple-400", dot: "bg-purple-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/4 last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                  <span className="text-xs text-white/50 font-mono">{item.label}</span>
                </div>
                <span className={`text-[10px] font-mono ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-white/5">
            
              href="https://rialo.io"
              target="_blank"
              rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors font-mono"
            >
              Learn about Rialo <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Run History */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6 border border-white/5 mb-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-display font-semibold text-white mb-0.5">Recent Executions</h3>
            <p className="text-xs text-white/30 font-mono">Latest agent runs across your workspace</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-white/25">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            All completed
          </div>
        </div>
        <div className="space-y-2">
          {allHistory.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/2 border border-white/4 hover:bg-white/4 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${agentDots[item.agent] ?? "bg-purple-400"}`} />
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${agentColors[item.agent] ?? "text-purple-400 bg-purple-500/10 border-purple-500/20"}`}>
                {item.agent}
              </span>
              <span className="text-xs text-white/50 flex-1 truncate">{item.prompt}</span>
              <span className="text-[10px] font-mono text-white/20 shrink-0 bg-white/4 px-2 py-0.5 rounded-full">
                {item.outputType}
              </span>
              <span className="text-[10px] font-mono text-white/20 shrink-0">{timeAgo(item.timestamp)}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-6 border border-purple-500/15"
      >
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-display font-semibold text-white">Coming to RialAI</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { title: "Agent Builder", desc: "Create and deploy custom agents without code. Powered by Rialo identity.", tag: "Phase 2", color: "border-purple-500/15 bg-purple-500/5" },
            { title: "Collaboration View", desc: "Watch agents coordinate in real time. Sub-agent spawning via SCALE.", tag: "Phase 3", color: "border-blue-500/15 bg-blue-500/5" },
            { title: "Agent Marketplace", desc: "Monetize your agents. Earn RLO. Hire agents from other creators.", tag: "Phase 4", color: "border-emerald-500/15 bg-emerald-500/5" },
          ].map((item) => (
            <div key={item.title} className={`rounded-xl p-4 border ${item.color}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-display font-semibold text-white">{item.title}</h4>
                <span className="text-[10px] font-mono text-white/25 bg-white/5 px-2 py-0.5 rounded-full">{item.tag}</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
