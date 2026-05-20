import { useState, useEffect } from 'react';
import { Clock, RotateCcw, Trash2 } from 'lucide-react';
import { getHistory, clearHistory, timeAgo, type HistoryEntry } from '@/lib/storage';

export default function HistoryPage({ onReexplore }: { onReexplore: (prompt: string) => void }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  const handleClear = () => {
    clearHistory();
    setEntries([]);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'rgba(45,31,40,0.28)', letterSpacing: '0.12em', marginBottom: 8, textTransform: 'uppercase' }}>Timeline</p>
            <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#2d1f28', letterSpacing: '-0.025em', marginBottom: 6 }}>History</h1>
            <p style={{ fontSize: 14, color: 'rgba(45,31,40,0.45)', lineHeight: 1.6 }}>Every topic you've explored, in order.</p>
          </div>
          {entries.length > 0 && (
            <button
              className="btn-soft"
              style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}
              onClick={handleClear}
            >
              <Trash2 size={11} /> Clear all
            </button>
          )}
        </div>

        {/* Empty state */}
        {entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(130,88,109,0.08)', border: '1px solid rgba(130,88,109,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#82586d' }}>
              <Clock size={20} strokeWidth={1.6} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(45,31,40,0.45)', fontFamily: 'Plus Jakarta Sans', marginBottom: 6 }}>No explorations yet</p>
            <p style={{ fontSize: 13, color: 'rgba(45,31,40,0.30)', lineHeight: 1.6 }}>Topics you explore in Create will appear here.</p>
          </div>
        )}

        {/* Timeline */}
        {entries.length > 0 && (
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 15, top: 8, bottom: 8, width: 1, background: 'rgba(130,88,109,0.12)' }} />

            {entries.map((entry, i) => (
              <div key={entry.id} style={{ display: 'flex', gap: 20, marginBottom: 4, paddingBottom: 4 }}>
                {/* Dot */}
                <div style={{ flexShrink: 0, width: 31, display: 'flex', alignItems: 'flex-start', paddingTop: 14 }}>
                  <div style={{
                    width: 9, height: 9, borderRadius: '50%',
                    background: i === 0 ? '#82586d' : 'rgba(130,88,109,0.25)',
                    border: i === 0 ? '2px solid rgba(130,88,109,0.3)' : 'none',
                    flexShrink: 0,
                  }} />
                </div>

                {/* Card */}
                <div style={{
                  flex: 1, padding: '14px 18px', borderRadius: 14,
                  background: i === 0 ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.38)',
                  border: `1px solid ${i === 0 ? 'rgba(130,88,109,0.14)' : 'rgba(130,88,109,0.08)'}`,
                  marginBottom: 10,
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'all 0.18s',
                }}>
                  <p style={{ flex: 1, fontSize: 14, fontWeight: 500, color: i === 0 ? '#2d1f28' : 'rgba(45,31,40,0.65)', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.5 }}>
                    {entry.prompt}
                  </p>
                  <span style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'rgba(45,31,40,0.28)', flexShrink: 0 }}>
                    {timeAgo(entry.timestamp)}
                  </span>
                  <button
                    className="btn-soft"
                    style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, padding: '5px 10px' }}
                    onClick={() => onReexplore(entry.prompt)}
                  >
                    <RotateCcw size={10} /> Re-explore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
