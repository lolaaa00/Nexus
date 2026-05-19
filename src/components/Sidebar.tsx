import { Home, Zap, FolderOpen, Clock, Brain, Settings } from 'lucide-react';
import RialoLogo from './RialoLogo';

type Page = 'home' | 'tools' | 'projects' | 'history' | 'memory' | 'settings';

const NAV = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tools', label: 'Tools', icon: Zap },
  { id: 'projects', label: 'Projects', icon: FolderOpen, soon: true },
  { id: 'history', label: 'History', icon: Clock, soon: true },
  { id: 'memory', label: 'Memory', icon: Brain, soon: true },
];

export default function Sidebar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  return (
    <aside style={{
      width: 210,
      background: 'rgba(255,255,255,0.4)',
      borderRight: '1px solid rgba(130,88,109,0.1)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 16px 18px', borderBottom: '1px solid rgba(130,88,109,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: '#82586d',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(130,88,109,0.4)',
          }}>
            <RialoLogo size={18} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Space Grotesk', color: '#2d1f28', lineHeight: 1.1, letterSpacing: '-0.02em' }}>rialai</p>
            <p style={{ fontSize: 9, fontFamily: 'Space Mono', color: 'rgba(130,88,109,0.8)', letterSpacing: '0.08em' }}>× RIALO</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '14px 10px', flex: 1 }}>
        {NAV.map(({ id, label, icon: Icon, soon }) => (
          <div
            key={id}
            className={`nav-item ${page === id ? 'active' : ''}`}
            onClick={() => !soon && setPage(id as Page)}
            style={{ opacity: soon ? 0.4 : 1, cursor: soon ? 'not-allowed' : 'pointer', marginBottom: 2 }}
          >
            <Icon size={15} strokeWidth={1.8} />
            <span style={{ flex: 1 }}>{label}</span>
            {soon && <span style={{ fontSize: 9, fontFamily: 'Space Mono', color: 'rgba(130,88,109,0.5)', letterSpacing: '0.06em' }}>SOON</span>}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(130,88,109,0.08)' }}>
        <div className="nav-item" onClick={() => setPage('settings')} style={{ marginBottom: 8 }}>
          <Settings size={15} strokeWidth={1.8} />
          <span>Settings</span>
        </div>
        {/* Rialo status */}
        <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(130,88,109,0.07)', border: '1px solid rgba(130,88,109,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#86efac' }} className="dot-pulse" />
            <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'Space Grotesk', color: '#82586d' }}>Rialo Network</span>
          </div>
          <p style={{ fontSize: 10, color: 'rgba(45,31,40,0.4)', lineHeight: 1.5 }}>Identity & coordination layer. Phase 2 coming.</p>
        </div>
      </div>
    </aside>
  );
}
