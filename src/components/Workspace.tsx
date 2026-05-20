import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, PenLine, Play, Scale, Send, Maximize2, Minimize2, Download, Copy, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addHistory } from '@/lib/storage';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

function ToolIcon({ id, size = 16 }: { id: string; size?: number }) {
  const p = { size, strokeWidth: 1.7 } as const;
  if (id === 'lens')       return <Search {...p} />;
  if (id === 'studio')     return <PenLine {...p} />;
  if (id === 'playground') return <Play {...p} />;
  if (id === 'debate')     return <Scale {...p} />;
  return null;
}

const TOOLS = [
  {
    id: 'lens',
    name: 'Lens',
    tagline: 'Understand any concept clearly.',
    color: '#82586d',
    size: 'small',
    prompt: `You are a world-class educator. Given any topic, produce a clear structured educational breakdown.

Use this exact format:

# [Topic]
*One crisp sentence defining what this is.*

---

## The Simple Version
2–3 sentences anyone could understand. Plain language only.

## Core Ideas
5 numbered points. Each is one key concept in a single clear sentence. **Bold** the concept name.

## How It Works
A clear explanation with one real-world analogy. Be specific.

## Why It Matters
2–3 sentences on significance or real-world applications.

## Examples
2–3 concrete illustrative examples. Each clearly labeled.

---

Write like a brilliant teacher. No filler. Be precise.`,
  },
  {
    id: 'studio',
    name: 'Studio',
    tagline: 'Structure information into study material.',
    color: '#7d7060',
    size: 'small',
    prompt: `You are an expert learning content designer. Transform any topic into clean structured study material.

Use this exact format:

# [Topic]: Study Notes

## Summary
3–4 sentences capturing the full picture.

## Core Concepts
Number each. Format: **Concept Name** — one clear sentence. Include 5–6 concepts.

## Key Vocabulary
| Term | Meaning |
|------|---------|
4–6 terms with precise accessible definitions.

## Essential Takeaways
3–4 bullet points — the things that absolutely must be remembered.

## Common Misconceptions
2–3 things people often misunderstand, with corrections.

## Self-Check Questions
3 reflection questions (no answers).

---
Make every line count. No filler.`,
  },
  {
    id: 'playground',
    name: 'Playground',
    tagline: 'Turn ideas into interactive experiences.',
    color: '#5e7a6e',
    size: 'hero',
    prompt: `You are building a single-file HTML educational quiz. Output ONLY the HTML code block first, then one sentence description. Nothing before the code.

SETUP:
- Load font: <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
- CSS variables on :root — --bg:#f0ece3; --surface:#fff; --primary:#82586d; --text:#2d1f28; --muted:#7a6570; --ok:#22c55e; --ok-bg:#f0fdf4; --ok-text:#166534; --bad:#ef4444; --bad-bg:#fef2f2; --bad-text:#991b1b
- body: font-family:'Plus Jakarta Sans',sans-serif; background:var(--bg); display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px; margin:0
- .card: max-width:680px; width:100%; background:var(--surface); border-radius:20px; padding:36px; box-shadow:0 2px 20px rgba(0,0,0,0.07)

THREE SCREENS — only one visible at a time (others display:none), each is a div.screen:

SCREEN id="intro":
  h1 topic title (28px,700,var(--text))
  p description — 2 sentences about what will be learned (15px,var(--muted),line-height:1.7)
  p "X questions" info line (12px,var(--muted))
  button id="beginBtn" "Begin" — width:100%; height:50px; background:var(--primary); color:white; border:none; border-radius:12px; font:600 14px 'Plus Jakarta Sans'; cursor:pointer

SCREEN id="quiz":
  div id="progressBar" — height:3px; background:var(--primary); border-radius:2px; margin-bottom:20px; transition:width 0.3s ease; width:0%
  p id="counter" — font-size:11px; text-transform:uppercase; letter-spacing:0.07em; color:var(--muted); margin-bottom:16px
  p id="questionText" — font-size:20px; font-weight:600; color:var(--text); line-height:1.5; margin-bottom:24px
  div id="options" — container for 4 option divs
  div id="feedback" — display:none; border-left:3px solid; padding:12px 16px; border-radius:0 8px 8px 0; font-size:13px; line-height:1.65; margin-top:16px
  button id="continueBtn" "Continue →" — display:none; width:100%; height:44px; background:var(--primary); color:white; border:none; border-radius:12px; font:600 13px 'Plus Jakarta Sans'; cursor:pointer; margin-top:16px

SCREEN id="results":
  div — text-align:center; margin-bottom:24px
    p id="scoreDisplay" — font-size:56px; font-weight:700; color:var(--primary); margin-bottom:8px
    p id="gradeLabel" — font-size:18px; font-weight:500; color:var(--text)
  div id="missedList" — margin:24px 0
  button id="retryBtn" "Try Again" — width:100%; height:50px; background:var(--primary); color:white; border:none; border-radius:12px; font:600 14px 'Plus Jakarta Sans'; cursor:pointer

OPTION STYLE (apply inline or via class):
  border:1.5px solid rgba(130,88,109,0.18); padding:14px 18px; border-radius:12px; margin-bottom:10px; cursor:pointer; font-size:15px; font-weight:500; color:var(--text); width:100%; text-align:left; background:white; transition:all 0.18s; display:block
  Hover: border-color:rgba(130,88,109,0.4); background:rgba(130,88,109,0.04)

JAVASCRIPT:
const questions = [
  /* GENERATE 6-8 questions about the specific topic given by the user */
  /* Each: { question: string, options: [string,string,string,string], correct: 0|1|2|3, explanation: string } */
  /* Progress from foundational to applied. One clearly correct answer. Plausible wrong options. Explanation must teach why correct is right. */
];

let current = 0, score = 0, missed = [], answered = false;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

function showQuestion(n) {
  answered = false;
  const q = questions[n];
  const total = questions.length;
  document.getElementById('progressBar').style.width = (n / total * 100) + '%';
  document.getElementById('counter').textContent = 'Question ' + (n+1) + ' of ' + total;
  document.getElementById('questionText').textContent = q.question;
  const optContainer = document.getElementById('options');
  optContainer.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.style.cssText = 'border:1.5px solid rgba(130,88,109,0.18);padding:14px 18px;border-radius:12px;margin-bottom:10px;cursor:pointer;font-size:15px;font-weight:500;color:#2d1f28;width:100%;text-align:left;background:white;transition:all 0.18s;display:block;font-family:Plus Jakarta Sans,sans-serif';
    btn.onmouseover = () => { if(!answered){btn.style.borderColor='rgba(130,88,109,0.4)';btn.style.background='rgba(130,88,109,0.04)';} };
    btn.onmouseout = () => { if(!answered){btn.style.borderColor='rgba(130,88,109,0.18)';btn.style.background='white';} };
    btn.onclick = () => selectAnswer(i);
    optContainer.appendChild(btn);
  });
  const fb = document.getElementById('feedback');
  fb.style.display = 'none';
  document.getElementById('continueBtn').style.display = 'none';
}

function selectAnswer(idx) {
  if (answered) return;
  answered = true;
  const q = questions[current];
  const opts = document.getElementById('options').querySelectorAll('button');
  opts.forEach(b => { b.style.cursor = 'default'; b.onmouseover = null; b.onmouseout = null; });
  const correct = q.correct;
  const fb = document.getElementById('feedback');
  if (idx === correct) {
    score++;
    opts[idx].style.borderColor = '#22c55e';
    opts[idx].style.background = '#f0fdf4';
    opts[idx].style.color = '#166534';
    fb.style.cssText = 'display:block;border-left:3px solid #22c55e;padding:12px 16px;border-radius:0 8px 8px 0;font-size:13px;line-height:1.65;margin-top:16px;background:#f0fdf4;color:#166534';
    fb.textContent = 'Correct — ' + q.explanation;
  } else {
    opts[idx].style.borderColor = '#ef4444';
    opts[idx].style.background = '#fef2f2';
    opts[idx].style.color = '#991b1b';
    opts[correct].style.borderColor = '#22c55e';
    opts[correct].style.background = '#f0fdf4';
    opts[correct].style.color = '#166534';
    missed.push({ question: q.question, correct: q.options[correct], explanation: q.explanation });
    fb.style.cssText = 'display:block;border-left:3px solid #ef4444;padding:12px 16px;border-radius:0 8px 8px 0;font-size:13px;line-height:1.65;margin-top:16px;background:#fef2f2;color:#991b1b';
    fb.textContent = 'The correct answer is "' + q.options[correct] + '" — ' + q.explanation;
  }
  document.getElementById('continueBtn').style.display = 'block';
}

function nextQuestion() {
  current++;
  if (current >= questions.length) renderResults();
  else showQuestion(current);
}

function renderResults() {
  const pct = score / questions.length;
  document.getElementById('scoreDisplay').textContent = score + ' / ' + questions.length;
  document.getElementById('gradeLabel').textContent = pct >= 0.8 ? 'Excellent!' : pct >= 0.6 ? 'Well done!' : 'Keep going!';
  const ml = document.getElementById('missedList');
  ml.innerHTML = '';
  if (missed.length > 0) {
    const h = document.createElement('p');
    h.textContent = 'Review your mistakes';
    h.style.cssText = 'font-size:13px;font-weight:600;color:#2d1f28;margin-bottom:12px;padding-top:16px;border-top:1px solid rgba(130,88,109,0.1)';
    ml.appendChild(h);
    missed.forEach(m => {
      const d = document.createElement('div');
      d.style.cssText = 'margin-bottom:14px;padding:14px 16px;background:rgba(130,88,109,0.04);border-radius:10px;border:1px solid rgba(130,88,109,0.1)';
      d.innerHTML = '<p style="font-size:13px;color:rgba(45,31,40,0.6);margin-bottom:6px">' + m.question + '</p><p style="font-size:12px;color:#166534;font-weight:600;margin-bottom:4px">Correct: ' + m.correct + '</p><p style="font-size:12px;color:rgba(45,31,40,0.5);line-height:1.6">' + m.explanation + '</p>';
      ml.appendChild(d);
    });
  }
  showScreen('results');
}

function retry() {
  current = 0; score = 0; missed = [];
  showQuestion(0);
  showScreen('quiz');
}

document.getElementById('beginBtn').onclick = () => { showQuestion(0); showScreen('quiz'); };
document.getElementById('continueBtn').onclick = nextQuestion;
document.getElementById('retryBtn').onclick = retry;`,
  },
  {
    id: 'debate',
    name: 'Debate',
    tagline: 'Explore two sides of any topic.',
    color: '#6b7fa3',
    size: 'small',
    prompt: `You are a sharp intellectual analyst. Given any topic, present a structured balanced debate.

Use this exact format:

# [Topic]: Two Perspectives

## The Case For
**Core argument:** One clear sentence.
3–4 supporting points. Each is specific and intellectually grounded. **Bold** the key claim in each.

## The Case Against
**Core argument:** One clear sentence.
3–4 counter-points. Each genuinely challenges the proposition. **Bold** the key claim in each.

## Key Tensions
2–3 bullet points identifying the real points of disagreement — where values, evidence, or priorities collide.

## The Nuanced View
2–3 sentences synthesizing both sides. Don't avoid a position — acknowledge complexity while offering a grounded perspective.

---

Write with intellectual precision. No straw-men. Both sides argued as strongly as possible. If the topic is not inherently debatable, find the most interesting tension within it.`,
  },
];

