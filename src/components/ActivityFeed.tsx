import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";

const feedItems = [
  "User hired Crypto Analyst to analyze ETH wallet",
  "Twitter Writer generated a viral thread on AI agents",
  "Game Builder created a snake game in seconds",
  "Crypto Analyst evaluated Solana token metrics",
  "Twitter Writer crafted a growth hacking thread",
  "Game Builder built a tic tac toe game",
  "User ran Crypto Analyst on a DeFi portfolio",
  "Twitter Writer wrote a product launch thread",
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
    <div className="glass-card rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Live Activity
        </h3>
      </div>
      <div className="space-y-3 min-h-[200px]">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 text-sm text-muted-foreground bg-secondary/30 rounded-xl px-4 py-3"
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
