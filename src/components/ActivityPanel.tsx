import { useEffect, useState } from 'react';

const FEED = [
  { tool: 'Lens', action: 'Scanning sources', icon: '🔍' },
  { tool: 'Studio', action: 'Structuring content', icon: '✍️' },
  { tool: 'Playground', action: 'Rendering experience', icon: '🎮' },
  { tool: 'Playground', action: 'Building interactions', icon: '🎮' },
  { tool: 'Lens', action: 'Cross-referencing facts', icon: '🔍' },
  { tool: 'Studio', action: 'Optimizing for clarity', icon: '✍️' },
  { tool: 'Playground', action: 'Generating visuals', icon: '🎮' },
  { tool: 'Lens', action: 'Synthesizing insights', icon: '🔍' },
  { tool: 'Studio', action: 'Drafting thread structure', icon: '✍️' },
  { tool: 'Playground', action: 'Compiling game logic', icon: '🎮' },
];

function now() {
  const d = new Date();
  const h = d.getHours(), m = String(d.getMinutes()).padStart(2,'0');
  return `${h > 12 ? h-12 : h}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default function ActivityPanel() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let i = 0;
    setItems([{ ...FEED[0], id: Date.now(), time: now() }]);
    const iv = setInterval(() => {
      i = (i + 1) % FEED.length;
      setItems(p => [{ ...FEED[i], id: Date.now(), time: now() }, ...p.slice(0, 8)]);
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <aside style={{
      width: 240, borderLeft: '1px solid rgba(255,255,255,0.04)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', flexShrink: 0, overflowY: 'auto',
    }}>
      <div style={{ padding: '22px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#86efac' }} className="dot-pulse" />
          <p style={{ fontSize: 12, fontWeight: 600, fontFamily: 'Space Grotesk', color: 'rgba(232,226,213,0.55)', letterSpacing: '-0.01em' }}>Live activity</p>
        </div>
      </div>

      <div style={{ padding: '10px 12px', flex: 1 }}>
        {items.map((item, i) => (
          <div key={item.id} className="slide-up" style={{
            display: 'flex', gap: 10, padding: '9px 8px', borderRadius: 10,
            marginBottom: 2,
            background: i === 0 ? 'rgba(255,255,255,0.025)' : 'transparent',
            opacity: Math.max(0.25, 1 - i * 0.1),
            transition: 'all 0.4s',
          }}>
            <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(232,226,213,0.6)', fontFamily: 'Space Grotesk', lineHeight: 1.3 }}>{item.tool}</p>
              <p style={{ fontSize: 11, color: 'rgba(232,226,213,0.35)', lineHeight: 1.4, marginTop: 1 }}>{item.action}</p>
            </div>
            <p style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'rgba(232,226,213,0.18)', flexShrink: 0, paddingTop: 1 }}>{item.time}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
