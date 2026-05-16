import { useState } from 'react';
import { Plus, Zap, Clock } from 'lucide-react';

const AGENTS = [
  { name: 'Analyst Agent', desc: 'Explains, analyzes, and breaks down complex topics with structured insights.', icon: '🧠', color: '#a78bfa', category: 'Research', active: true },
  { name: 'Content Agent', desc: 'Creates threads, articles, summaries and structured content for any audience.', icon: '✍️', color: '#60a5fa', category: 'Content', active: true },
  { name: 'Game Builder', desc: 'Builds interactive games, quizzes, and playable learning experiences.', icon: '🎮', color: '#fb923c', category: 'Gaming', active: true },
  { name: 'Crypto Lens', desc: 'Analyzes crypto projects, wallets, and on-chain trends. Factual, never speculative.', icon: '📊', color: '#4ade80', category: 'Research', active: true },
  { name: 'Debate Agent', desc: 'Explores any topic from both sides with structured, sharp arguments.', icon: '⚡', color: '#34d399', category: 'Research', active: true },
  { name: 'Quiz Builder', desc: 'Turns any topic into a beautiful interactive quiz game instantly.', icon: '🧩', color: '#f472b6', category: 'Learning', active: true },
  { name: 'Code Assistant', desc: 'Writes, debugs, and explains code across any language or framework.', icon: '💻', color: '#38bdf8', category: 'Utility', active: false },
  { name: 'Image Analyst', desc: 'Describes, analyzes, and extracts insights from images and visual content.', icon: '🖼️', color: '#fbbf24', category: 'Utility', active: false },
];

const CATS = ['All', 'Research', 'Content', 'Gaming', 'Learning', 'Utility'];

export default function AgentsPage() {
  const [cat, setCat] = useState('All');
  const filtered = cat === 'All' ? AGENTS : AGENTS.filter(a => a.category === cat);

  return (
    <div style={{ padding: '32px 32px', flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 12, fontFamily: 'Space Mono', color: 'rgba(209,204,191,0.3)', letterSpacing: '0.12em', marginBottom: 6 }}>AGENTS</p>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk', color: '#e8e2d5', marginBottom: 6 }}>Your AI Agent Team</h1>
          <p style={{ fontSize: 14, color: 'rgba(209,204,191,0.45)' }}>Specialized agents with unique skills. More arriving soon.</p>
        </div>
        <button className="btn-rose" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Create Agent
        </button>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)}
            style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
              background: cat === c ? '#82586d' : 'transparent',
              borderColor: cat === c ? '#82586d' : 'rgba(255,255,255,0.08)',
              color: cat === c ? '#f5f0e8' : 'rgba(209,204,191,0.5)',
            }}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {filtered.map(agent => (
          <div key={agent.name} className="agent-card" style={{ position: 'relative', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${agent.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: `1px solid ${agent.color}20` }}>
                {agent.icon}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {agent.active
                  ? <><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#86efac' }} className="pulse-dot" /><span style={{ fontSize: 11, color: '#86efac', fontFamily: 'Space Mono' }}>Active</span></>
                  : <><Clock size={11} style={{ color: 'rgba(209,204,191,0.3)' }} /><span style={{ fontSize: 11, color: 'rgba(209,204,191,0.3)', fontFamily: 'Space Mono' }}>Soon</span></>
                }
              </div>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'Space Grotesk', color: '#e8e2d5', marginBottom: 6 }}>{agent.name}</p>
            <p style={{ fontSize: 12, color: 'rgba(209,204,191,0.45)', lineHeight: 1.6, marginBottom: 14 }}>{agent.desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="tag" style={{ background: `${agent.color}12`, color: agent.color, border: `1px solid ${agent.color}20` }}>{agent.category}</span>
              {agent.active && (
                <button className="btn-ghost" style={{ fontSize: 11, padding: '5px 12px' }}>
                  <Zap size={11} style={{ display: 'inline', marginRight: 4 }} />Use
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rialo section */}
      <div style={{ marginTop: 32, padding: 24, background: 'rgba(130,88,109,0.06)', border: '1px solid rgba(130,88,109,0.15)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: '#82586d', letterSpacing: '0.1em', marginBottom: 6 }}>BUILT FOR THE AGENT ECONOMY</p>
          <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk', color: '#e8e2d5', marginBottom: 8 }}>Rialo provides the infrastructure</h3>
          <p style={{ fontSize: 13, color: 'rgba(209,204,191,0.45)', lineHeight: 1.6 }}>For identity, reputation, coordination, and ownership of AI agents. rialai is the consumer layer — Rialo is the foundation.</p>
        </div>
        <button className="btn-ghost" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          Learn About Rialo →
        </button>
      </div>
    </div>
  );
}
