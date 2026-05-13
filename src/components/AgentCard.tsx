import { motion } from "framer-motion";
import { TrendingUp, PenLine, Gamepad2, Search, HelpCircle, MessageSquare } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "Crypto Analyst": <TrendingUp className="w-5 h-5" />,
  "Content Engine": <PenLine className="w-5 h-5" />,
  "Game Builder": <Gamepad2 className="w-5 h-5" />,
  "Research Agent": <Search className="w-5 h-5" />,
  "Quiz Builder": <HelpCircle className="w-5 h-5" />,
  "Debate Agent": <MessageSquare className="w-5 h-5" />,
};

const tagMap: Record<string, string> = {
  "Crypto Analyst": "Analysis",
  "Content Engine": "Content",
  "Game Builder": "Interactive",
  "Research Agent": "Research",
  "Quiz Builder": "Education",
  "Debate Agent": "Critical Thinking",
};

const colorMap: Record<string, string> = {
  "Crypto Analyst": "from-emerald-500/10 to-teal-500/5 border-emerald-500/15",
  "Content Engine": "from-blue-500/10 to-indigo-500/5 border-blue-500/15",
  "Game Builder": "from-orange-500/10 to-amber-500/5 border-orange-500/15",
  "Research Agent": "from-purple-500/10 to-violet-500/5 border-purple-500/15",
  "Quiz Builder": "from-pink-500/10 to-rose-500/5 border-pink-500/15",
  "Debate Agent": "from-cyan-500/10 to-sky-500/5 border-cyan-500/15",
};

const iconColorMap: Record<string, string> = {
  "Crypto Analyst": "text-emerald-400 bg-emerald-500/10",
  "Content Engine": "text-blue-400 bg-blue-500/10",
  "Game Builder": "text-orange-400 bg-orange-500/10",
  "Research Agent": "text-purple-400 bg-purple-500/10",
  "Quiz Builder": "text-pink-400 bg-pink-500/10",
  "Debate Agent": "text-cyan-400 bg-cyan-500/10",
};

const btnColorMap: Record<string, string> = {
  "Crypto Analyst": "bg-emerald-600 hover:bg-emerald-500",
  "Content Engine": "bg-blue-600 hover:bg-blue-500",
  "Game Builder": "bg-orange-600 hover:bg-orange-500",
  "Research Agent": "bg-purple-600 hover:bg-purple-500",
  "Quiz Builder": "bg-pink-600 hover:bg-pink-500",
  "Debate Agent": "bg-cyan-600 hover:bg-cyan-500",
};

interface Agent { name: string; description: string; prompt: string; }
interface AgentCardProps { agent: Agent; index: number; onSelect: (agent: Agent) => void; isActive?: boolean; }

const AgentCard = ({ agent, index, onSelect, isActive }: AgentCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className={`bg-gradient-to-br ${colorMap[agent.name]} rounded-2xl p-6 border cursor-pointer card-hover relative overflow-hidden group ${
        isActive ? "ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/10" : ""
      }`}
      onClick={() => onSelect(agent)}
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColorMap[agent.name]}`}>
            {iconMap[agent.name]}
          </div>
          <span className="text-[10px] font-mono text-white/30 bg-white/5 px-2 py-1 rounded-full border border-white/8">
            {tagMap[agent.name]}
          </span>
        </div>

        <h3 className="text-base font-display font-semibold text-white mb-2">{agent.name}</h3>
        <p className="text-white/50 text-sm leading-relaxed mb-6">{agent.description}</p>

        <button
          onClick={(e) => { e.stopPropagation(); onSelect(agent); }}
          className={`w-full py-2.5 rounded-xl text-white font-medium text-sm transition-all ${btnColorMap[agent.name]} active:scale-[0.98]`}
        >
          Execute →
        </button>
      </div>
    </motion.div>
  );
};

export default AgentCard;
