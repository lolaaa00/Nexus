import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, Zap, ArrowRight, RotateCcw, Copy, Play, Download } from "lucide-react";
import { OrchestrationPlan, AgentTask, getAgentPrompt } from "@/lib/orchestrator";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

interface OrchestrationViewProps {
  plan: OrchestrationPlan;
  onReset: () => void;
}

function extractHtml(text: string): string | null {
  const match = text.match(/```html\s*([\s\S]*?)```/);
  if (match) return match[1].trim();
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) return text.trim();
  return null;
}

async function runAgent(
  agentName: string,
  task: string,
  previousOutput: string | undefined,
  onDelta: (text: string) => void
): Promise<string> {
  const systemPrompt = getAgentPrompt(agentName, task, previousOutput);
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: task }],
      systemPrompt,
    }),
  });

  if (!resp.ok || !resp.body) throw new Error(`Agent failed: ${resp.status}`);

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') break;
      try {
        const parsed = JSON.parse(json);
        const chunk = parsed.choices?.[0]?.delta?.content;
        if (chunk) { full += chunk; onDelta(chunk); }
      } catch { /* continue */ }
    }
  }
  return full;
}

export default function OrchestrationView({ plan, onReset }: OrchestrationViewProps) {
  const [tasks, setTasks] = useState<AgentTask[]>(plan.tasks);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [streamingText, setStreamingText] = useState('');
  const [done, setDone] = useState(false);
  const [rloSpent, setRloSpent] = useState(0);
  const [activeOutput, setActiveOutput] = useState<string | null>(null);
  const outputRef = useRef<Record<string, string>>({});
  const streamRef = useRef('');

  useEffect(() => {
    let cancelled = false;

    async function runAll() {
      let prevOutput: string | undefined;

      for (let i = 0; i < tasks.length; i++) {
        if (cancelled) return;
        const task = tasks[i];

        // Mark as paying (simulate RLO escrow)
        setCurrentIdx(i);
        setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'paying', startTime: Date.now() } : t));
        await new Promise(r => setTimeout(r, 800));

        // Mark as running
        setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'running' } : t));
        streamRef.current = '';
        setStreamingText('');

        try {
          const output = await runAgent(
            task.agentName,
            task.task,
            prevOutput,
            (chunk) => {
              streamRef.current += chunk;
              setStreamingText(streamRef.current);
            }
          );

          outputRef.current[task.id] = output;
          setOutputs({ ...outputRef.current });
          prevOutput = output;

          // Simulate payment
          setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'done', endTime: Date.now() } : t));
          setRloSpent(prev => prev + task.rloCost);

          await new Promise(r => setTimeout(r, 400));
        } catch (e) {
          setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'done', endTime: Date.now() } : t));
          outputRef.current[task.id] = 'Agent encountered an error. Please try again.';
          setOutputs({ ...outputRef.current });
        }
      }

      if (!cancelled) {
        setDone(true);
        setCurrentIdx(-1);
        setStreamingText('');
        setActiveOutput(tasks[tasks.length - 1].id);
      }
    }

    runAll();
    return () => { cancelled = true; };
  }, []);

  const copyText = (text: string) => navigator.clipboard.writeText(text);

  const downloadHtml = (html: string) => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'nexus-output.html'; a.click();
    URL.revokeObjectURL(url);
  };

  const openHtml = (html: string) => {
    const blob = new Blob([html], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  };

  return (
    <div className="px-6 md:px-12 max-w-[1200px] mx-auto w-full pt-8 pb-24">

      {/* Goal header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">Orchestrating</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-1">"{plan.goal}"</h2>
            <p className="text-white/40 text-sm font-mono">{tasks.length} agents · {plan.totalRlo} RLO budget · Rialo SCALE</p>
          </div>
          <button onClick={onReset} className="flex items-center gap-2 text-white/40 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl text-xs font-mono transition-all">
            <RotateCcw className="w-3.5 h-3.5" /> New Goal
          </button>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-5 gap-6">

        {/* Left: Agent pipeline */}
        <div className="md:col-span-2 space-y-3">
          <p className="text-xs font-mono text-white/25 uppercase tracking-widest mb-4">Agent Pipeline</p>

          {/* Orchestrator */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-4 border border-purple-500/20 bg-purple-500/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-lg" style={{ boxShadow: '0 0 15px rgba(124,58,237,0.4)' }}>
                🎯
              </div>
              <div className="flex-1">
                <p className="text-sm font-display font-semibold text-white">Orchestrator</p>
                <p className="text-xs text-purple-400 font-mono">Planning · Coordinating</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </div>
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-xs text-white/35 font-mono">Hired {tasks.length} agents · Budget: {plan.totalRlo} RLO</p>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-px h-4 bg-gradient-to-b from-purple-500/50 to-transparent" />
          </div>

          {/* Agent tasks */}
          {tasks.map((task, i) => {
            const isActive = currentIdx === i;
            const isDone = task.status === 'done';
            const isPaying = task.status === 'paying';

            return (
              <div key={task.id}>
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className={`glass rounded-2xl p-4 border cursor-pointer transition-all ${
                    isActive ? 'border-white/20 bg-white/4' :
                    isDone ? 'border-white/8' : 'border-white/4 opacity-50'
                  } ${outputs[task.id] ? 'hover:border-white/15' : ''}`}
                  onClick={() => outputs[task.id] && setActiveOutput(task.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${task.agentColor}15`, boxShadow: isDone || isActive ? `0 0 12px ${task.agentColor}30` : 'none' }}
                    >
                      {task.agentIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display font-semibold text-white">{task.agentName}</p>
                      <p className="text-xs text-white/35 font-mono truncate">{task.task}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : isPaying ? (
                        <div className="text-xs font-mono text-yellow-400 animate-pulse">◎ {task.rloCost}</div>
                      ) : isActive ? (
                        <div className="spinner" />
                      ) : (
                        <Clock className="w-4 h-4 text-white/20" />
                      )}
                    </div>
                  </div>

                  {/* RLO payment row */}
                  {(isPaying || isDone) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between"
                    >
                      <span className="text-[10px] font-mono text-white/25">
                        {isDone ? '✓ Paid via Rialo escrow' : '⏳ Processing payment...'}
                      </span>
                      <span className="text-[10px] font-mono text-yellow-400">{task.rloCost} RLO</span>
                    </motion.div>
                  )}

                  {/* Click to view */}
                  {isDone && outputs[task.id] && (
                    <div className="mt-2 text-[10px] font-mono text-white/20 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" /> Click to view output
                    </div>
                  )}
                </motion.div>

                {i < tasks.length - 1 && (
                  <div className="flex justify-center my-1">
                    <div className={`w-px h-4 ${isDone ? 'bg-gradient-to-b from-green-500/50 to-purple-500/30' : 'bg-white/5'}`} />
                  </div>
                )}
              </div>
            );
          })}

          {/* RLO summary */}
          <AnimatePresence>
            {rloSpent > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4 border border-yellow-500/15 bg-yellow-500/5 mt-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-yellow-400">RLO Spent</span>
                  <span className="text-sm font-display font-bold text-yellow-400">{rloSpent} / {plan.totalRlo}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${(rloSpent / plan.totalRlo) * 100}%` }}
                    className="h-full bg-yellow-400 rounded-full"
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-[10px] font-mono text-white/25 mt-2">Simulated · Real on Rialo mainnet</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Live output */}
        <div className="md:col-span-3">
          <p className="text-xs font-mono text-white/25 uppercase tracking-widest mb-4">Live Output</p>

          {/* Streaming */}
          {currentIdx >= 0 && !done && (
            <motion.div
              key={`stream-${currentIdx}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 border border-white/8 mb-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: `${tasks[currentIdx]?.agentColor}15` }}
                >
                  {tasks[currentIdx]?.agentIcon}
                </div>
                <span className="text-sm font-display font-semibold text-white">{tasks[currentIdx]?.agentName}</span>
                <span className="text-xs font-mono text-white/30 ml-auto">Executing...</span>
                <div className="spinner" />
              </div>
              <div className="text-sm text-white/60 font-mono leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
                {streamingText || <span className="text-white/20">Initializing...</span>}
                <span className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 animate-pulse" />
              </div>
            </motion.div>
          )}

          {/* Selected output */}
          {activeOutput && outputs[activeOutput] && (
            <motion.div
              key={activeOutput}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 border border-white/8"
            >
              {(() => {
                const task = tasks.find(t => t.id === activeOutput);
                const output = outputs[activeOutput];
                const html = extractHtml(output);
                return (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: `${task?.agentColor}15` }}>
                        {task?.agentIcon}
                      </div>
                      <span className="text-sm font-display font-semibold text-white">{task?.agentName}</span>
                      <CheckCircle2 className="w-4 h-4 text-green-400 ml-1" />
                      <div className="ml-auto flex items-center gap-2">
                        {html && (
                          <>
                            <button onClick={() => openHtml(html)} className="flex items-center gap-1 text-[11px] font-mono text-orange-400 bg-orange-500/8 border border-orange-500/15 px-2.5 py-1 rounded-lg hover:bg-orange-500/15 transition-all">
                              <Play className="w-3 h-3" /> Run
                            </button>
                            <button onClick={() => downloadHtml(html)} className="flex items-center gap-1 text-[11px] font-mono text-white/40 bg-white/4 border border-white/8 px-2.5 py-1 rounded-lg hover:bg-white/8 transition-all">
                              <Download className="w-3 h-3" /> Save
                            </button>
                          </>
                        )}
                        <button onClick={() => copyText(output)} className="flex items-center gap-1 text-[11px] font-mono text-white/40 bg-white/4 border border-white/8 px-2.5 py-1 rounded-lg hover:bg-white/8 transition-all">
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                      </div>
                    </div>

                    {html ? (
                      <iframe
                        srcDoc={html}
                        className="w-full h-72 rounded-xl border border-white/8 bg-white"
                        sandbox="allow-scripts"
                      />
                    ) : (
                      <div className="text-sm text-white/60 font-mono leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap">
                        {output}
                      </div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          )}

          {/* All done */}
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl p-5 border border-green-500/20 bg-green-500/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="font-display font-semibold text-white">Orchestration Complete</span>
              </div>
              <p className="text-xs text-white/40 font-mono mb-3">
                {tasks.length} agents completed · {rloSpent} RLO paid · Goal achieved
              </p>
              <div className="flex flex-wrap gap-2">
                {tasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => setActiveOutput(task.id)}
                    className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
                      activeOutput === task.id
                        ? 'text-white border-white/20 bg-white/8'
                        : 'text-white/40 border-white/8 hover:border-white/15'
                    }`}
                    style={{ color: activeOutput === task.id ? task.agentColor : undefined }}
                  >
                    {task.agentIcon} {task.agentName}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Waiting state */}
          {currentIdx === -1 && !done && activeOutput === null && (
            <div className="glass rounded-2xl p-12 border border-white/5 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-400 animate-pulse" />
              </div>
              <p className="text-white/40 text-sm font-mono">Agents initializing...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
