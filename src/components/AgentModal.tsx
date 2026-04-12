import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ThumbsUp, ThumbsDown } from "lucide-react";

interface Agent {
  name: string;
  description: string;
  prompt: string;
}

interface AgentModalProps {
  agent: Agent | null;
  onClose: () => void;
}

const AgentModal = ({ agent, onClose }: AgentModalProps) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rated, setRated] = useState<"up" | "down" | null>(null);

  const runAgent = () => {
    if (!input.trim() || !agent) return;
    setLoading(true);
    setOutput("");
    setRated(null);
    setTimeout(() => {
      setOutput(`${agent.prompt} ${input}\n\nBased on my analysis, here are the key insights:\n\n1. The data suggests significant patterns worth exploring.\n2. I recommend focusing on the primary indicators first.\n3. Consider the broader market context for optimal results.`);
      setLoading(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {agent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative glass-card-solid rounded-3xl w-full max-w-lg p-8 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-display font-bold text-foreground mb-1">
              {agent.name}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">{agent.description}</p>

            <textarea
              placeholder="Describe your task..."
              className="w-full bg-secondary/50 border-0 rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[100px] transition-shadow"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button
              onClick={runAgent}
              disabled={loading || !input.trim()}
              className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Processing...
                </>
              ) : (
                "Run Agent"
              )}
            </button>

            <AnimatePresence>
              {output && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-5"
                >
                  <div className="bg-secondary/40 rounded-2xl p-5">
                    <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                      {output}
                    </p>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                      <span className="text-xs text-muted-foreground mr-auto">Was this helpful?</span>
                      <button
                        onClick={() => setRated("up")}
                        className={`p-2 rounded-xl transition-colors ${rated === "up" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setRated("down")}
                        className={`p-2 rounded-xl transition-colors ${rated === "down" ? "bg-destructive/15 text-destructive" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgentModal;
