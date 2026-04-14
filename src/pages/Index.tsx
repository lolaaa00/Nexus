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
    description: "Analyzes wallets, tokens, and on-chain trends with deep market intelligence.",
    prompt: "You are a crypto analyst. Analyze this:",
  },
  {
    name: "Twitter Writer",
    description: "Writes viral threads and tweets that drive engagement and growth.",
    prompt: "Write a viral Twitter thread about:",
  },
  {
    name: "Game Builder",
    description: "Creates simple browser games — snake, tic tac toe, flappy bird and more.",
    prompt: "You are a game developer. Always return a complete runnable HTML file with all CSS and JavaScript inline. Include no explanations before the code. After the code block, add a short 'How to run' section.",
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold text-foreground tracking-tight">ExecAI</span>
          <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded">by Rialo</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Single</span>
            <Switch checked={multiMode} onCheckedChange={setMultiMode} />
            <span className="text-xs text-muted-foreground">Multi-Agent</span>
          </div>
          <span className="text-xs text-muted-foreground bg-secondary/60 px-3 py-1.5 rounded-full">3 agents live</span>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-12 pb-16 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight mb-4">
            Your Instant AI
            <br />
            <span className="text-primary">Execution Workspace</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Run specialized AI agents for any task. Instant results, zero setup.
          </p>
          <p className="text-xs text-muted-foreground mt-2">⚡ Powered by Rialo</p>
        </motion.div>
      </section>

      {/* Empty state */}
      {!selectedAgent && (
        <div className="text-center mb-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground text-sm animate-pulse"
          >
            ✨ Select an agent below to begin
          </motion.p>
        </div>
      )}

      {multiMode ? (
        <MultiAgentView agents={agents} />
      ) : (
        <>
          {/* Agent Cards */}
          <section className="px-6 md:px-12 max-w-5xl mx-auto">
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

          {/* Activity Feed */}
          <section className="px-6 md:px-12 max-w-5xl mx-auto mt-16 mb-20">
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
    </div>
  );
};

export default Index;
