import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, Zap, RotateCcw, Copy, Play, Download, ArrowRight } from "lucide-react";
import { OrchestrationPlan, AgentTask, getAgentPrompt } from "@/lib/orchestrator";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

function extractHtml(text: string): string | null {
  const m = text.match(/```html\s*([\s\S]*?)```/);
  if (m) return m[1].trim();
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) return text.trim();
  return null;
}

async function runAgent(agentName: string, task: string, prev: string | undefined, onDelta: (t: string) => void): Promise<string> {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
    body: JSON.stringify({ messages: [{ role: 'user', content: task }], systemPrompt: getAgentPrompt(agentName, task, prev) }),
  });
  if (!resp.ok || !resp.body) throw new Error(`${resp.status}`);
  const reader = resp.body.getReader();
  const dec = new TextDecoder();
  let buf = '', full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf('\n')) !== -1) {
      let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;
      const j = line.slice(6).trim();
      if (j === '[DONE]') break;
      try { const chunk = JSON.parse(j).choices?.[0]?.delta?.content; if (chunk) { full += chunk; onDelta(chunk); } } catch { /* */ }
    }
  }
  return full;
}

export default function OrchestrationView({ plan, onReset }: { plan: OrchestrationPlan; onReset: () => void }) {
  const [tasks, setTasks] = useState<AgentTask[]>(plan.tasks);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [streamText, setStreamText] = useState('');
  const [done, setDone] = useState(false);
  const [rloSpent, setRloSpent] = useState(0);
  const [activeOut, setActiveOut] = useState<string | null>(null);
  const outRef = useRef<Record<string, string>>({});
  const streamRef = useRef('');

  useEffect(() => {
    let cancelled = false;
    async function run() {
      let prev: string | undefined;
      for (let i = 0; i < tasks.length; i++) {
        if (cancelled) return;
        const task = tasks[i];
        setCurrentIdx(i);
        setTasks(p => p.map((t, x) => x === i ? { ...t, status: 'paying', startTime: Date.now() } : t));
        await new Promise(r => setTimeout(r, 900));
        setTasks(p => p.map((t, x) => x === i ? { ...t, status: 'running' } : t));
        streamRef.current = '';
        setStreamText('');
        try {
          const out = await runAgent(task.agentName, task.task, prev, chunk => {
            streamRef.current += chunk;
            setStreamText(streamRef.current);
          });
          outRef.current[task.id] = out;
          setOutputs({ ...outRef.current });
          prev = out;
          setTasks(p => p.map((t, x) => x === i ? { ...t, status: 'done', endTime: Date.now() } : t));
          setRloSpent(p => p + task.rloCost);
          await new Promise(r => setTimeout(r, 300));
        } catch {
          outRef.current[task.id] = 'Agent encountered an error. Please try again.';
          setOutputs({ ...outRef.current });
          setTasks(p => p.map((t, x) => x === i ? { ...t, status: 'done' } : t));
        }
      }
      if (!cancelled) { setDone(true); setCurrentIdx(-1); setStreamText(''); setActiveOut(tasks[tasks.length - 1].id); }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="px-6 md:px-16 max-w-[1300px] mx-auto w-full pt-8 pb-24">

      {/* Goal bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 mb-8 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full soft-pulse flex-shrink-0" style={{ background: '#82586d' }} />
          <div className="min-w-0">
            <p className="text-xs font-mono mb-0.5" style={{ color: 'rgba(209,204,191,0.3)', letterSpacing: '0.1em' }}>ORCHESTRATING</p>
            <p className="font-display font-semibold truncate" style={{ color: '#e8e2d5' }}>"{plan.goal}"</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-mono" style={{ color: 'rgba(209,204,191,0.3)' }}>{tasks.length} agents · {plan.totalRlo} RLO</span>
          <button onClick={onReset} className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-xl transition-all" style={{ color: 'rgba(209,204,191,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(130,88,109,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}>
            <RotateCcw className="w-3 h-3" /> New Goal
          </button>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-5 gap-6">

        {/* Pipeline */}
        <div className="md:col-span-2">
          <p className="text-[10px] font-mono mb-4" style={{ color: 'rgba(209,204,191,0.25)', letterSpacing: '0.18em' }}>AGENT PIPELINE</p>

          {/* Orchestrator node */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl p-4 mb-2 noise" style={{ background: 'rgba(130,88,109,0.08)', border: '1px solid rgba(130,88,109,0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(130,88,109,0.2)', boxShadow: '0 0 16px rgba(130,88,109,0.3)' }}>🎯</div>
              <div className="flex-1">
                <p className="text-sm font-display font-semibold" style={{ color: '#e8e2d5' }}>Orchestrator</p>
                <p className="text-xs font-mono" style={{ color: '#82586d' }}>Planning · Hiring agents</p>
              </div>
              <div className="w-2 h-2 rounded-full" style={{ background: '#82586d', boxShadow: '0 0 6px #82586d' }} />
            </div>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[10px] font-mono" style={{ color: 'rgba(209,204,191,0.3)' }}>Hired {tasks.length} agents · Budget: {plan.totalRlo} RLO</p>
            </div>
          </motion.div>

          {/* Connector */}
          <div className="flex justify-center my-1">
            <div className="w-px h-5" style={{ background: 'linear-gradient(to bottom, rgba(130,88,109,0.4), transparent)' }} />
          </div>

          {tasks.map((task, i) => {
            const isActive = currentIdx === i;
            const isDone = task.status === 'done';
            const isPaying = task.status === 'paying';
            const hasOutput = !!outputs[task.id];

            return (
              <div key={task.id}>
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.06 }}
                  className="rounded-2xl p-4 cursor-pointer transition-all"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.04)' : isDone ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.015)',
                    border: isActive ? '1px solid rgba(130,88,109,0.3)' : isDone ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.04)',
                    opacity: !isActive && !isDone && !isPaying ? 0.5 : 1,
                    boxShadow: isActive ? '0 0 20px rgba(130,88,109,0.1)' : 'none',
                  }}
                  onClick={() => hasOutput && setActiveOut(task.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${task.agentColor}15`, boxShadow: (isDone || isActive) ? `0 0 12px ${task.agentColor}30` : 'none' }}>
                      {task.agentIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display font-semibold" style={{ color: '#e8e2d5' }}>{task.agentName}</p>
                      <p className="text-xs font-mono truncate" style={{ color: 'rgba(209,204,191,0.35)' }}>{task.task}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {isDone ? <CheckCircle2 className="w-4 h-4" style={{ color: '#86efac' }} />
                        : isPaying ? <span className="text-xs font-mono soft-pulse" style={{ color: '#fbbf24' }}>◎ {task.rloCost}</span>
                        : isActive ? <div className="spinner" />
                        : <Clock className="w-4 h-4" style={{ color: 'rgba(209,204,191,0.2)' }} />}
                    </div>
                  </div>

                  {(isPaying || isDone) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="text-[10px] font-mono" style={{ color: 'rgba(209,204,191,0.25)' }}>
                        {isDone ? '✓ Rialo escrow released' : '⏳ Processing...'}
                      </span>
                      <span className="text-[10px] font-mono" style={{ color: '#fbbf24' }}>{task.rloCost} RLO</span>
                    </motion.div>
                  )}

                  {hasOutput && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono" style={{ color: 'rgba(130,88,109,0.6)' }}>
                      <ArrowRight className="w-2.5 h-2.5" /> View output
                    </div>
                  )}
                </motion.div>

                {i < tasks.length - 1 && (
                  <div className="flex justify-center my-1">
                    <div className="w-px h-4" style={{ background: isDone ? 'linear-gradient(to bottom, rgba(134,239,172,0.4), rgba(130,88,109,0.2))' : 'rgba(255,255,255,0.04)' }} />
                  </div>
                )}
              </div>
            );
          })}

          {/* RLO tracker */}
          <AnimatePresence>
            {rloSpent > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-2xl p-4" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)' }}>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-mono" style={{ color: 'rgba(251,191,36,0.7)' }}>RLO Spent</span>
                  <span className="text-sm font-display font-bold" style={{ color: '#fbbf24' }}>{rloSpent} / {plan.totalRlo}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div animate={{ width: `${(rloSpent / plan.totalRlo) * 100}%` }}
                    className="h-full rounded-full" style={{ background: '#fbbf24' }} transition={{ duration: 0.5 }} />
                </div>
                <p className="text-[10px] font-mono mt-2" style={{ color: 'rgba(209,204,191,0.2)' }}>Simulated · Real on Rialo mainnet</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Output panel */}
        <div className="md:col-span-3">
          <p className="text-[10px] font-mono mb-4" style={{ color: 'rgba(209,204,191,0.25)', letterSpacing: '0.18em' }}>LIVE OUTPUT</p>

          {/* Streaming */}
          {currentIdx >= 0 && !done && (
            <motion.div key={`s${currentIdx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6 mb-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: `${tasks[currentIdx]?.agentColor}15` }}>
                  {tasks[currentIdx]?.agentIcon}
                </div>
                <span className="text-sm font-display font-semibold" style={{ color: '#e8e2d5' }}>{tasks[currentIdx]?.agentName}</span>
                <div className="spinner ml-auto" />
              </div>
              <div className="text-sm font-mono leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap" style={{ color: 'rgba(209,204,191,0.55)' }}>
                {streamText || <span style={{ color: 'rgba(209,204,191,0.2)' }}>Initializing agent...</span>}
                <span className="inline-block w-0.5 h-4 ml-0.5 soft-pulse" style={{ background: '#82586d' }} />
              </div>
            </motion.div>
          )}

          {/* Selected output */}
          {activeOut && outputs[activeOut] && (() => {
            const task = tasks.find(t => t.id === activeOut)!;
            const output = outputs[activeOut];
            const html = extractHtml(output);
            return (
              <motion.div key={activeOut} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: `${task.agentColor}15` }}>
                    {task.agentIcon}
                  </div>
                  <span className="text-sm font-display font-semibold" style={{ color: '#e8e2d5' }}>{task.agentName}</span>
                  <CheckCircle2 className="w-4 h-4 ml-1" style={{ color: '#86efac' }} />
                  <div className="ml-auto flex items-center gap-2">
                    {html && <>
                      <button onClick={() => { const b = new Blob([html],{type:'text/html'}); window.open(URL.createObjectURL(b),'_blank'); }}
                        className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-lg transition-all"
                        style={{ color: '#82586d', background: 'rgba(130,88,109,0.08)', border: '1px solid rgba(130,88,109,0.2)' }}>
                        <Play className="w-3 h-3" /> Run
                      </button>
                      <button onClick={() => { const b = new Blob([html],{type:'text/html'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download='nexus-output.html'; a.click(); }}
                        className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-lg transition-all"
                        style={{ color: 'rgba(209,204,191,0.5)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <Download className="w-3 h-3" /> Save
                      </button>
                    </>}
                    <button onClick={() => navigator.clipboard.writeText(output)}
                      className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-lg transition-all"
                      style={{ color: 'rgba(209,204,191,0.5)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                </div>

                {html
                  ? <iframe srcDoc={html} className="w-full h-80 rounded-xl border" sandbox="allow-scripts" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#fff' }} />
                  : <div className="text-sm font-mono leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap" style={{ color: 'rgba(209,204,191,0.6)' }}>{output}</div>
                }
              </motion.div>
            );
          })()}

          {/* Done summary */}
          {done && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl p-5" style={{ background: 'rgba(134,239,172,0.04)', border: '1px solid rgba(134,239,172,0.12)' }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5" style={{ color: '#86efac' }} />
                <span className="font-display font-semibold" style={{ color: '#e8e2d5' }}>Orchestration Complete</span>
              </div>
              <p className="text-xs font-mono mb-4" style={{ color: 'rgba(209,204,191,0.35)' }}>
                {tasks.length} agents · {rloSpent} RLO paid · All tasks delivered
              </p>
              <div className="flex flex-wrap gap-2">
                {tasks.map(t => (
                  <button key={t.id} onClick={() => setActiveOut(t.id)}
                    className="text-xs font-mono px-3.5 py-2 rounded-xl transition-all"
                    style={{
                      color: activeOut === t.id ? t.agentColor : 'rgba(209,204,191,0.45)',
                      background: activeOut === t.id ? `${t.agentColor}10` : 'rgba(255,255,255,0.03)',
                      border: activeOut === t.id ? `1px solid ${t.agentColor}30` : '1px solid rgba(255,255,255,0.07)',
                    }}>
                    {t.agentIcon} {t.agentName}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Waiting */}
          {currentIdx === -1 && !done && !activeOut && (
            <div className="rounded-2xl p-16 flex flex-col items-center justify-center text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(130,88,109,0.1)', border: '1px solid rgba(130,88,109,0.15)' }}>
                <Zap className="w-5 h-5 soft-pulse" style={{ color: '#82586d' }} />
              </div>
              <p className="text-sm font-mono" style={{ color: 'rgba(209,204,191,0.3)' }}>Agents initializing...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
