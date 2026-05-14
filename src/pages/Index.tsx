import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Brain, Zap, Users, BarChart3, ChevronRight, ArrowRight, LayoutDashboard, Cpu } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import AgentModal from "@/components/AgentModal";
import ActivityFeed from "@/components/ActivityFeed";
import MultiAgentView from "@/components/MultiAgentView";
import WalletGate from "@/components/WalletGate";
import WalletButton from "@/components/WalletButton";
import Dashboard from "@/components/Dashboard";
import { Switch } from "@/components/ui/switch";

interface Message { role: "user" | "assistant"; content: string; }

const agents = [
  {
    name: "Crypto Analyst",
    description: "Analyze wallets, tokens, and on-chain data. Factual, sourced, zero hype.",
    prompt: `You are a senior crypto analyst. Your core rule: NEVER invent facts, tokenomics, TVL, partnerships, or protocol features. Only use information explicitly provided by the user or extracted from URLs they share. If a detail is unclear, say: "The source does not explicitly mention this." Format responses as structured reports with clear sections: ## Overview, ## Key Findings, ## Risk Assessment, ## Opportunities, ## Conclusion. Be factual, precise, and analytical.`,
  },
  {
    name: "Content Engine",
    description: "Generate high-performing X threads, posts, and blog content.",
    prompt: `You are a top-tier content strategist. Write sharp, high-signal X threads and content. Never use generic crypto buzzwords. Only reference facts the user provides. Format as structured threads: bold hook prefixed with 🧵, numbered tweets (1/, 2/, etc.), strong CTA. Keep each tweet under 280 chars. Separate with ---`,
  },
  {
    name: "Game Builder",
    description: "Generate and instantly run browser games from a single prompt.",
    prompt: `You are an expert game developer. Return a complete runnable HTML file with inline CSS and JS. Modern UI with gradients, smooth animations. Include score tracking, start/restart buttons. FIRST: complete HTML code wrapped in \`\`\`html. THEN: brief explanation. No external libraries.`,
  },
  {
    name: "Research Agent",
    description: "Deep research on any topic — structured, sourced, and reliable.",
    prompt: `You are a senior research analyst. Core rule: NEVER invent facts. Only use information the user provides or from URLs they share. Format: ## Executive Summary, ## Background, ## Key Findings, ## Implications, ## Caveats. If you're uncertain, say so explicitly. No speculation. No buzzwords.`,
  },
  {
    name: "Quiz Builder",
    description: "Turn any topic into a beautiful interactive quiz game instantly.",
    prompt: `You are an educational game designer. Create a complete playable HTML quiz. Requirements: 5-8 multiple choice questions, green/red feedback, score tracking, results screen, restart button, modern polished UI with gradients. Return ONLY complete HTML wrapped in \`\`\`html, then a brief explanation. Inline CSS/JS only.`,
  },
  {
    name: "Debate Agent",
    description: "Explore any topic from both sides with structured, sharp arguments.",
    prompt: `You are a master debater. Present both sides with equal rigor. Structure: ## PROPOSITION, ## OPPOSITION, ## KEY TENSIONS, ## VERDICT. Be intellectual, direct, slightly provocative. Commit to clear arguments on each side.`,
  },
];

const stats = [
  { label: "Agents Live", value: "6", icon: <Users className="w-4 h-4" />, color: "text-purple-400" },
  { label: "Tasks Executed", value: "2,847", icon: <Zap className="w-4 h-4" />, color: "text-blue-400" },
  { label: "Outputs Generated", value: "1,204", icon: <BarChart3 className="w-4 h-4" />, color: "text-emerald-400" },
];

const roadmap = [
  { phase: "Phase 2", title: "Agent Identity", desc: "Each agent gets a verifiable on-chain identity on Rialo. Persistent, trustless, yours.", icon: "🪪", color: "border-purple-500/20 bg-purple-500/5" },
  { phase: "Phase 3", title: "Reputation System", desc: "Agents earn on-chain reputation scores based on output quality via Rialo's infrastructure.", icon: "⭐", color: "border-blue-500/20 bg-blue-500/5" },
  { phase: "Phase 4", title: "Agent Marketplace", desc: "Deploy custom agents. Monetize via RLO. Coordinate via Rialo's SCALE protocol.", icon: "🏪", color: "border-emerald-500/20 bg-emerald-500/5" },
];

type Tab = "workspace" | "dashboard";

