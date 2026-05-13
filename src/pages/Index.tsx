import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Zap, Users, BarChart3 } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import AgentModal from "@/components/AgentModal";
import ActivityFeed from "@/components/ActivityFeed";
import MultiAgentView from "@/components/MultiAgentView";
import WalletGate from "@/components/WalletGate";
import WalletButton from "@/components/WalletButton";
import { Switch } from "@/components/ui/switch";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const agents = [
  {
    name: "Crypto Analyst",
    description: "Analyze wallets, tokens, and on-chain trends with structured insights.",
    prompt: "You are a crypto analyst specializing in onchain trends, token analysis, and market narratives. Break down complex crypto topics into clear insights. Identify trends and narratives. Highlight risks and opportunities. Style: Clear, structured, no hype, no generic fluff, insightful and analytical. Make responses feel like a professional crypto analyst report.",
  },
  {
    name: "Content Engine",
    description: "Generate high-performing threads, posts, and content for X and blogs.",
    prompt: "You are a top-tier content strategist. Extract key insights, identify the main value proposition, and write high-quality X threads with a strong hook, clear structure, insightful points, and no fluff. Make it feel human, sharp, and high-signal.",
  },
  {
    name: "Game Builder",
    description: "Generate and instantly run browser games from a single prompt.",
    prompt: "You are an expert game developer and UI designer. Always return a complete runnable HTML file with all CSS and JavaScript inline. Use modern UI design (glassmorphism, gradients, soft shadows), smooth animations, clean typography, centered responsive layout. Add score tracking, start/restart buttons. Make gameplay smooth and intuitive. No external libraries. FIRST: full HTML code (no text before). THEN: short explanation after the code.",
  },
  {
    name: "Research Agent",
    description: "Deep research on any topic — structured, sourced, and ready to use.",
    prompt: "You are a senior research analyst. When given a topic, produce a comprehensive, structured research brief. Include: Executive Summary, Background & Context, Key Findings (with bullet points), Implications, and Further Reading suggestions. Be thorough but scannable. Use clear headers, bold key terms, and cite reasoning. No fluff, no filler — only high-signal information. Write like you're briefing a founder or investor.",
  },
  {
    name: "Quiz Builder",
    description: "Turn any topic into an interactive quiz game instantly.",
    prompt: "You are an expert educational game designer. When given a topic, create a complete, playable HTML quiz game. Requirements: 5-8 multiple choice questions about the topic, clear correct/wrong answer feedback (green/red), score tracking, a results screen with performance feedback, modern polished UI with gradients and animations, restart button. Return ONLY the complete HTML code first (wrapped in ```html), then a brief explanation. Single file, inline CSS and JS, no external libraries.",
  },
  {
    name: "Debate Agent",
    description: "Explore any topic from both sides — structured arguments, no filter.",
    prompt: "You are a master debater and critical thinker. When given a topic or question, present both sides with equal depth and rigor. Structure your response as: PROPOSITION (arguments for), OPPOSITION (arguments against), KEY TENSIONS (where both sides clash), VERDICT (your honest assessment of which argument is stronger and why). Be sharp, intellectual, slightly provocative. No wishy-washy both-sidesism — commit to clear arguments on each side. Make the reader think.",
  },
];

const stats = [
  { label: "Agents Available", value: "6", icon: <Users className="w-4 h-4" /> },
  { label: "Tasks Executed", value: "2,847", icon: <Zap className="w-4 h-4" /> },
  { label: "Outputs Generated", value: "1,204", icon: <BarChart3 className="w-4 h-4" /> },
];

