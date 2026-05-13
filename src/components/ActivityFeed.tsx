import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";

const feedItems = [
  "Research Agent compiled a deep dive on Rialo's SCALE protocol",
  "Game Builder generated a playable DeFi quiz in 4 seconds",
  "Content Engine wrote a viral thread on AI agent economies",
  "Debate Agent argued both sides of on-chain AI governance",
  "Crypto Analyst broke down RLO tokenomics and agent incentives",
  "Quiz Builder created an interactive Web3 fundamentals game",
  "Research Agent summarized Pantera Capital's Rialo thesis",
  "Content Engine drafted a product launch thread for an agent marketplace",
  "Game Builder built a Solana validator simulator",
  "Debate Agent explored: centralized vs decentralized AI agents",
  "Crypto Analyst evaluated an AI agent wallet portfolio",
  "Research Agent extracted key insights from 3 Rialo blog posts",
  "Multi-agent mode ran all 6 agents on a single prompt simultaneously",
  "Content Engine produced a 12-tweet thread on agent reputation systems",
];

const ActivityFeed = () => {
  const [items, setItems] = useState<{ text: string; id: number }[]>([]);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setItems((prev) => {
        const next = [
          { text: feedItems[idx % feedItems.length], id: Date.now() },
          ...prev.slice(0, 4),
        ];
        return next;
      });
      idx++;
    }, 3000);
    setItems([{ text: feedItems[0], id: Date.now() }]);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card rounded-2xl p-7 border border-border/50 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <h3 className="text-base font-display font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Live Agent Activity
        </h3>
        <span className="ml-auto text-xs text-muted-foreground font-mono bg-secondary/60 px-2 py-0.5 rounded-full">
          Powered by Rialo
        </span>
      </div>
      <div className="space-y-2.5 min-h-[200px]">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 text-sm text-muted-foreground bg-secondary/40 rounded-lg px-4 py-3"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              {item.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActivityFeed;
