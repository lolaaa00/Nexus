import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";

const feedItems = [
  "Research Agent compiled a deep dive on Rialo's SCALE protocol",
  "Game Builder generated a playable DeFi quiz in 4 seconds",
  "Content Engine wrote a viral thread on AI agent economies",
  "Debate Agent argued both sides of on-chain AI governance",
  "Crypto Analyst broke down on-chain wallet activity — no guesses",
  "Quiz Builder created an interactive Web3 fundamentals game",
  "Research Agent summarized Rialo's agent identity infrastructure",
  "Content Engine drafted a product launch thread — zero fluff",
  "Game Builder built a Solana validator simulator",
  "Debate Agent explored: centralized vs decentralized AI agents",
  "Crypto Analyst evaluated wallet holdings with sourced data only",
  "Multi-agent mode ran all 6 agents on a single prompt simultaneously",
];

const AgentColors: Record<string, string> = {
  "Research Agent": "bg-purple-500",
  "Game Builder": "bg-orange-500",
  "Content Engine": "bg-blue-500",
  "Debate Agent": "bg-cyan-500",
  "Crypto Analyst": "bg-emerald-500",
  "Quiz Builder": "bg-pink-500",
  "Multi-agent": "bg-yellow-500",
};

function getAgentColor(text: string): string {
  for (const [agent, color] of Object.entries(AgentColors)) {
    if (text.startsWith(agent)) return color;
  }
  return "bg-purple-500";
}

const ActivityFeed = () => {
  const [items, setItems] = useState<{ text: string; id: number }[]>([]);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setItems((prev) => {
        const next = [{ text: feedItems[idx % feedItems.length], id: Date.now() }, ...prev.slice(0, 4)];
        return next;
      });
      idx++;
    }, 3000);
    setItems([{ text: feedItems[0], id: Date.now() }]);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-2xl p-7 border border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          Live Agent Activity
        </h3>
        <span className="ml-auto text-[10px] font-mono text-white/25 bg-white/4 px-2.5 py-1 rounded-full border border-white/6">
          Powered by Rialo
        </span>
      </div>
      <div className="space-y-2 min-h-[200px]">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 16, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 text-sm text-white/40 bg-white/3 rounded-xl px-4 py-3 border border-white/4"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${getAgentColor(item.text)}`} />
              {item.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActivityFeed;