const Index = () => {
  const [selectedAgent, setSelectedAgent] = useState<typeof agents[0] | null>(null);
  const [memories, setMemories] = useState<Record<string, Message[]>>({});
  const [multiMode, setMultiMode] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("workspace");
  const [runHistory, setRunHistory] = useState<{ agent: string; prompt: string; timestamp: number; outputType: string }[]>([]);
  const [totalRuns, setTotalRuns] = useState(0);

  const currentHistory = selectedAgent ? (memories[selectedAgent.name] || []) : [];

  const handleUpdateHistory = useCallback((messages: Message[]) => {
    if (!selectedAgent) return;
    setMemories(prev => ({ ...prev, [selectedAgent.name]: messages }));
    const lastUser = messages.filter(m => m.role === "user").slice(-1)[0];
    if (lastUser) {
      const outputType =
        selectedAgent.name === "Game Builder" ? "Interactive Game" :
        selectedAgent.name === "Quiz Builder" ? "Quiz Game" :
        selectedAgent.name === "Content Engine" ? "X Thread" :
        selectedAgent.name === "Research Agent" ? "Research Brief" :
        selectedAgent.name === "Debate Agent" ? "Debate" : "Analysis Report";
      setRunHistory(prev => [{ agent: selectedAgent.name, prompt: lastUser.content.slice(0, 60), timestamp: Date.now(), outputType }, ...prev].slice(0, 20));
      setTotalRuns(prev => prev + 1);
    }
  }, [selectedAgent]);

  return (
    <WalletGate>
      <div className="min-h-screen flex flex-col">

        {/* Header */}
        <header className="px-6 md:px-12 py-4 flex items-center justify-between max-w-[1280px] mx-auto w-full border-b border-white/5 sticky top-0 z-40 bg-[#0a0b0f]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center" style={{ boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white tracking-tight">RialAI</span>
            <span className="text-white/20 text-sm mx-1">×</span>
            <span className="text-sm font-display font-medium text-white/40">Rialo</span>
          </div>

          {/* Nav tabs */}
          <div className="flex items-center gap-1 bg-white/4 rounded-xl p-1 border border-white/6">
            <button
              onClick={() => setActiveTab("workspace")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                activeTab === "workspace"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Workspace
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                activeTab === "dashboard"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>
          </div>

          <div className="flex items-center gap-5">
            {activeTab === "workspace" && (
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-white/30 font-mono">Single</span>
                <Switch checked={multiMode} onCheckedChange={setMultiMode} />
                <span className="text-xs text-white/30 font-mono">Multi</span>
              </div>
            )}
            <WalletButton />
          </div>
        </header>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-10"
          >
            <Dashboard runHistory={runHistory} totalRuns={totalRuns} />
          </motion.div>
        )}

        {/* Workspace Tab */}
        {activeTab === "workspace" && (
          <motion.div key="workspace" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Hero */}
            <section className="px-6 md:px-12 pt-20 pb-14 max-w-[760px] mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 text-xs font-mono text-purple-400 bg-purple-500/8 border border-purple-500/15 px-3.5 py-1.5 rounded-full mb-7">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Powered by Rialo Agent Infrastructure
                </div>
                <h1 className="text-5xl md:text-6xl font-display font-bold leading-[1.08] mb-6 tracking-tight">
                  <span className="text-white">AI That</span>
                  <br />
                  <span className="gradient-text">Actually Executes</span>
                </h1>
                <p className="text-lg text-white/45 max-w-[520px] mx-auto leading-relaxed mb-8">
                  Six specialized agents. One workspace. Real outputs — not just answers.
                  The consumer layer of the Rialo agent economy.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setMultiMode(false)}
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-purple-500 transition-all"
                    style={{ boxShadow: '0 0 30px rgba(124,58,237,0.3)' }}
                  >
                    Start Executing <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMultiMode(true)}
                    className="inline-flex items-center gap-2 text-white/60 border border-white/10 px-6 py-3 rounded-xl text-sm font-medium hover:border-white/20 hover:text-white/80 transition-all"
                  >
                    Multi-Agent Mode <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </section>

            {/* Stats */}
            <section className="px-6 md:px-12 max-w-[1100px] mx-auto w-full mb-10">
              <div className="grid grid-cols-3 gap-4">
                {stats.map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass rounded-xl px-5 py-4 flex items-center gap-3">
                    <div className={s.color}>{s.icon}</div>
                    <div>
                      <p className="text-2xl font-display font-bold text-white">{s.value}</p>
                      <p className="text-xs text-white/40 font-mono">{s.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {multiMode ? (
              <MultiAgentView agents={agents} />
            ) : (
              <>
                <section className="px-6 md:px-12 max-w-[1100px] mx-auto w-full">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs font-mono text-white/30 uppercase tracking-widest">Available Agents</h2>
                    <span className="text-xs font-mono text-white/20">6 agents · 1 workspace</span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-5">
                    {agents.map((agent, i) => (
                      <AgentCard key={agent.name} agent={agent} index={i} onSelect={setSelectedAgent} isActive={selectedAgent?.name === agent.name} />
                    ))}
                  </div>
                </section>

                <div className="text-center mt-10 mb-14">
                  <p className="text-xs text-white/15 font-mono tracking-widest uppercase">One input. Six agents. Real execution.</p>
                </div>

                <section className="px-6 md:px-12 max-w-[1100px] mx-auto w-full mb-10">
                  <ActivityFeed />
                </section>

                <section className="px-6 md:px-12 max-w-[1100px] mx-auto w-full mb-24">
                  <div className="glass rounded-2xl p-8 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                      <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">Rialo Integration Roadmap</span>
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">What's Coming on Rialo</h2>
                    <p className="text-white/40 text-sm mb-8 max-w-lg">RialAI is building toward full integration with Rialo's agent economy infrastructure.</p>
                    <div className="grid md:grid-cols-3 gap-4">
                      {roadmap.map((item) => (
                        <div key={item.title} className={`rounded-xl p-5 border ${item.color}`}>
                          <div className="text-2xl mb-3">{item.icon}</div>
                          <div className="text-[10px] font-mono text-white/30 mb-1 uppercase tracking-wider">{item.phase}</div>
                          <h3 className="font-display font-semibold text-white mb-2 text-sm">{item.title}</h3>
                          <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <AgentModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} conversationHistory={currentHistory} onUpdateHistory={handleUpdateHistory} />
              </>
            )}
          </motion.div>
        )}

        <footer className="mt-auto py-8 border-t border-white/5 text-center">
          <p className="text-xs text-white/15 font-mono tracking-widest">RIALAI · BUILT ON RIALO · AI AGENT EXECUTION PLATFORM</p>
        </footer>
      </div>
    </WalletGate>
  );
};

export default Index;
