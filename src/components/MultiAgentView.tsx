import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Download, RefreshCw, CheckCircle2 } from "lucide-react";

interface Agent {
  name: string;
  description: string;
  prompt: string;
}

interface AgentResponse {
  agentName: string;
  content: string;
  loading: boolean;
  error: string;
  done: boolean;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

function extractHtmlCode(text: string): string | null {
  const match = text.match(/```html\s*([\s\S]*?)```/);
  if (match) return match[1].trim();
  // Check if the whole response is an HTML file
  if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
    return text.trim();
  }
  return null;
}

interface MultiAgentViewProps {
  agents: Agent[];
}

const MultiAgentView = ({ agents }: MultiAgentViewProps) => {
  const [prompt, setPrompt] = useState("");
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  const [running, setRunning] = useState(false);
  const [previewAgent, setPreviewAgent] = useState<string | null>(null);
  const outputRefs = useRef<Record<string, string>>({});

  const runAll = () => {
    if (!prompt.trim() || running) return;
    setRunning(true);
    setPreviewAgent(null);
    outputRefs.current = {};

    const initial: AgentResponse[] = agents.map((a) => ({
      agentName: a.name,
      content: "",
      loading: true,
      error: "",
      done: false,
    }));
    setResponses(initial);

    agents.forEach((agent) => {
      outputRefs.current[agent.name] = "";

      fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          systemPrompt: agent.prompt,
        }),
      })
        .then(async (resp) => {
          if (!resp.ok || !resp.body) {
            const errText = await resp.text();
            setResponses((prev) =>
              prev.map((r) =>
                r.agentName === agent.name
                  ? { ...r, loading: false, error: `Error ${resp.status}: ${errText}` }
                  : r
              )
            );
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
                if (content) {
                  outputRefs.current[agent.name] += content;
                  setResponses((prev) =>
                    prev.map((r) =>
                      r.agentName === agent.name
                        ? { ...r, content: outputRefs.current[agent.name] }
                        : r
                    )
                  );
                }
              } catch {
                buffer = line + "\n" + buffer;
                break;
              }
            }
          }

          setResponses((prev) =>
            prev.map((r) =>
              r.agentName === agent.name ? { ...r, loading: false, done: true } : r
            )
          );
        })
        .catch((err) => {
          setResponses((prev) =>
            prev.map((r) =>
              r.agentName === agent.name
                ? { ...r, loading: false, error: err.message || "Network error" }
                : r
            )
          );
        })
        .finally(() => {
          // Check if all done
          setTimeout(() => {
            setResponses((prev) => {
              const allDone = prev.every((r) => !r.loading);
              if (allDone) setRunning(false);
              return prev;
            });
          }, 100);
        });
    });
  };

  const downloadCode = (content: string, agentName: string) => {
    const code = extractHtmlCode(content);
    if (!code) return;
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agentName.toLowerCase().replace(/\s+/g, "-")}-game.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="px-6 md:px-12 max-w-6xl mx-auto mt-12 mb-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
          Run a Task Across Agents
        </h2>
        <p className="text-muted-foreground text-sm">
          See how different AI agents approach the same problem
        </p>
      </div>

      <div className="glass-card-solid rounded-3xl p-6 md:p-8 mb-8">
        <textarea
          placeholder="Enter your prompt for all agents..."
          className="w-full bg-secondary/50 border-0 rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[80px] transition-shadow"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              runAll();
            }
          }}
        />
        <button
          onClick={runAll}
          disabled={running || !prompt.trim()}
          className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {running ? (
            <>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
              Running all agents...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run All Agents
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {responses.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            {responses.map((resp, i) => {
              const htmlCode = extractHtmlCode(resp.content);
              const isPreview = previewAgent === resp.agentName;

              return (
                <motion.div
                  key={resp.agentName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="glass-card-solid rounded-3xl p-6 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-display font-bold text-foreground">
                      {resp.agentName}'s Answer
                    </h3>
                    {resp.done && !resp.error && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Complete
                      </span>
                    )}
                  </div>

                  {resp.error ? (
                    <div className="text-destructive text-xs bg-destructive/10 rounded-xl p-3">
                      {resp.error}
                    </div>
                  ) : isPreview && htmlCode ? (
                    <div className="flex-1 flex flex-col gap-2">
                      <iframe
                        srcDoc={htmlCode}
                        className="w-full flex-1 min-h-[300px] rounded-xl border border-border bg-white"
                        sandbox="allow-scripts"
                        title={`${resp.agentName} preview`}
                      />
                      <button
                        onClick={() => setPreviewAgent(null)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        ← Back to response
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto max-h-[300px] bg-secondary/30 rounded-2xl p-4 mb-3">
                      <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
                        {resp.content}
                        {resp.loading && (
                          <span className="inline-block w-0.5 h-3 bg-primary ml-0.5 animate-pulse" />
                        )}
                      </p>
                    </div>
                  )}

                  {resp.done && !resp.error && !isPreview && (
                    <div className="flex gap-2 mt-auto pt-2">
                      {htmlCode && (
                        <>
                          <button
                            onClick={() => setPreviewAgent(resp.agentName)}
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-primary/10 text-primary py-2 rounded-xl hover:bg-primary/20 transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Run Code
                          </button>
                          <button
                            onClick={() => downloadCode(resp.content, resp.agentName)}
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-primary/10 text-primary py-2 rounded-xl hover:bg-primary/20 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MultiAgentView;
