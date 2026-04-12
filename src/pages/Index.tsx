import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import AgentModal from "@/components/AgentModal";
import ActivityFeed from "@/components/ActivityFeed";

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
    name: "Code Assistant",
    description: "Helps debug, refactor, and generate production-ready code.",
    prompt: "Help with this coding task:",
  },
];

const Index = () => {
  const [selectedAgent, setSelectedAgent] = useState<typeof agents[0] | null>(null);
  // Per-agent conversation memory
  const [memories, setMemories] = useState<Record<string, Message[]>>({});

  const currentHistory = selectedAgent ? (memories[selectedAgent.name] || []) : [];

  const handleUpdateHistory = useCallback((messages: Message[]) => {
    if (!selectedAgent) return;
    setMemories(prev => ({ ...prev, [selectedAgent.name]: messages }));
  }, [selectedAgent]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="text-xl font-display font-bold text-foreground">AgentHub</span>
        </div>
        <div className="flex items-center gap-3">
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
            Your AI Agent
            <br />
            <span className="text-primary">Marketplace</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Deploy specialized AI agents for any task. Instant results, zero setup.
          </p>
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
    </div>
  );
};

export default Index;
