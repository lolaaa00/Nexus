import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Download, CheckCircle2, Maximize2, Minimize2, Copy, FileText, ExternalLink } from "lucide-react";
import { buildEnhancedPrompt, detectUrls, scrapeUrls } from "@/lib/input-utils";
import FormattedOutput from "./FormattedOutput";

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
  const [fullscreenAgent, setFullscreenAgent] = useState<string | null>(null);
  const outputRefs = useRef<Record<string, string>>({});

  const runAll = async () => {
    if (!prompt.trim() || running) return;
    setRunning(true);
    setPreviewAgent(null);
    outputRefs.current = {};

    // Scrape URLs if present
    const urls = detectUrls(prompt);
    let scrapedContent = "";
    if (urls.length > 0) {
      try {
        scrapedContent = await scrapeUrls(urls);
      } catch {
        // Continue without scraped content
      }
    }

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

      const enhancedPrompt = buildEnhancedPrompt(prompt, agent.name, true, scrapedContent);

      fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: enhancedPrompt }],
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openInNewTab = (html: string) => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const exportAsText = (content: string, name: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, "-")}-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
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

  // Fullscreen game overlay
  const fullscreenResp = fullscreenAgent ? responses.find(r => r.agentName === fullscreenAgent) : null;
  const fullscreenHtml = fullscreenResp ? extractHtmlCode(fullscreenResp.content) : null;

  return (
    <>
    {/* Fullscreen overlay */}
    <AnimatePresence>
      {fullscreenAgent && fullscreenHtml && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-black/90 border-b border-white/10">
            <span className="text-white text-sm font-medium">{fullscreenAgent} — Live Preview</span>
            <button
              onClick={() => setFullscreenAgent(null)}
              className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              Exit Fullscreen
            </button>
          </div>
          <iframe
            srcDoc={fullscreenHtml}
            className="flex-1 w-full bg-white"
            sandbox="allow-scripts"
            title="Fullscreen game preview"
          />
        </motion.div>
      )}
    </AnimatePresence>

    <section className="px-6 md:px-12 max-w-[1200px] mx-auto mt-4 mb-16 w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Run a Task Across Agents
        </h2>
        <p className="text-sm text-muted-foreground">
          See how different AI agents approach the same problem
        </p>
      </div>

      <div className="bg-card rounded-2xl p-6 md:p-8 mb-8 border border-border/50 shadow-sm">
        <textarea
          placeholder="Enter your prompt for all agents..."
          className="w-full bg-secondary/50 border border-border/30 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[80px] transition-shadow"
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
          className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {running ? (
            <>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
              Executing all agents...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Execute All
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {responses.length > 0 && (
          <div className="grid md:grid-cols-3 gap-5">
            {responses.map((resp, i) => {
              const htmlCode = extractHtmlCode(resp.content);
              const isPreview = previewAgent === resp.agentName;
              const isGameAgent = resp.agentName === "Game Builder";

              return (
                <motion.div
                  key={resp.agentName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className={`bg-card rounded-2xl p-5 flex flex-col border border-border/50 shadow-sm ${isPreview && isGameAgent ? "md:col-span-3" : ""}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-display font-semibold text-foreground">
                      {resp.agentName}
                    </h3>
                    {resp.done && !resp.error && (
                      <span className="flex items-center gap-1 text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Complete
                      </span>
                    )}
                  </div>

                  {resp.error ? (
                    <div className="text-destructive text-xs bg-destructive/10 rounded-lg p-3">
                      {resp.error}
                    </div>
                  ) : isPreview && htmlCode ? (
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setFullscreenAgent(resp.agentName)}
                          className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/15 transition-colors"
                        >
                          <Maximize2 className="w-3 h-3" />
                          Fullscreen
                        </button>
                        <button
                          onClick={() => openInNewTab(htmlCode)}
                          className="flex items-center gap-1.5 text-xs bg-secondary text-foreground px-3 py-1.5 rounded-lg hover:bg-secondary/80 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          New Tab
                        </button>
                        <button
                          onClick={() => downloadCode(resp.content, resp.agentName)}
                          className="flex items-center gap-1.5 text-xs bg-secondary text-foreground px-3 py-1.5 rounded-lg hover:bg-secondary/80 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                      <iframe
                        srcDoc={htmlCode}
                        className={`w-full rounded-lg border border-border bg-white ${isGameAgent ? "min-h-[500px]" : "min-h-[300px]"}`}
                        sandbox="allow-scripts"
                        title={`${resp.agentName} preview`}
                      />
                      <button
                        onClick={() => setPreviewAgent(null)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Back to response
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto max-h-[350px] bg-secondary/30 rounded-lg p-4 mb-3">
                      <div className="text-xs text-foreground leading-relaxed">
                        <FormattedOutput content={resp.content} agentName={resp.agentName} />
                        {resp.loading && (
                          <span className="inline-block w-0.5 h-3 bg-primary ml-0.5 animate-pulse" />
                        )}
                      </div>
                    </div>
                  )}

                  {resp.done && !resp.error && !isPreview && (
                    <div className="flex gap-2 mt-auto pt-3">
                      {htmlCode && (
                        <>
                          <button
                            onClick={() => setPreviewAgent(resp.agentName)}
                            className="flex items-center justify-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary/15 transition-colors"
                          >
                            <Play className="w-3 h-3" />
                            Preview
                          </button>
                          <button
                            onClick={() => downloadCode(resp.content, resp.agentName)}
                            className="flex items-center justify-center gap-1.5 text-xs bg-secondary text-foreground px-3 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </>
                      )}
                      {!htmlCode && (
                        <>
                          <button
                            onClick={() => copyToClipboard(resp.content)}
                            className="flex items-center justify-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary/15 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                          <button
                            onClick={() => exportAsText(resp.content, resp.agentName)}
                            className="flex items-center justify-center gap-1.5 text-xs bg-secondary text-foreground px-3 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            Export
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
    </>
  );
};

export default MultiAgentView;
