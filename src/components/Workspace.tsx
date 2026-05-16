import { useState, useRef, useCallback } from 'react';
import { Send, Maximize2, Copy, Download, Play, X, RotateCcw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const AGENTS_CONFIG = [
  { name: 'Analyst Agent', icon: '🧠', color: '#a78bfa', desc: 'Analyzing your query', prompt: `You are a senior analyst. Break down complex topics with structure and clarity. Format with ## headers, bullet points, bold key terms. NEVER invent facts. If uncertain, say so. Be thorough but scannable.` },
  { name: 'Content Agent', icon: '✍️', color: '#60a5fa', desc: 'Crafting structured content', prompt: `You are a top content strategist. Write sharp, high-signal content. Format X threads with: 🧵 hook, numbered tweets (1/, 2/...), strong CTA. Under 280 chars each. Separated by ---. No buzzwords.` },
  { name: 'Game Builder', icon: '🎮', color: '#fb923c', desc: 'Building interactive experience', prompt: `You are an expert game developer and UI designer. ALWAYS return a complete single-file HTML game with inline CSS and JavaScript.

DESIGN REQUIREMENTS:
- Beautiful modern UI with rich gradients, glassmorphism effects, and smooth animations
- Premium color palette — avoid basic colors
- Large, readable typography with Google Fonts (load from CDN)
- Polished buttons with hover effects and transitions
- Satisfying visual feedback on interactions
- Mobile-responsive layout
- Background gradient or pattern — never plain white/black

GAME REQUIREMENTS:
- Fully playable and interactive
- Score tracking with animated counter
- Clear win/lose states with celebratory animations
- Restart button with smooth transition
- Progress indicators
- Sound feedback using Web Audio API (subtle tones)

For QUIZ games specifically:
- Beautiful question cards with smooth reveal animations
- 4 answer options with distinct hover states
- Instant green/red feedback with explanation
- Score displayed prominently
- Results screen with performance breakdown
- Confetti or particle effect on completion

OUTPUT FORMAT:
First: complete HTML code wrapped in \`\`\`html
Then: one sentence description

NO external libraries except Google Fonts. Everything inline.` },
];

const SUGGESTIONS = [
  "What is a noun? Explain and make it fun to learn.",
  "Research the Rialo agent economy and create content",
  "Build a quiz about how blockchain works",
  "Debate: AI agents vs traditional software",
  "Analyze the concept of decentralized identity",
  "Create an educational game about Web3",
];

interface AgentState {
  name: string;
  icon: string;
  color: string;
  status: 'idle' | 'running' | 'done' | 'error';
  output: string;
  progress: number;
}

function extractHtml(text: string): string | null {
  const m = text.match(/```html\s*([\s\S]*?)```/);
  if (m) return m[1].trim();
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) return text.trim();
  return null;
}

async function streamAgent(agentName: string, prompt: string, systemPrompt: string,
  onChunk: (t: string) => void, onDone: () => void, onError: () => void) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], systemPrompt }),
    });
    if (!resp.ok || !resp.body) { onError(); return; }
    const reader = resp.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
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
        if (j === '[DONE]') { onDone(); return; }
        try { const c = JSON.parse(j).choices?.[0]?.delta?.content; if (c) onChunk(c); } catch { /* */ }
      }
    }
    onDone();
  } catch { onError(); }
}

