import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ThumbsUp, ThumbsDown } from "lucide-react";
import CodePreview from "./CodePreview";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Agent {
  name: string;
  description: string;
  prompt: string;
}

interface AgentModalProps {
  agent: Agent | null;
  onClose: () => void;
  conversationHistory: Message[];
  onUpdateHistory: (messages: Message[]) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({
  messages,
  systemPrompt,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  systemPrompt: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, systemPrompt }),
    });

    if (!resp.ok || !resp.body) {
      const errText = await resp.text();
      onError(`Error ${resp.status}: ${errText}`);
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
    onDone();
  } catch (e) {
    onError(e instanceof Error ? e.message : "Network error");
  }
}

const AgentModal = ({ agent, onClose, conversationHistory, onUpdateHistory }: AgentModalProps) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rated, setRated] = useState<"up" | "down" | null>(null);
  const [error, setError] = useState("");
  const outputRef = useRef("");

  // Reset state when agent changes
  useEffect(() => {
    setInput("");
    setOutput("");
    setError("");
    setRated(null);
    setLoading(false);
    outputRef.current = "";
  }, [agent?.name]);

  const runAgent = () => {
    if (!input.trim() || !agent) return;
    setLoading(true);
    setOutput("");
    setError("");
    setRated(null);
    outputRef.current = "";

    const userMsg: Message = { role: "user", content: input };
    // Keep last 5 messages for context
    const recentHistory = conversationHistory.slice(-4);
    const allMessages = [...recentHistory, userMsg];

    streamChat({
      messages: allMessages,
      systemPrompt: agent.prompt,
      onDelta: (chunk) => {
        outputRef.current += chunk;
        setOutput(outputRef.current);
      },
      onDone: () => {
        setLoading(false);
        const assistantMsg: Message = { role: "assistant", content: outputRef.current };
        onUpdateHistory([...conversationHistory, userMsg, assistantMsg].slice(-10));
      },
      onError: (err) => {
        setLoading(false);
        setError(err);
      },
    });

    setInput("");
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
            className="relative glass-card-solid rounded-3xl w-full max-w-lg p-8 z-10 max-h-[85vh] overflow-y-auto"
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
            <p className="text-muted-foreground text-sm mb-4">{agent.description}</p>

            {/* Conversation history preview */}
            {conversationHistory.length > 0 && (
              <div className="mb-4 space-y-2 max-h-32 overflow-y-auto">
                {conversationHistory.slice(-4).map((msg, i) => (
                  <div key={i} className={`text-xs px-3 py-1.5 rounded-xl ${msg.role === "user" ? "bg-primary/10 text-primary ml-8" : "bg-secondary/60 text-muted-foreground mr-8"}`}>
                    <span className="font-medium">{msg.role === "user" ? "You" : "AI"}:</span> {msg.content.slice(0, 80)}{msg.content.length > 80 ? "…" : ""}
                  </div>
                ))}
              </div>
            )}

            <textarea
              placeholder="Describe your task..."
              className="w-full bg-secondary/50 border-0 rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[100px] transition-shadow"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  runAgent();
                }
              }}
            />

            <button
              onClick={runAgent}
              disabled={loading || !input.trim()}
              className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group animate-pulse-subtle"
            >
              {loading ? (
                <>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                  Thinking...
                </>
              ) : (
                "Run Agent"
              )}
            </button>

            {error && (
              <div className="mt-4 bg-destructive/10 text-destructive rounded-2xl p-4 text-sm">
                {error}
              </div>
            )}

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
                      {loading && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />}
                    </p>
                    {!loading && agent && (
                      <CodePreview content={output} agentName={agent.name} />
                    )}
                    {!loading && (
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
                    )}
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
