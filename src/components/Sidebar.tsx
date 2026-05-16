import { Home, Cpu, ShoppingBag, Database, FolderOpen, Activity, Puzzle, Settings, ChevronDown, LogOut } from 'lucide-react';
import RialoLogo from './RialoLogo';

type Page = 'workspace' | 'agents' | 'marketplace' | 'memory' | 'projects' | 'activity' | 'settings';

const NAV = [
  { id: 'workspace', label: 'Workspace', icon: Home },
  { id: 'agents', label: 'Agents', icon: Cpu },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'memory', label: 'Memory', icon: Database },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, soon: true },
];

export default function Sidebar({ page, setPage, user }: { page: Page; setPage: (p: Page) => void; user?: any }) {
  return (
    <aside style={{ width: 220, background: 'rgba(255,255,255,0.015)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '0', flexShrink: 0, height: '100vh' }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#82586d', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(130,88,109,0.4)' }}>
            <RialoLogo size={16} className="text-white" style={{ color: 'white' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Space Grotesk', color: '#e8e2d5', lineHeight: 1 }}>rialai</p>
            <p style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'rgba(130,88,109,0.8)', letterSpacing: '0.06em' }}>× Rialo</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'rgba(209,204,191,0.2)', letterSpacing: '0.12em', padding: '0 6px', marginBottom: 6 }}>MENU</p>
        {NAV.map(({ id, label, icon: Icon, soon }) => (
          <div
            key={id}
            className={`sidebar-item ${page === id ? 'active' : ''} ${soon ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !soon && setPage(id as Page)}
          >
            <Icon size={15} />
            <span style={{ flex: 1 }}>{label}</span>
            {soon && <span className="tag" style={{ background: 'rgba(130,88,109,0.12)', color: 'rgba(130,88,109,0.6)', fontSize: 9 }}>SOON</span>}
          </div>
        ))}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '12px 6px' }} />

        <div className="sidebar-item" onClick={() => setPage('settings')}>
          <Settings size={15} />
          <span>Settings</span>
        </div>
      </nav>

      {/* User */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, cursor: 'pointer', background: 'rgba(255,255,255,0.025)' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(130,88,109,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#82586d' }}>
            {user?.name?.[0] ?? 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(209,204,191,0.8)', lineHeight: 1.2, truncate: 'true', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name ?? 'Builder'}</p>
            <p style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'rgba(209,204,191,0.3)' }}>Free plan</p>
          </div>
          <ChevronDown size={12} style={{ color: 'rgba(209,204,191,0.3)' }} />
        </div>
      </div>
    </aside>
  );
}
