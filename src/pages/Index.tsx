import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
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
    description: "Generate high-performing content for X, blogs, and threads.",
    prompt: "You are a top-tier content strategist. Extract key insights, identify the main value proposition, and write high-quality X threads with a strong hook, clear structure, insightful points, and no fluff. Make it feel human, sharp, and high-signal.",
  },
  {
    name: "Game Builder",
    description: "Generate and instantly run browser games from a single prompt.",
    prompt: "You are an expert game developer and UI designer. Always return a complete runnable HTML file with all CSS and JavaScript inline. Use modern UI design (glassmorphism, gradients, soft shadows), smooth animations, clean typography, centered responsive layout. Add score tracking, start/restart buttons. Make gameplay smooth and intuitive. No external libraries. FIRST: full HTML code (no text before). THEN: short explanation after the code.",
  },
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
          <span className="text-lg font-display font-bold text-foreground tracking-tight">ExecAI</span>
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
      <section className="px-6 md:px-12 pt-16 pb-14 max-w-[700px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[40px] md:text-[56px] font-display font-bold text-primary leading-[1.1] mb-5 tracking-tight">
            AI That Actually Executes
           </h1>
          <p className="text-base md:text-lg max-w-[600px] mx-auto leading-relaxed" style={{ color: '#6e5a62' }}>
            Run specialized agents that don't just respond — they build, analyze, and generate real outputs instantly.
          </p>
        </motion.div>
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

          {/* Clarity line */}
          <div className="text-center mt-10 mb-12">
            <p className="text-sm text-muted-foreground tracking-wide">
              One input. Multiple agents. Real execution.
            </p>
          </div>

          {/* Activity Feed */}
          <section className="px-6 md:px-12 max-w-[1100px] mx-auto w-full mb-20">
            <ActivityFeed />
          </section>

          {/* Modal */}
          <AgentModal
            agent={selectedAgent}
            onClose={() => setSelectedAgent(null)}
            conversationHistory={currentHistory}
            onUpdateHistory={handleUpdateHistory}
          />
        </>
      )}

      {/* Footer */}
      <footer className="mt-auto py-8 text-center">
        <p className="text-xs text-muted-foreground">Built for Rialo</p>
      </footer>
    </div>
    </WalletGate>
  );
};

export default Index;
