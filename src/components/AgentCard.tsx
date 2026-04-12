import { motion } from "framer-motion";
import { TrendingUp, Twitter, Code } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "Crypto Analyst": <TrendingUp className="w-8 h-8" />,
  "Twitter Writer": <Twitter className="w-8 h-8" />,
  "Code Assistant": <Code className="w-8 h-8" />,
};

interface Agent {
  name: string;
  description: string;
  prompt: string;
}

interface AgentCardProps {
  agent: Agent;
  index: number;
  onSelect: (agent: Agent) => void;
  isActive?: boolean;
}

const AgentCard = ({ agent, index, onSelect, isActive }: AgentCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`glass-card-solid rounded-3xl p-8 glow-hover cursor-pointer group ${isActive ? "ring-2 ring-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]" : ""}`}
      onClick={() => onSelect(agent)}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
        {iconMap[agent.name]}
      </div>
      <h3 className="text-xl font-display font-semibold text-foreground mb-2">
        {agent.name}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6">
        {agent.description}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(agent);
        }}
        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/20"
      >
        Run Agent
      </button>
    </motion.div>
  );
};

export default AgentCard;
