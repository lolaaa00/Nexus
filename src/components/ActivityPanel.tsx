import { useEffect, useState } from 'react';
import { Activity, Zap } from 'lucide-react';

interface ActivityItem {
  id: number;
  agent: string;
  action: string;
  time: string;
  color: string;
  icon: string;
}

const LIVE_FEED: Omit<ActivityItem, 'id' | 'time'>[] = [
  { agent: 'Research Agent', action: 'Scanning sources', color: '#a78bfa', icon: '🔬' },
  { agent: 'Content Agent', action: 'Structuring response', color: '#60a5fa', icon: '✍️' },
  { agent: 'Game Builder', action: 'Generating quiz experience', color: '#fb923c', icon: '🎮' },
  { agent: 'Orchestrator', action: 'Synchronizing outputs', color: '#82586d', icon: '🎯' },
  { agent: 'Crypto Analyst', action: 'Processing on-chain data', color: '#4ade80', icon: '📊' },
  { agent: 'Quiz Builder', action: 'Building interactions', color: '#f472b6', icon: '🧠' },
  { agent: 'Debate Agent', action: 'Analyzing both sides', color: '#34d399', icon: '⚡' },
  { agent: 'Research Agent', action: 'Cross-referencing facts', color: '#a78bfa', icon: '🔬' },
  { agent: 'Game Builder', action: 'Rendering visuals', color: '#fb923c', icon: '🎮' },
  { agent: 'Content Agent', action: 'Optimizing for clarity', color: '#60a5fa', icon: '✍️' },
];

function timeStr() {
  const now = new Date();
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
}

export default function ActivityPanel({ tasks }: { tasks?: any[] }) {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let idx = 0;
    setItems([{ ...LIVE_FEED[0], id: Date.now(), time: timeStr() }]);
    const iv = setInterval(() => {
      idx = (idx + 1) % LIVE_FEED.length;
      setItems(prev => [{ ...LIVE_FEED[idx], id: Date.now(), time: timeStr() }, ...prev.slice(0, 9)]);
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  return (
    <aside style={{ width: 260, borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh', overflowY: 'auto' }}>
      <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#86efac' }} className="pulse-dot" />
          <p style={{ fontSize: 12, fontWeight: 600, fontFamily: 'Space Grotesk', color: 'rgba(209,204,191,0.7)' }}>Activity Feed</p>
          <div style={{ marginLeft: 'auto' }}>
            <Activity size={13} style={{ color: 'rgba(209,204,191,0.3)' }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '8px 12px', flex: 1 }}>
        {items.map((item, i) => (
          <div
            key={item.id}
            className="slide-up"
            style={{
              display: 'flex', gap: 10, padding: '10px 8px', borderRadius: 10,
              marginBottom: 2, opacity: 1 - i * 0.08,
              transition: 'all 0.3s',
              background: i === 0 ? 'rgba(255,255,255,0.025)' : 'transparent',
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
              {item.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(209,204,191,0.7)', lineHeight: 1.3, fontFamily: 'Space Grotesk' }}>{item.agent}</p>
              <p style={{ fontSize: 11, color: 'rgba(209,204,191,0.4)', lineHeight: 1.3, marginTop: 1 }}>{item.action}</p>
            </div>
            <p style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'rgba(209,204,191,0.2)', flexShrink: 0, paddingTop: 1 }}>{item.time}</p>
          </div>
        ))}
      </div>

      {/* Rialo badge */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ background: 'rgba(130,88,109,0.08)', border: '1px solid rgba(130,88,109,0.15)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
            <Zap size={12} style={{ color: '#82586d' }} />
            <p style={{ fontSize: 11, fontWeight: 600, fontFamily: 'Space Grotesk', color: '#82586d' }}>Rialo Network</p>
          </div>
          <p style={{ fontSize: 10, color: 'rgba(209,204,191,0.35)', lineHeight: 1.5 }}>Agent coordination via SCALE protocol. Identity & reputation coming soon.</p>
        </div>
      </div>
    </aside>
  );
}
