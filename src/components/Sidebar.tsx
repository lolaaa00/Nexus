import { Layers, BookOpen, Clock, Bookmark, LogOut } from 'lucide-react';
import { type Page } from '../App';
import logoSrc from '@/assets/rialooos.jpg';
import { useAuth } from '@/contexts/AuthContext';

const NAV: { id: Page; label: string; icon: React.ComponentType<{ size: number; strokeWidth: number }> }[] = [
  { id: 'create',  label: 'Create',  icon: Layers },
  { id: 'tools',   label: 'Tools',   icon: BookOpen },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'memory',  label: 'Memory',  icon: Bookmark },
];

export default function Sidebar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const { user, signOut } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initial = displayName[0].toUpperCase();

  return (
    <aside style={{
      width: 200,
      background: 'rgba(255,255,255,0.36)',
      borderRight: '1px solid rgba(130,88,109,0.10)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', flexShrink: 0,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid rgba(130,88,109,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src={logoSrc}
            alt="rialai"
            style={{
              width: 32, height: 32, borderRadius: 9,
              objectFit: 'cover', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(130,88,109,0.20)',
            }}
          />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#2d1f28', lineHeight: 1.1, letterSpacing: '-0.02em' }}>rialai</p>
            <p style={{ fontSize: 9, fontFamily: 'Space Mono', color: 'rgba(130,88,109,0.65)', letterSpacing: '0.09em', marginTop: 2 }}>STUDIO</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        {NAV.map(({ id, label, icon: Icon }) => (
          <div
            key={id}
            className={`nav-item${page === id ? ' active' : ''}`}
            onClick={() => setPage(id)}
            style={{ marginBottom: 2 }}
          >
            <Icon size={15} strokeWidth={1.8} />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      {/* Footer — user info + sign out */}
      <div style={{ padding: '12px 10px 18px', borderTop: '1px solid rgba(130,88,109,0.08)' }}>
        <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(130,88,109,0.055)', border: '1px solid rgba(130,88,109,0.09)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#82586d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'Plus Jakarta Sans' }}>{initial}</span>
              </div>
            )}
            <p style={{ fontSize: 12, fontWeight: 600, color: '#2d1f28', fontFamily: 'Plus Jakarta Sans', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
          </div>
          <button
            onClick={() => signOut()}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 8px', borderRadius: 7,
              border: '1px solid rgba(130,88,109,0.14)',
              background: 'rgba(255,255,255,0.42)',
              cursor: 'pointer', fontSize: 11.5,
              fontFamily: 'Plus Jakarta Sans', fontWeight: 500,
              color: 'rgba(45,31,40,0.55)',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#82586d'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(130,88,109,0.28)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(45,31,40,0.55)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(130,88,109,0.14)'; }}
          >
            <LogOut size={12} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
