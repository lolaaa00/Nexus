import { useState, useRef, useCallback } from 'react';
import { Send, Maximize2, Minimize2, X, Download, Copy, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const TOOLS = [
  {
    id: 'lens',
    name: 'Lens',
    tagline: 'Understand anything deeply.',
    icon: '🔍',
    color: '#a78bfa',
    size: 'small',
    prompt: `You are a clear, precise thinker. Analyze and explain any topic with depth and structure. Use ## headers, bullet points, bold key terms. Never fabricate facts. If uncertain, say so. Be thorough but scannable. Avoid filler words. Write like a brilliant friend explaining something important.`,
  },
  {
    id: 'studio',
    name: 'Studio',
    tagline: 'Shape ideas into content.',
    icon: '✍️',
    color: '#60a5fa',
    size: 'small',
    prompt: `You are a sharp content creator. Turn any idea into compelling content. For threads: 🧵 strong hook, numbered tweets (1/, 2/...), punchy CTA. Each under 280 chars, separated by ---. For articles: clear structure with headers. No buzzwords. Write like a human, not a robot.`,
  },
  {
    id: 'playground',
    name: 'Playground',
    tagline: 'Turn ideas into interactive experiences.',
    icon: '🎮',
    color: '#f59e0b',
    size: 'hero',
    prompt: `You are a world-class interactive experience designer and developer.

Your output is always a complete, single-file HTML experience that is:
- Visually stunning with premium design
- Fully interactive and engaging
- Cinematic in feel — not a basic webpage

VISUAL REQUIREMENTS:
- Use Google Fonts (Playfair Display, DM Sans, or Space Grotesk) loaded from CDN
- Rich gradient backgrounds (not plain colors)
- Glassmorphism panels with backdrop-filter blur
- Smooth CSS animations on all interactions
- Custom color palette that feels premium (avoid default blues/greys)
- Large, beautiful typography with proper hierarchy
- Satisfying hover states and micro-animations
- Mobile responsive

FOR QUIZ/LEARNING EXPERIENCES:
- Beautiful card reveal animations
- 4 answer options with distinct styles
- Immediate visual feedback (green glow for correct, red for wrong)
- Short explanation after each answer
- Score displayed with large animated counter
- Progress bar showing completion
- Celebratory end screen with confetti (CSS particles)
- "Play again" with smooth transition
- Sound feedback via Web Audio API (subtle pleasant tones)

FOR GAMES:
- Polished game UI with score, lives, timer
- Smooth gameplay animations
- Win/lose states with cinematic presentation
- Particle effects on key moments
- High score tracking via localStorage

IMPORTANT: Output ONLY the complete HTML code first (wrapped in triple backtick html), then ONE sentence description. No other text before the code.`,
  },
];

const SUGGESTIONS = [
  { text: "What is a neuron? Make it interactive.", tool: 'playground' },
  { text: "Explain blockchain to a 12-year-old", tool: 'lens' },
  { text: "Write a thread about the future of AI agents", tool: 'studio' },
  { text: "Build a quiz about the solar system", tool: 'playground' },
  { text: "Break down how Rialo's SCALE protocol works", tool: 'lens' },
  { text: "Turn the concept of compounding into a game", tool: 'playground' },
];

interface ToolState {
  id: string;
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

async function streamTool(prompt: string, systemPrompt: string, onChunk: (t: string) => void, onDone: () => void, onError: () => void) {
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

export default function Workspace() {
  const [input, setInput] = useState('');
  const [toolStates, setToolStates] = useState<ToolState[]>([]);
  const [running, setRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState<{ name: string; html: string } | null>(null);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const outputRefs = useRef<Record<string, string>>({});

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const run = useCallback(async () => {
    if (!input.trim() || running) return;
    const prompt = input.trim();
    setInput('');
    setRunning(true);
    outputRefs.current = {};

    setToolStates(TOOLS.map(t => ({ id: t.id, name: t.name, icon: t.icon, color: t.color, status: 'idle', output: '', progress: 0 })));

    await Promise.all(TOOLS.map((tool, i) => new Promise<void>(resolve => {
      setTimeout(() => {
        setToolStates(p => p.map((t, x) => x === i ? { ...t, status: 'running', progress: 8 } : t));
        outputRefs.current[tool.id] = '';

        const piv = setInterval(() => {
          setToolStates(p => p.map((t, x) => {
            if (x !== i || t.status !== 'running') return t;
            return { ...t, progress: Math.min(t.progress + Math.random() * 10, 88) };
          }));
        }, 500);

        streamTool(prompt, tool.prompt,
          chunk => {
            outputRefs.current[tool.id] += chunk;
            setToolStates(p => p.map((t, x) => x === i ? { ...t, output: outputRefs.current[tool.id] } : t));
          },
          () => { clearInterval(piv); setToolStates(p => p.map((t, x) => x === i ? { ...t, status: 'done', progress: 100 } : t)); resolve(); },
          () => { clearInterval(piv); setToolStates(p => p.map((t, x) => x === i ? { ...t, status: 'error', progress: 0 } : t)); resolve(); }
        );
      }, i * 250);
    })));

    setRunning(false);
  }, [input, running]);

  const getHtml = (ts: ToolState) => extractHtml(ts.output);
  const hasResults = toolStates.length > 0;

  return (
    <div style={{ flex: 1, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

      {/* Fullscreen */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#08090f', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(12,11,9,0.95)', backdropFilter: 'blur(20px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🎮</span>
                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: '#e8e2d5', fontSize: 13 }}>Playground — {fullscreen.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-soft" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => { const b = new Blob([fullscreen.html],{type:'text/html'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download='experience.html'; a.click(); }}>
                  <Download size={11} /> Save
                </button>
                <button className="btn-soft" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setFullscreen(null)}>
                  <Minimize2 size={11} /> Exit
                </button>
              </div>
            </div>
            <iframe srcDoc={fullscreen.html} sandbox="allow-scripts allow-same-origin" style={{ flex: 1, border: 'none' }} title="Experience" />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding: '28px 36px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>

        {/* Greeting */}
        {!hasResults && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk', color: '#e8e2d5', marginBottom: 6, letterSpacing: '-0.025em' }}>
              {greeting} 👋
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(232,226,213,0.4)', letterSpacing: '-0.01em' }}>
              What shall we build, learn, or explore today?
            </p>
          </motion.div>
        )}

        {/* Input */}
        <div style={{ position: 'relative', marginBottom: hasResults ? 20 : 28 }}>
          <textarea
            className="main-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); run(); } }}
            placeholder="Describe what you want to understand, create, or experience..."
            rows={hasResults ? 2 : 3}
          />
          <button className="btn-primary" onClick={run} disabled={!input.trim() || running}
            style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px' }}>
            <Send size={13} />
            {running ? 'Working...' : 'Create'}
          </button>
        </div>

        {/* Suggestions */}
        {!hasResults && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTIONS.map(s => (
                <button key={s.text} onClick={() => setInput(s.text)} className="btn-soft"
                  style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px' }}>
                  <span style={{ fontSize: 12 }}>{TOOLS.find(t => t.id === s.tool)?.icon}</span>
                  {s.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tool intro cards (before results) */}
        {!hasResults && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'rgba(232,226,213,0.2)', letterSpacing: '0.12em', marginBottom: 14 }}>YOUR TOOLS</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto', gap: 14 }}>

              {/* Playground — hero, full width */}
              <div className="tool-card hero" style={{ gridColumn: '1 / -1', padding: 28, cursor: 'pointer' }}
                onClick={() => setInput('Build a beautiful interactive quiz about how the internet works')}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎮</div>
                      <div>
                        <p style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk', color: '#e8e2d5', letterSpacing: '-0.02em' }}>Playground</p>
                        <p style={{ fontSize: 12, color: 'rgba(245,158,11,0.7)' }}>Interactive experiences</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: 'rgba(232,226,213,0.5)', lineHeight: 1.6, maxWidth: 420 }}>
                      Describe an idea — get back something you can play, interact with, and share. Quizzes, games, simulations. Built in seconds.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 20 }}>
                    {['Quiz', 'Game', 'Sim'].map(tag => (
                      <span key={tag} style={{ fontSize: 10, fontFamily: 'Space Mono', padding: '3px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', color: 'rgba(245,158,11,0.6)', border: '1px solid rgba(245,158,11,0.15)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(245,158,11,0.6)', fontSize: 12, fontWeight: 500 }}>
                  <span>Try it</span> <ArrowRight size={13} />
                </div>
              </div>

              {/* Lens */}
              <div className="tool-card" style={{ padding: 22 }} onClick={() => setInput('Explain how neural networks learn')}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 14 }}>🔍</div>
                <p style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Space Grotesk', color: '#e8e2d5', marginBottom: 6, letterSpacing: '-0.01em' }}>Lens</p>
                <p style={{ fontSize: 13, color: 'rgba(232,226,213,0.45)', lineHeight: 1.6 }}>Understand anything deeply. Ask it a question, get a structured answer that actually makes sense.</p>
              </div>

              {/* Studio */}
              <div className="tool-card" style={{ padding: 22 }} onClick={() => setInput('Write a thread about the future of creative work')}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 14 }}>✍️</div>
                <p style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Space Grotesk', color: '#e8e2d5', marginBottom: 6, letterSpacing: '-0.01em' }}>Studio</p>
                <p style={{ fontSize: 13, color: 'rgba(232,226,213,0.45)', lineHeight: 1.6 }}>Shape raw ideas into structured content. Threads, articles, briefs — ready to publish.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {hasResults && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'rgba(232,226,213,0.2)', letterSpacing: '0.12em' }}>OUTPUT</p>
              {!running && (
                <button className="btn-soft" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => { setToolStates([]); }}>
                  <RotateCcw size={10} /> New prompt
                </button>
              )}
            </div>

            {/* Playground result — hero */}
            {(() => {
              const pg = toolStates.find(t => t.id === 'playground');
              if (!pg) return null;
              const html = getHtml(pg);
              const isExpanded = expandedTool === 'playground';
              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: 16, borderRadius: 20, border: `1px solid ${pg.status === 'running' ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.15)'}`, background: 'rgba(245,158,11,0.04)', overflow: 'hidden', transition: 'border-color 0.3s', boxShadow: pg.status === 'running' ? '0 0 40px rgba(245,158,11,0.08)' : 'none' }}>
                  <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>🎮</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Space Grotesk', color: '#e8e2d5' }}>Playground</p>
                        {pg.status === 'done' && <CheckCircle2 size={13} style={{ color: '#86efac' }} />}
                        {pg.status === 'running' && <div className="spin" style={{ width: 12, height: 12, border: '1.5px solid rgba(245,158,11,0.3)', borderTopColor: '#f59e0b', borderRadius: '50%' }} />}
                      </div>
                      <p style={{ fontSize: 11, color: 'rgba(232,226,213,0.35)' }}>
                        {pg.status === 'running' ? 'Building your experience...' : pg.status === 'done' ? 'Interactive experience ready' : 'Waiting'}
                      </p>
                    </div>
                    {pg.status === 'done' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-soft" style={{ fontSize: 11 }} onClick={() => setExpandedTool(isExpanded ? null : 'playground')}>
                          {isExpanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                        </button>
                        {html && <button className="btn-primary" style={{ fontSize: 12, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => html && setFullscreen({ name: input.slice(0, 40), html })}>
                          Fullscreen
                        </button>}
                      </div>
                    )}
                  </div>

                  {(pg.status === 'running' || pg.status === 'done') && (
                    <div className="progress-track" style={{ margin: '0' }}>
                      <div className="progress-fill" style={{ width: `${pg.progress}%`, background: 'linear-gradient(90deg, rgba(245,158,11,0.6), rgba(245,158,11,0.9))' }} />
                    </div>
                  )}

                  {html ? (
                    <div style={{ padding: 0 }}>
                      <iframe srcDoc={html} sandbox="allow-scripts allow-same-origin" style={{ width: '100%', height: isExpanded ? 560 : 300, border: 'none', display: 'block' }} title="Experience" />
                    </div>
                  ) : pg.status === 'running' && pg.output && (
                    <div style={{ padding: '16px 22px' }}>
                      <div className="output-text" style={{ fontSize: 12, maxHeight: 80, overflow: 'hidden', opacity: 0.4 }}>
                        {pg.output.slice(0, 200)}...
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })()}

            {/* Lens + Studio side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {toolStates.filter(t => t.id !== 'playground').map((ts, i) => {
                const isExpanded = expandedTool === ts.id;
                const tool = TOOLS.find(t => t.id === ts.id)!;
                return (
                  <motion.div key={ts.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.025)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{ts.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Space Grotesk', color: '#e8e2d5' }}>{ts.name}</p>
                          {ts.status === 'done' && <CheckCircle2 size={12} style={{ color: '#86efac' }} />}
                          {ts.status === 'running' && <div className="spin" style={{ width: 11, height: 11, border: `1.5px solid ${ts.color}30`, borderTopColor: ts.color, borderRadius: '50%' }} />}
                        </div>
                      </div>
                      {ts.status === 'done' && (
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button className="btn-soft" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => navigator.clipboard.writeText(ts.output)}>
                            <Copy size={10} />
                          </button>
                          <button className="btn-soft" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => setExpandedTool(isExpanded ? null : ts.id)}>
                            <Maximize2 size={10} />
                          </button>
                        </div>
                      )}
                    </div>

                    {(ts.status === 'running' || ts.status === 'done') && (
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${ts.progress}%`, background: `linear-gradient(90deg, ${ts.color}60, ${ts.color})` }} />
                      </div>
                    )}

                    {ts.output && (
                      <div style={{ padding: '14px 18px' }}>
                        <div className="output-text" style={{ maxHeight: isExpanded ? 'none' : 160, overflow: isExpanded ? 'visible' : 'hidden' }}>
                          {ts.output}
                          {ts.status === 'running' && <span style={{ display: 'inline-block', width: 2, height: 13, background: ts.color, marginLeft: 2 }} className="dot-pulse" />}
                        </div>
                        {ts.status === 'done' && !isExpanded && ts.output.length > 400 && (
                          <button className="btn-soft" style={{ marginTop: 10, fontSize: 11 }} onClick={() => setExpandedTool(ts.id)}>
                            Read more →
                          </button>
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
    </div>
  );
}
