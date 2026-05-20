import { useState, useEffect } from 'react';
import { Bookmark, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getMemory, deleteMemory, timeAgo, type MemoryEntry } from '@/lib/storage';

export default function MemoryPage() {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setEntries(getMemory());
  }, []);

  const handleDelete = (id: string) => {
    deleteMemory(id);
    setEntries(getMemory());
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'rgba(45,31,40,0.28)', letterSpacing: '0.12em', marginBottom: 8, textTransform: 'uppercase' }}>Knowledge base</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#2d1f28', letterSpacing: '-0.025em', marginBottom: 6 }}>Memory</h1>
          <p style={{ fontSize: 14, color: 'rgba(45,31,40,0.45)', lineHeight: 1.6 }}>Concepts you've learned, saved automatically. Review them anytime.</p>
        </div>

        {/* Empty state */}
        {entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(130,88,109,0.08)', border: '1px solid rgba(130,88,109,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#82586d' }}>
              <Bookmark size={20} strokeWidth={1.6} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(45,31,40,0.45)', fontFamily: 'Plus Jakarta Sans', marginBottom: 6 }}>Nothing saved yet</p>
            <p style={{ fontSize: 13, color: 'rgba(45,31,40,0.30)', lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
              When you explore a topic and Lens completes its analysis, it's saved here automatically.
            </p>
          </div>
        )}

        {/* Memory cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map((entry) => {
            const isOpen = expanded === entry.id;
            const preview = entry.lensOutput.slice(0, 180).replace(/[#*`]/g, '').trim();

            return (
              <div key={entry.id} style={{
                borderRadius: 16,
                border: `1px solid ${isOpen ? 'rgba(130,88,109,0.22)' : 'rgba(130,88,109,0.11)'}`,
                background: isOpen ? 'rgba(255,255,255,0.68)' : 'rgba(255,255,255,0.44)',
                overflow: 'hidden',
                transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
              }}>
                {/* Card header */}
                <div
                  style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                  onClick={() => setExpanded(isOpen ? null : entry.id)}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(130,88,109,0.08)', border: '1px solid rgba(130,88,109,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#82586d' }}>
                    <Bookmark size={14} strokeWidth={1.7} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#2d1f28', fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.01em', marginBottom: 2 }}>
                      {entry.prompt}
                    </p>
                    {!isOpen && (
                      <p style={{ fontSize: 12, color: 'rgba(45,31,40,0.38)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {preview}…
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'rgba(45,31,40,0.28)' }}>{timeAgo(entry.timestamp)}</span>
                    <div style={{ color: 'rgba(45,31,40,0.30)' }}>
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ padding: '0 20px 20px' }}>
                    <div style={{ borderTop: '1px solid rgba(130,88,109,0.08)', paddingTop: 16, marginBottom: 12 }}>
                      <div className="output-text" style={{ fontSize: 13, lineHeight: 1.75, maxHeight: 420, overflowY: 'auto', color: 'rgba(45,31,40,0.70)' }}>
                        {entry.lensOutput}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn-soft"
                        style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(200,80,80,0.7)', borderColor: 'rgba(200,80,80,0.15)' }}
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 size={10} /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