const Index = () => {
  const [selectedAgent, setSelectedAgent] = useState<typeof agents[0] | null>(null);
  const [memories, setMemories] = useState<Record<string, Message[]>>({});
  const [multiMode, setMultiMode] = useState(false);

  const currentHistory = selectedAgent ? (memories[selectedAgent.name] || []) : [];

  const handleUpdateHistory = useCallback((messages: Message[]) => {
    if (!selectedAgent) return;
    setMemories(prev => ({ ...prev, [selectedAgent.name]: messages }));
  }, [selectedAgent]);

  return (
    <WalletGate>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 md:px-12 py-5 flex items-center justify-between max-w-[1200px] mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground tracking-tight">RialAI</span>
            <span className="text-muted-foreground text-sm font-light mx-1">×</span>
            <span className="text-base font-display font-semibold text-foreground/80 tracking-tight">Rialo</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Single</span>
              <Switch checked={multiMode} onCheckedChange={setMultiMode} />
              <span className="text-xs text-muted-foreground font-medium">Multi-Agent</span>
            </div>
            <WalletButton />
          </div>
        </header>

        {/* Hero */}
        <section className="px-6 md:px-12 pt-14 pb-10 max-w-[700px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/8 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-5 border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Powered by Rialo Agent Infrastructure
            </div>
            <h1 className="text-[38px] md:text-[54px] font-display font-bold text-primary leading-[1.1] mb-5 tracking-tight">
              AI That Actually Executes
            </h1>
            <p className="text-base md:text-lg max-w-[560px] mx-auto leading-relaxed" style={{ color: '#6e5a62' }}>
              Six specialized agents. One workspace. Real outputs — not just answers.
              Built for the Rialo agent economy.
            </p>
          </motion.div>
        </section>

        {/* Stats bar */}
        <section className="px-6 md:px-12 max-w-[1100px] mx-auto w-full mb-8">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="bg-card rounded-xl px-5 py-4 border border-border/50 flex items-center gap-3"
              >
                <div className="text-primary">{s.icon}</div>
                <div>
                  <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {multiMode ? (
          <MultiAgentView agents={agents} />
        ) : (
          <>
            {/* Agent Cards */}
            <section className="px-6 md:px-12 max-w-[1100px] mx-auto w-full">
              <div className="grid md:grid-cols-3 gap-6">
                {agents.map((agent, i) => (
                  <AgentCard
                    key={agent.name}
                    agent={agent}
                    index={i}
                    onSelect={setSelectedAgent}
                    isActive={selectedAgent?.name === agent.name}
                  />
                ))}
              </div>
            </section>

            <div className="text-center mt-10 mb-12">
              <p className="text-sm text-muted-foreground tracking-wide">
                One input. Six agents. Real execution.
              </p>
            </div>

            {/* Activity Feed */}
            <section className="px-6 md:px-12 max-w-[1100px] mx-auto w-full mb-20">
              <ActivityFeed />
            </section>

            {/* Rialo future section */}
            <section className="px-6 md:px-12 max-w-[1100px] mx-auto w-full mb-20">
              <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-mono text-primary uppercase tracking-widest">Rialo Roadmap</span>
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  Coming on Rialo Infrastructure
                </h2>
                <p className="text-muted-foreground text-sm mb-6 max-w-xl">
                  RialAI is building toward full integration with Rialo's agent economy. Here's what's next.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { phase: "Phase 2", title: "Agent Identity", desc: "Each agent gets an on-chain identity on Rialo. Verifiable, persistent, trustless.", icon: "🪪" },
                    { phase: "Phase 3", title: "Agent Reputation", desc: "Agents earn reputation scores based on output quality, tracked on-chain via Rialo.", icon: "⭐" },
                    { phase: "Phase 4", title: "Agent Marketplace", desc: "Deploy custom agents. Monetize via RLO payments. Coordinate via Rialo's SCALE protocol.", icon: "🏪" },
                  ].map((item) => (
                    <div key={item.title} className="bg-secondary/30 rounded-xl p-5 border border-border/30">
                      <div className="text-2xl mb-3">{item.icon}</div>
                      <div className="text-xs font-mono text-primary mb-1">{item.phase}</div>
                      <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <AgentModal
              agent={selectedAgent}
              onClose={() => setSelectedAgent(null)}
              conversationHistory={currentHistory}
              onUpdateHistory={handleUpdateHistory}
            />
          </>
        )}

        <footer className="mt-auto py-8 text-center">
          <p className="text-[11px] text-muted-foreground/60 tracking-wide">
            RialAI — Built on Rialo · AI Agent Execution Platform
          </p>
        </footer>
      </div>
    </WalletGate>
  );
};

export default Index;
