import { motion } from "framer-motion";
import { TrendingUp, PenLine, Gamepad2 } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "Crypto Analyst": <TrendingUp className="w-6 h-6" />,
  "Content Engine": <PenLine className="w-6 h-6" />,
  "Game Builder": <Gamepad2 className="w-6 h-6" />,
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
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`bg-card rounded-[20px] p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group ${
        isActive ? "ring-2 ring-primary shadow-lg" : "border border-border/50"
      }`}
      onClick={() => onSelect(agent)}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center text-primary mb-5 group-hover:bg-primary/15 transition-colors duration-300">
        {iconMap[agent.name]}
      </div>
      <h3 className="text-lg font-display font-semibold text-foreground mb-2">
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
        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all"
      >
        Execute
      </button>
    </motion.div>
  );
};

export default AgentCard;
