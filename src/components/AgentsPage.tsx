import { ArrowRight } from 'lucide-react';

const TOOLS = [
  { name: 'Playground', icon: '🎮', color: '#f59e0b', desc: 'Turns any idea into something you can interact with. Quizzes, games, simulations. The most powerful tool in the suite.', status: 'active', size: 'hero' },
  { name: 'Lens', icon: '🔍', color: '#a78bfa', desc: 'Deep understanding on demand. Ask anything, get a structured breakdown that actually makes sense.', status: 'active' },
  { name: 'Studio', icon: '✍️', color: '#60a5fa', desc: 'Shape ideas into publishable content. Threads, articles, briefs — written with clarity and intention.', status: 'active' },
  { name: 'Memory', icon: '🧠', color: '#34d399', desc: 'Persistent context across sessions. Your tools remember what matters to you.', status: 'soon' },
  { name: 'Marketplace', icon: '🏪', color: '#82586d', desc: 'Deploy custom tools. Share them. Monetize via Rialo infrastructure.', status: 'soon' },
];

export default function AgentsPage() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'rgba(232,226,213,0.2)', letterSpacing: '0.12em', marginBottom: 8 }}>TOOLS</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk', color: '#e8e2d5', marginBottom: 6, letterSpacing: '-0.025em' }}>Three tools. Infinite uses.</h1>
        <p style={{ fontSize: 14, color: 'rgba(232,226,213,0.4)', marginBottom: 36, lineHeight: 1.6 }}>Focused, powerful, and built to work together. More on the way.</p>

        {/* Hero tool */}
        <div style={{ borderRadius: 20, border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.05)', padding: 28, marginBottom: 14, cursor: 'pointer', transition: 'all 0.3s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.4)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(245,158,11,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.2)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🎮</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk', color: '#e8e2d5', letterSpacing: '-0.02em' }}>Playground</p>
                  <span style={{ fontSize: 9, fontFamily: 'Space Mono', padding: '2px 8px', borderRadius: 6, background: 'rgba(134,239,172,0.1)', color: '#86efac', border: '1px solid rgba(134,239,172,0.2)' }}>ACTIVE</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(232,226,213,0.45)', lineHeight: 1.6, maxWidth: 500 }}>The centerpiece. Describe anything — a concept, a topic, an idea — and get back something interactive. Play it, share it, learn from it.</p>
              </div>
            </div>
            <ArrowRight size={18} style={{ color: 'rgba(245,158,11,0.5)', flexShrink: 0 }} />
          </div>
        </div>

        {/* Other tools */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
          {TOOLS.filter(t => t.name !== 'Playground').map(tool => (
            <div key={tool.name} style={{
              borderRadius: 16, padding: 22,
              border: `1px solid ${tool.status === 'active' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)'}`,
              background: tool.status === 'active' ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.01)',
              opacity: tool.status === 'soon' ? 0.5 : 1,
              cursor: tool.status === 'active' ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${tool.color}12`, border: `1px solid ${tool.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{tool.icon}</div>
                <span style={{ fontSize: 9, fontFamily: 'Space Mono', padding: '2px 8px', borderRadius: 6,
                  background: tool.status === 'active' ? 'rgba(134,239,172,0.08)' : 'rgba(255,255,255,0.05)',
                  color: tool.status === 'active' ? '#86efac' : 'rgba(232,226,213,0.3)',
                  border: `1px solid ${tool.status === 'active' ? 'rgba(134,239,172,0.15)' : 'rgba(255,255,255,0.08)'}`,
                }}>{tool.status === 'active' ? 'ACTIVE' : 'SOON'}</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'Space Grotesk', color: '#e8e2d5', marginBottom: 6, letterSpacing: '-0.01em' }}>{tool.name}</p>
              <p style={{ fontSize: 12, color: 'rgba(232,226,213,0.4)', lineHeight: 1.6 }}>{tool.desc}</p>
            </div>
          ))}
        </div>

        {/* Rialo */}
        <div style={{ borderRadius: 16, padding: '24px 28px', background: 'rgba(130,88,109,0.06)', border: '1px solid rgba(130,88,109,0.15)' }}>
          <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: '#82586d', letterSpacing: '0.1em', marginBottom: 8 }}>INFRASTRUCTURE</p>
          <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk', color: '#e8e2d5', marginBottom: 8, letterSpacing: '-0.02em' }}>Built for the Rialo agent economy</h3>
          <p style={{ fontSize: 13, color: 'rgba(232,226,213,0.45)', lineHeight: 1.7, maxWidth: 560 }}>
            Rialo provides the coordination layer — identity, reputation, memory, and monetization for AI tools. rialai is the consumer surface. Today the tools work. On Rialo, they'll have ownership.
          </p>
        </div>
      </div>
    </div>
  );
}