export default function Workspace({ userName }: { userName?: string }) {
  const [input, setInput] = useState('');
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [running, setRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState<{ name: string; html: string } | null>(null);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const outputRefs = useRef<Record<string, string>>({});

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const runAgents = useCallback(async () => {
    if (!input.trim() || running) return;
    const prompt = input.trim();
    setInput('');
    setRunning(true);
    outputRefs.current = {};

    const initial: AgentState[] = AGENTS_CONFIG.map(a => ({
      name: a.name, icon: a.icon, color: a.color,
      status: 'idle', output: '', progress: 0,
    }));
    setAgents(initial);

    // Run all agents in parallel
    await Promise.all(AGENTS_CONFIG.map((cfg, i) => new Promise<void>(resolve => {
      // Stagger start
      setTimeout(() => {
        setAgents(prev => prev.map((a, x) => x === i ? { ...a, status: 'running', progress: 5 } : a));
        outputRefs.current[cfg.name] = '';

        // Simulate progress
        const progressInterval = setInterval(() => {
          setAgents(prev => prev.map((a, x) => {
            if (x !== i || a.status !== 'running') return a;
            return { ...a, progress: Math.min(a.progress + Math.random() * 8, 90) };
          }));
        }, 400);

        streamAgent(
          cfg.name, prompt, cfg.prompt,
          (chunk) => {
            outputRefs.current[cfg.name] += chunk;
            setAgents(prev => prev.map((a, x) => x === i ? { ...a, output: outputRefs.current[cfg.name] } : a));
          },
          () => {
            clearInterval(progressInterval);
            setAgents(prev => prev.map((a, x) => x === i ? { ...a, status: 'done', progress: 100 } : a));
            resolve();
          },
          () => {
            clearInterval(progressInterval);
            setAgents(prev => prev.map((a, x) => x === i ? { ...a, status: 'error', progress: 0 } : a));
            resolve();
          }
        );
      }, i * 300);
    })));

    setRunning(false);
  }, [input, running]);

  const getHtml = (agent: AgentState) => extractHtml(agent.output);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', padding: '28px 32px' }}>

      {/* Fullscreen game overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#08090f', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(14,13,11,0.95)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🎮</span>
                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: '#e8e2d5', fontSize: 14 }}>{fullscreen.name} — Live Preview</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => { const b = new Blob([fullscreen.html],{type:'text/html'}); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download='game.html'; a.click(); }}>
                  <Download size={12} style={{ display: 'inline', marginRight: 4 }} />Download
                </button>
                <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => setFullscreen(null)}>
                  <X size={12} style={{ display: 'inline', marginRight: 4 }} />Exit
                </button>
              </div>
            </div>
            <iframe srcDoc={fullscreen.html} sandbox="allow-scripts allow-same-origin" style={{ flex: 1, border: 'none', background: 'white' }} title="Game preview" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Space Grotesk', color: '#e8e2d5', marginBottom: 4 }}>
          {greeting}{userName ? `, ${userName}` : ''} 👋
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(209,204,191,0.45)' }}>What shall we build, learn, or explore today?</p>
      </div>

      {/* Input */}
      <div style={{ marginBottom: 24, position: 'relative' }}>
        <textarea
          className="ai-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runAgents(); } }}
          placeholder="What do you want to create, learn, or ask?"
          rows={3}
          style={{ width: '100%', paddingRight: 60 }}
        />
        <button
          className="btn-rose"
          onClick={runAgents}
          disabled={!input.trim() || running}
          style={{ position: 'absolute', right: 12, bottom: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Send size={14} />
          {running ? 'Running...' : 'Send'}
        </button>
      </div>

      {/* Suggestions */}
      {agents.length === 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'rgba(209,204,191,0.25)', letterSpacing: '0.1em', marginBottom: 10 }}>TRY THESE</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => setInput(s)} className="btn-ghost" style={{ fontSize: 12 }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Agent Cards */}
      {agents.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'rgba(209,204,191,0.25)', letterSpacing: '0.1em' }}>ACTIVE AGENTS</p>
            {!running && <button className="btn-ghost" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => { setAgents([]); setInput(''); }}>
              <RotateCcw size={10} />New prompt
            </button>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {agents.map(agent => {
              const html = getHtml(agent);
              const isExpanded = expandedAgent === agent.name;
              return (
                <motion.div key={agent.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className={`agent-card ${agent.status === 'running' ? 'active' : ''}`}
                  style={{ gridColumn: isExpanded ? '1 / -1' : undefined }}>

                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${agent.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, border: `1px solid ${agent.color}20`, flexShrink: 0 }}>
                      {agent.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Space Grotesk', color: '#e8e2d5' }}>{agent.name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(209,204,191,0.4)' }}>
                        {agent.status === 'running' ? AGENTS_CONFIG.find(a => a.name === agent.name)?.desc + '...' :
                         agent.status === 'done' ? 'Output ready' :
                         agent.status === 'error' ? 'Failed — retry' : 'Waiting'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {agent.status === 'done' && <CheckCircle2 size={14} style={{ color: '#86efac' }} />}
                      {agent.status === 'running' && <div className="spin" style={{ width: 14, height: 14, border: `1.5px solid ${agent.color}30`, borderTopColor: agent.color, borderRadius: '50%' }} />}
                      {agent.status === 'done' && (
                        <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => setExpandedAgent(isExpanded ? null : agent.name)}>
                          <Maximize2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {(agent.status === 'running' || agent.status === 'done') && (
                    <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, marginBottom: 12, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: `linear-gradient(90deg, ${agent.color}, ${agent.color}99)`, borderRadius: 1, width: `${agent.progress}%`, transition: 'width 0.4s ease' }} />
                    </div>
                  )}

                  {/* Output */}
                  {agent.output && (
                    <div>
                      {html ? (
                        <div>
                          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 10 }}>
                            <iframe srcDoc={html} sandbox="allow-scripts" style={{ width: '100%', height: isExpanded ? 500 : 220, border: 'none', background: 'white', display: 'block' }} title="Game" />
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-rose" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', fontSize: 12 }}
                              onClick={() => setFullscreen({ name: agent.name, html })}>
                              <Play size={12} />Fullscreen
                            </button>
                            <button className="btn-ghost" style={{ padding: '8px 12px' }} onClick={() => { const b = new Blob([html],{type:'text/html'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download='game.html'; a.click(); }}>
                              <Download size={12} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 12, color: 'rgba(209,204,191,0.6)', lineHeight: 1.7, maxHeight: isExpanded ? 'none' : 140, overflow: isExpanded ? 'visible' : 'hidden', fontFamily: 'Inter', whiteSpace: 'pre-wrap' }}>
                            {agent.output}
                            {agent.status === 'running' && <span style={{ display: 'inline-block', width: 2, height: 14, background: agent.color, marginLeft: 2 }} className="pulse-dot" />}
                          </div>
                          {agent.status === 'done' && (
                            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                              <button className="btn-ghost" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => navigator.clipboard.writeText(agent.output)}>
                                <Copy size={10} />Copy
                              </button>
                              <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => setExpandedAgent(isExpanded ? null : agent.name)}>
                                {isExpanded ? 'Show less' : 'View full output →'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
