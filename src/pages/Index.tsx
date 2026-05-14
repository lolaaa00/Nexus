import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, ArrowRight, Sparkles, Network } from "lucide-react";
import WalletGate from "@/components/WalletGate";
import WalletButton from "@/components/WalletButton";
import OrchestrationView from "@/components/OrchestrationView";
import { buildPlan, OrchestrationPlan } from "@/lib/orchestrator";

const EXAMPLE_GOALS = [
  "Research Solana and create content about it",
  "What is the Rialo agent economy and why does it matter?",
  "Build a quiz about how AI agents work",
  "Debate: centralized vs decentralized AI",
  "Explain DeFi and make it fun to learn",
  "Research Bitcoin and write a viral thread",
];

export default function Index() {
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState<OrchestrationPlan | null>(null);
  const [running, setRunning] = useState(false);

  const handleStart = () => {
    if (!goal.trim()) return;
    const p = buildPlan(goal.trim());
    setPlan(p);
    setRunning(true);
  };

  const handleReset = () => {
    setPlan(null);
    setRunning(false);
    setGoal("");
  };

  return (
    <WalletGate>
      <div className="min-h-screen flex flex-col">

        {/* Header */}
        <header className="px-6 md:px-12 py-4 flex items-center justify-between max-w-[1280px] mx-auto w-full border-b border-white/5 sticky top-0 z-40 bg-[#08090f]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center" style={{ boxShadow: '0 0 20px rgba(124,58,237,0.5)' }}>
              <Network className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white tracking-tight">NEXUS</span>
            <span className="text-white/20 text-sm mx-1">×</span>
            <span className="text-sm font-display font-medium text-white/40">Rialo</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-green-400 bg-green-500/8 border border-green-500/15 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Agent Network Live
            </div>
            <WalletButton />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!running ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1"
            >
              {/* Hero */}
              <section className="px-6 md:px-12 pt-20 pb-10 max-w-[800px] mx-auto text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-purple-400 bg-purple-500/8 border border-purple-500/15 px-3.5 py-1.5 rounded-full mb-8">
                    <Sparkles className="w-3 h-3" />
                    Powered by Rialo SCALE Protocol
                  </div>
                  <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.05] mb-6 tracking-tight">
                    <span className="text-white">Describe a goal.</span>
                    <br />
                    <span className="gradient-text">Agents do the rest.</span>
                  </h1>
                  <p className="text-lg text-white/45 max-w-[560px] mx-auto leading-relaxed mb-4">
                    NEXUS is the first AI agent economy. You set a goal — an Orchestrator Agent spawns specialized agents, assigns tasks, passes outputs, and delivers results. Autonomously.
                  </p>
                  <p className="text-sm text-white/25 font-mono mb-12">
                    Agents coordinate via Rialo infrastructure · Simulated RLO payments · Real outputs
                  </p>

                  {/* Input */}
                  <div className="max-w-[620px] mx-auto">
                    <div className="glass rounded-2xl p-2 border border-white/8 mb-4" style={{ boxShadow: '0 0 40px rgba(124,58,237,0.08)' }}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={goal}
                          onChange={e => setGoal(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleStart()}
                          placeholder="Describe your goal... e.g. Research Solana and create content"
                          className="flex-1 bg-transparent px-4 py-3 text-white placeholder:text-white/25 text-sm outline-none font-mono"
                        />
                        <button
                          onClick={handleStart}
                          disabled={!goal.trim()}
                          className="flex items-center gap-2 bg-purple-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-purple-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
                        >
                          <Zap className="w-4 h-4" />
                          Deploy
                        </button>
                      </div>
                    </div>

                    {/* Example goals */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {EXAMPLE_GOALS.map(eg => (
                        <button
                          key={eg}
                          onClick={() => setGoal(eg)}
                          className="text-xs text-white/35 bg-white/4 border border-white/6 px-3 py-1.5 rounded-full hover:text-white/60 hover:border-white/15 transition-all font-mono"
                        >
                          {eg.length > 35 ? eg.slice(0, 35) + '...' : eg}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </section>

              {/* How it works */}
              <section className="px-6 md:px-12 max-w-[1100px] mx-auto w-full pb-20">
                <div className="text-center mb-10">
                  <p className="text-xs font-mono text-white/25 uppercase tracking-widest mb-3">How NEXUS works</p>
                  <h2 className="text-2xl font-display font-bold text-white">The Agent Economy in Action</h2>
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { step: "01", title: "You set a goal", desc: "Describe what you want in plain English. No commands, no configuration.", icon: "💭", color: "border-purple-500/20 bg-purple-500/5" },
                    { step: "02", title: "Orchestrator plans", desc: "An Orchestrator Agent breaks your goal into specialized tasks and hires agents.", icon: "🧠", color: "border-blue-500/20 bg-blue-500/5" },
                    { step: "03", title: "Agents coordinate", desc: "Each agent completes its task and passes the output to the next — like a relay.", icon: "⚡", color: "border-emerald-500/20 bg-emerald-500/5" },
                    { step: "04", title: "Results delivered", desc: "Full outputs — research, content, games, analysis — all from one sentence.", icon: "🎯", color: "border-orange-500/20 bg-orange-500/5" },
                  ].map((item) => (
                    <div key={item.step} className={`rounded-2xl p-6 border ${item.color}`}>
                      <div className="text-2xl mb-4">{item.icon}</div>
                      <div className="text-xs font-mono text-white/25 mb-1">{item.step}</div>
                      <h3 className="font-display font-semibold text-white mb-2 text-sm">{item.title}</h3>
                      <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Rialo section */}
                <div className="mt-6 glass rounded-2xl p-8 border border-purple-500/10">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-600/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-mono text-purple-400 mb-2 uppercase tracking-widest">Powered by Rialo</div>
                      <h3 className="font-display font-bold text-white text-lg mb-2">Built for the Rialo Agent Economy</h3>
                      <p className="text-white/45 text-sm leading-relaxed mb-4">
                        NEXUS is the consumer layer of Rialo's agent economy infrastructure. Today, agent coordination and output passing are live. On Rialo mainnet, each agent will have an on-chain identity, earn RLO tokens for completed tasks, and coordinate via the SCALE protocol's trustless escrow system.
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Agent Coordination", status: "Live Now", color: "text-green-400 bg-green-500/8 border-green-500/15" },
                          { label: "SCALE Protocol", status: "On Rialo", color: "text-purple-400 bg-purple-500/8 border-purple-500/15" },
                          { label: "RLO Payments", status: "Simulated", color: "text-yellow-400 bg-yellow-500/8 border-yellow-500/15" },
                        ].map(item => (
                          <div key={item.label} className={`rounded-xl px-3 py-2 border text-center ${item.color}`}>
                            <p className="text-[10px] font-mono mb-0.5">{item.status}</p>
                            <p className="text-[11px] font-mono text-white/50">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="orchestration"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              <OrchestrationView plan={plan!} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="py-6 border-t border-white/5 text-center">
          <p className="text-xs text-white/15 font-mono tracking-widest">NEXUS · AI AGENT ECONOMY · BUILT ON RIALO</p>
        </footer>
      </div>
    </WalletGate>
  );
}