const SUGGESTIONS = [
  "How does photosynthesis work?",
  "Explain the French Revolution",
  "What is a prime number?",
  "How do vaccines build immunity?",
  "Teach me supply and demand",
  "How does gravity shape orbits?",
];

interface ToolState {
  id: string;
  name: string;
  color: string;
  status: 'idle' | 'running' | 'done' | 'error';
  output: string;
  progress: number;
}

function extractHtml(text: string): string | null {
  let m = text.match(/```html\s*([\s\S]*?)```/);
  if (m) return m[1].trim();
  m = text.match(/```\s*(<!DOCTYPE[\s\S]*?)```/i);
  if (m) return m[1].trim();
  m = text.match(/```\s*(<html[\s\S]*?)```/i);
  if (m) return m[1].trim();
  const t = text.trim();
  if (t.startsWith('<!DOCTYPE') || t.startsWith('<html')) return t;
  return null;
}

async function streamTool(
  prompt: string,
  systemPrompt: string,
  onChunk: (t: string) => void,
  onDone: () => void,
  onError: () => void,
) {
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

interface WorkspaceProps {
  onMemorySave?: (prompt: string, lensOutput: string) => void;
  initialPrompt?: string;
  onPromptConsumed?: () => void;
}

export default function Workspace({ onMemorySave, initialPrompt, onPromptConsumed }: WorkspaceProps) {
  const [input, setInput] = useState('');
  const [toolStates, setToolStates] = useState<ToolState[]>([]);
  const [running, setRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState<{ name: string; html: string } | null>(null);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const outputRefs = useRef<Record<string, string>>({});
  const lastPromptRef = useRef('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Consume re-explore prompt from History
  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      onPromptConsumed?.();
    }
  }, [initialPrompt, onPromptConsumed]);

  const run = useCallback(async (overridePrompt?: string) => {
    const prompt = (overridePrompt ?? input).trim();
    if (!prompt || running) return;
    setInput('');
    setRunning(true);
    setExpandedTool(null);
    outputRefs.current = {};
    lastPromptRef.current = prompt;
    addHistory(prompt);

    setToolStates(TOOLS.map(t => ({ id: t.id, name: t.name, color: t.color, status: 'idle', output: '', progress: 0 })));

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

        streamTool(
          prompt,
          tool.prompt,
          chunk => {
            outputRefs.current[tool.id] += chunk;
            setToolStates(p => p.map((t, x) => x === i ? { ...t, output: outputRefs.current[tool.id] } : t));
          },
          () => {
            clearInterval(piv);
            setToolStates(p => p.map((t, x) => x === i ? { ...t, status: 'done', progress: 100 } : t));
            if (tool.id === 'lens') {
              onMemorySave?.(prompt, outputRefs.current['lens']);
            }
            resolve();
          },
          () => {
            clearInterval(piv);
            setToolStates(p => p.map((t, x) => x === i ? { ...t, status: 'error', progress: 0 } : t));
            resolve();
          },
        );
      }, i * 250);
    })));

    setRunning(false);
  }, [input, running, onMemorySave]);

  const getHtml = (ts: ToolState) => extractHtml(ts.output);
  const hasResults = toolStates.length > 0;

  // Small helper to render the common text tool card
  const TextToolCard = ({ ts, delay = 0, fullWidth = false }: { ts: ToolState; delay?: number; fullWidth?: boolean }) => {
    const isExpanded = expandedTool === ts.id;
    return (
      <motion.div
        key={ts.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        style={{ borderRadius: 16, border: '1px solid rgba(130,88,109,0.10)', background: 'rgba(255,255,255,0.52)', overflow: 'hidden', ...(fullWidth ? { gridColumn: '1 / -1' } : {}) }}
      >
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(130,88,109,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ color: ts.color }}><ToolIcon id={ts.id} size={15} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Plus Jakarta Sans', color: '#2d1f28' }}>{ts.name}</p>
              {ts.status === 'done'    && <CheckCircle2 size={12} style={{ color: '#86efac' }} />}
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
            <div className="progress-fill" style={{ width: `${ts.progress}%`, background: `linear-gradient(90deg, ${ts.color}55, ${ts.color})` }} />
          </div>
        )}

        {ts.output && (
          <div style={{ padding: '14px 18px' }}>
            <div className="output-text" style={{ maxHeight: isExpanded ? 'none' : 200, overflow: isExpanded ? 'visible' : 'hidden' }}>
              {ts.output}
              {ts.status === 'running' && <span style={{ display: 'inline-block', width: 2, height: 13, background: ts.color, marginLeft: 2 }} className="dot-pulse" />}
            </div>
            {ts.status === 'done' && !isExpanded && ts.output.length > 500 && (
              <button className="btn-soft" style={{ marginTop: 10, fontSize: 11 }} onClick={() => setExpandedTool(ts.id)}>
                Read more →
              </button>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div style={{ flex: 1, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#d1ccbf', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(130,88,109,0.10)', background: 'rgba(209,204,191,0.95)', backdropFilter: 'blur(20px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Play size={13} strokeWidth={1.7} style={{ color: '#82586d' }} />
                <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 600, color: '#2d1f28', fontSize: 13 }}>Playground — {fullscreen.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-soft" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => {
                    const b = new Blob([fullscreen.html], { type: 'text/html' });
                    const u = URL.createObjectURL(b);
                    const a = document.createElement('a'); a.href = u; a.download = 'experience.html'; a.click();
                  }}>
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

      <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>

        {/* Greeting */}
        {!hasResults && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 27, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#2d1f28', marginBottom: 6, letterSpacing: '-0.025em' }}>
              {greeting}
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(45,31,40,0.45)', letterSpacing: '-0.01em' }}>
              What would you like to learn today?
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
            placeholder="Enter a topic, concept, or question to explore…"
            rows={hasResults ? 2 : 3}
          />
          <button
            className="btn-primary"
            onClick={() => run()}
            disabled={!input.trim() || running}
            style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px' }}
          >
            <Send size={13} />
            {running ? 'Working…' : 'Explore'}
          </button>
        </div>

        {/* Suggestion chips */}
        {!hasResults && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setInput(s)} className="btn-soft" style={{ fontSize: 12, padding: '7px 14px' }}>
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tool intro cards */}
        {!hasResults && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <p style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'rgba(45,31,40,0.30)', letterSpacing: '0.12em', marginBottom: 14, textTransform: 'uppercase' }}>Four systems</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

              {/* Playground hero */}
              <div className="tool-card hero" style={{ gridColumn: '1 / -1', padding: 28, cursor: 'pointer' }}
                onClick={() => setInput('Explain how the human digestive system works')}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(94,122,110,0.12)', border: '1px solid rgba(94,122,110,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5e7a6e' }}>
                        <Play size={18} strokeWidth={1.7} />
                      </div>
                      <div>
                        <p style={{ fontSize: 17, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#2d1f28', letterSpacing: '-0.02em' }}>Playground</p>
                        <p style={{ fontSize: 12, color: 'rgba(94,122,110,0.75)' }}>Interactive experiences</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 13.5, color: 'rgba(45,31,40,0.48)', lineHeight: 1.65, maxWidth: 420 }}>
                      Describe any topic — get back a polished interactive quiz you can play, explore, and learn from.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 20 }}>
                    {['Quiz', 'Game', 'Simulation'].map(tag => (
                      <span key={tag} style={{ fontSize: 10, fontFamily: 'Space Mono', padding: '3px 8px', borderRadius: 6, background: 'rgba(94,122,110,0.07)', color: 'rgba(94,122,110,0.65)', border: '1px solid rgba(94,122,110,0.14)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(94,122,110,0.65)', fontSize: 12, fontWeight: 500 }}>
                  <span>Try it</span> <ArrowRight size={13} />
                </div>
              </div>

              {/* Lens */}
              <div className="tool-card" style={{ padding: 22, cursor: 'pointer' }} onClick={() => setInput('What is a black hole?')}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(130,88,109,0.09)', border: '1px solid rgba(130,88,109,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#82586d', marginBottom: 14 }}>
                  <Search size={16} strokeWidth={1.7} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#2d1f28', marginBottom: 6, letterSpacing: '-0.01em' }}>Lens</p>
                <p style={{ fontSize: 13, color: 'rgba(45,31,40,0.45)', lineHeight: 1.65 }}>Understand any concept clearly. Get a structured breakdown that actually makes sense.</p>
              </div>

              {/* Studio */}
              <div className="tool-card" style={{ padding: 22, cursor: 'pointer' }} onClick={() => setInput('The water cycle')}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(125,112,96,0.09)', border: '1px solid rgba(125,112,96,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7d7060', marginBottom: 14 }}>
                  <PenLine size={16} strokeWidth={1.7} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#2d1f28', marginBottom: 6, letterSpacing: '-0.01em' }}>Studio</p>
                <p style={{ fontSize: 13, color: 'rgba(45,31,40,0.45)', lineHeight: 1.65 }}>Structure any topic into clean study notes, key concepts, and learning material.</p>
              </div>

              {/* Debate */}
              <div className="tool-card" style={{ padding: 22, cursor: 'pointer', gridColumn: '1 / -1' }} onClick={() => setInput('Is social media good or bad for society?')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(107,127,163,0.09)', border: '1px solid rgba(107,127,163,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7fa3', flexShrink: 0 }}>
                    <Scale size={16} strokeWidth={1.7} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#2d1f28', marginBottom: 4, letterSpacing: '-0.01em' }}>Debate</p>
                    <p style={{ fontSize: 13, color: 'rgba(45,31,40,0.45)', lineHeight: 1.6 }}>Explore both sides of any topic. Balanced arguments, key tensions, and a nuanced synthesis.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {hasResults && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'rgba(45,31,40,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Output</p>
              {!running && (
                <button className="btn-soft" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => { setToolStates([]); }}>
                  <RotateCcw size={10} /> New topic
                </button>
              )}
            </div>

            {/* Playground hero */}
            {(() => {
              const pg = toolStates.find(t => t.id === 'playground');
              if (!pg) return null;
              const html = getHtml(pg);
              const isExpanded = expandedTool === 'playground';
              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: 14, borderRadius: 20, border: `1px solid ${pg.status === 'running' ? 'rgba(94,122,110,0.30)' : 'rgba(94,122,110,0.16)'}`, background: 'rgba(94,122,110,0.03)', overflow: 'hidden', transition: 'border-color 0.3s' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(130,88,109,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ color: '#5e7a6e' }}><Play size={16} strokeWidth={1.7} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#2d1f28' }}>Playground</p>
                        {pg.status === 'done'    && <CheckCircle2 size={13} style={{ color: '#86efac' }} />}
                        {pg.status === 'running' && <div className="spin" style={{ width: 12, height: 12, border: '1.5px solid rgba(94,122,110,0.25)', borderTopColor: '#5e7a6e', borderRadius: '50%' }} />}
                      </div>
                      <p style={{ fontSize: 11, color: 'rgba(45,31,40,0.38)' }}>
                        {pg.status === 'running' ? 'Building your experience…' : pg.status === 'done' ? 'Interactive experience ready' : 'Waiting'}
                      </p>
                    </div>
                    {pg.status === 'done' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-soft" style={{ fontSize: 11 }} onClick={() => setExpandedTool(isExpanded ? null : 'playground')}>
                          {isExpanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                        </button>
                        {html && (
                          <button className="btn-primary" style={{ fontSize: 12, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 5 }}
                            onClick={() => setFullscreen({ name: lastPromptRef.current.slice(0, 40), html })}>
                            Fullscreen
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {(pg.status === 'running' || pg.status === 'done') && (
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pg.progress}%`, background: 'linear-gradient(90deg, rgba(94,122,110,0.6), rgba(94,122,110,0.9))' }} />
                    </div>
                  )}

                  {html ? (
                    <iframe srcDoc={html} sandbox="allow-scripts allow-same-origin" style={{ width: '100%', height: isExpanded ? 580 : 340, border: 'none', display: 'block' }} title="Experience" />
                  ) : pg.status === 'running' && pg.output && (
                    <div style={{ padding: '14px 20px' }}>
                      <div className="output-text" style={{ fontSize: 12, maxHeight: 80, overflow: 'hidden', opacity: 0.35 }}>
                        {pg.output.slice(0, 200)}…
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })()}

            {/* Lens + Studio */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {toolStates.filter(t => t.id === 'lens' || t.id === 'studio').map((ts, i) => (
                <TextToolCard key={ts.id} ts={ts} delay={i * 0.08} />
              ))}
            </div>

            {/* Debate — full width */}
            {toolStates.filter(t => t.id === 'debate').map(ts => (
              <TextToolCard key={ts.id} ts={ts} delay={0.16} fullWidth />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
