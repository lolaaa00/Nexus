import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Zap, ArrowRight, Sparkles, ChevronRight } from "lucide-react";
import WalletGate from "@/components/WalletGate";
import WalletButton from "@/components/WalletButton";
import OrchestrationView from "@/components/OrchestrationView";
import { buildPlan, OrchestrationPlan } from "@/lib/orchestrator";

const EXAMPLES = [
  "Research Solana and create content about it",
  "What is the Rialo agent economy?",
  "Build a quiz about how AI agents work",
  "Debate: centralized vs decentralized AI",
  "Explain DeFi and make it fun to learn",
  "Analyze the AI agent economy thesis",
];

const HOW_IT_WORKS = [
  { n: "01", title: "Describe your goal", desc: "Type anything in plain English. No commands, no config.", icon: "💭" },
  { n: "02", title: "Orchestrator plans", desc: "An AI Orchestrator breaks your goal into tasks and hires specialist agents.", icon: "🎯" },
  { n: "03", title: "Agents coordinate", desc: "Each agent completes its task and passes the result to the next — like a relay.", icon: "⚡" },
  { n: "04", title: "Results delivered", desc: "Get research, threads, games, and analysis — all from one sentence.", icon: "✦" },
];

export default function Index() {
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState<OrchestrationPlan | null>(null);
  const [running, setRunning] = useState(false);

  const handleStart = () => {
    if (!goal.trim()) return;
    setPlan(buildPlan(goal.trim()));
    setRunning(true);
  };

  const handleReset = () => { setPlan(null); setRunning(false); setGoal(""); };

  return (
    <WalletGate>
      <div className="min-h-screen flex flex-col">

        {/* Header */}
        <header className="px-6 md:px-16 py-5 flex items-center justify-between max-w-[1360px] mx-auto w-full sticky top-0 z-40 border-b" style={{ background: 'rgba(17,16,9,0.85)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center rose-glow" style={{ background: '#82586d' }}>
              <Network className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-display font-bold tracking-tight" style={{ color: '#e8e2d5' }}>NEXUS</span>
              <span style={{ color: 'rgba(209,204,191,0.2)' }}>×</span>
              <span className="text-sm font-display font-medium" style={{ color: 'rgba(209,204,191,0.4)' }}>Rialo</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 tag glass-rose" style={{ color: '#82586d' }}>
              <span className="w-1.5 h-1.5 rounded-full soft-pulse" style={{ background: '#82586d' }} />
              Network Live
            </div>
            <WalletButton />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!running ? (
            <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="flex-1">

              {/* Hero */}
              <section className="px-6 md:px-16 pt-24 pb-16 max-w-[900px] mx-auto text-center">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}>
                  <div className="inline-flex items-center gap-2 tag glass-rose mb-8" style={{ color: '#82586d' }}>
                    <Sparkles className="w-3 h-3" />
                    Powered by Rialo SCALE Protocol
                  </div>

                  <h1 className="font-display font-bold leading-[1.04] mb-7 tracking-tight" style={{ fontSize: 'clamp(44px,6vw,80px)', color: '#e8e2d5' }}>
                    Describe a goal.
                    <br />
                    <span className="gradient-text">Agents do the rest.</span>
                  </h1>

                  <p className="text-lg leading-relaxed mb-4 max-w-[560px] mx-auto" style={{ color: 'rgba(209,204,191,0.5)' }}>
                    The first AI agent economy. One sentence becomes a network of specialized agents — researching, writing, building, and delivering real outputs.
                  </p>
                  <p className="text-xs font-mono mb-14" style={{ color: 'rgba(209,204,191,0.2)', letterSpacing: '0.12em' }}>
                    AGENT COORDINATION · RIALO INFRASTRUCTURE · SIMULATED RLO PAYMENTS
                  </p>

                  {/* Input */}
                  <div className="max-w-[680px] mx-auto mb-5">
                    <div className="rounded-2xl p-1.5 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 40px rgba(130,88,109,0.06)' }}>
                      <div className="flex gap-2">
                        <input
                          value={goal}
                          onChange={e => setGoal(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleStart()}
                          placeholder="e.g. Research Solana and create content about it"
                          className="flex-1 bg-transparent px-4 py-3.5 text-sm outline-none font-mono"
                          style={{ color: '#e8e2d5', caretColor: '#82586d' }}
                        />
                        <button
                          onClick={handleStart}
                          disabled={!goal.trim()}
                          className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all rose-glow disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ background: '#82586d', color: '#f5f0e8' }}
                        >
                          <Zap className="w-4 h-4" />
                          Deploy
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {EXAMPLES.map(eg => (
                      <button
                        key={eg}
                        onClick={() => setGoal(eg)}
                        className="text-xs font-mono px-3.5 py-2 rounded-xl transition-all hover:border-opacity-40"
                        style={{ color: 'rgba(209,204,191,0.4)', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
                        onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = '#d1ccbf'; (e.target as HTMLButtonElement).style.borderColor = 'rgba(130,88,109,0.3)'; }}
                        onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = 'rgba(209,204,191,0.4)'; (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                      >
                        {eg.length > 38 ? eg.slice(0, 38) + '…' : eg}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </section>

              {/* How it works */}
              <section className="px-6 md:px-16 max-w-[1200px] mx-auto w-full pb-20">
                <div className="text-center mb-12">
                  <p className="text-xs font-mono mb-3" style={{ color: 'rgba(209,204,191,0.25)', letterSpacing: '0.2em' }}>HOW IT WORKS</p>
                  <h2 className="text-3xl font-display font-bold" style={{ color: '#e8e2d5' }}>The Agent Economy in Action</h2>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  {HOW_IT_WORKS.map((item, i) => (
                    <motion.div
                      key={item.n}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="rounded-2xl p-6 relative overflow-hidden noise card-lift"
                      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="text-3xl mb-5">{item.icon}</div>
                      <div className="text-xs font-mono mb-2" style={{ color: '#82586d' }}>{item.n}</div>
                      <h3 className="font-display font-semibold mb-2" style={{ color: '#e8e2d5' }}>{item.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'rgba(209,204,191,0.45)' }}>{item.desc}</p>
                      {/* Corner number */}
                      <div className="absolute top-4 right-4 text-6xl font-display font-bold" style={{ color: 'rgba(255,255,255,0.015)', lineHeight: 1 }}>{item.n}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Rialo strip */}
                <div className="rounded-2xl p-7 flex flex-col md:flex-row items-center gap-6" style={{ background: 'rgba(130,88,109,0.07)', border: '1px solid rgba(130,88,109,0.15)' }}>
                  <div className="flex-1">
                    <div className="tag glass-rose inline-flex mb-3" style={{ color: '#82586d' }}>Rialo Infrastructure</div>
                    <h3 className="text-xl font-display font-bold mb-2" style={{ color: '#e8e2d5' }}>The Consumer Layer of the Rialo Agent Economy</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(209,204,191,0.45)' }}>
                      NEXUS demonstrates what Rialo's SCALE protocol enables — agent-to-agent task delegation, trustless payment escrow, on-chain identity, and autonomous execution. Today it's simulated. On Rialo mainnet, it's real.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 md:w-80 flex-shrink-0">
                    {[
                      { l: "Agent Coordination", s: "Live", c: "rgba(134,239,172,1)", bg: "rgba(134,239,172,0.08)", b: "rgba(134,239,172,0.15)" },
                      { l: "SCALE Protocol", s: "On Rialo", c: "#82586d", bg: "rgba(130,88,109,0.08)", b: "rgba(130,88,109,0.2)" },
                      { l: "RLO Payments", s: "Simulated", c: "rgba(251,191,36,1)", bg: "rgba(251,191,36,0.08)", b: "rgba(251,191,36,0.15)" },
                    ].map(item => (
                      <div key={item.l} className="rounded-xl p-3 text-center" style={{ background: item.bg, border: `1px solid ${item.b}` }}>
                        <p className="text-xs font-mono font-bold mb-0.5" style={{ color: item.c }}>{item.s}</p>
                        <p className="text-[10px] font-mono" style={{ color: 'rgba(209,204,191,0.4)' }}>{item.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

            </motion.div>
          ) : (
            <motion.div key="orch" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
              <OrchestrationView plan={plan!} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="py-6 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs font-mono" style={{ color: 'rgba(209,204,191,0.15)', letterSpacing: '0.15em' }}>
            NEXUS · AI AGENT ECONOMY · BUILT ON RIALO
          </p>
        </footer>
      </div>
    </WalletGate>
  );
}
