import { Search, PenLine, Play, Scale, ArrowRight } from 'lucide-react';

const TOOLS = [
  {
    id: 'playground',
    name: 'Playground',
    icon: Play,
    color: '#5e7a6e',
    tagline: 'Interactive experiences',
    desc: 'Describe any topic and get back a polished, playable quiz or interactive simulation. The most powerful way to learn — by doing.',
    hero: true,
  },
  {
    id: 'lens',
    name: 'Lens',
    icon: Search,
    color: '#82586d',
    tagline: 'Deep understanding',
    desc: 'Ask any question or name any concept. Get a structured breakdown — simple version, core ideas, analogies, and real examples.',
    hero: false,
  },
  {
    id: 'studio',
    name: 'Studio',
    icon: PenLine,
    color: '#7d7060',
    tagline: 'Structured study material',
    desc: 'Transform any topic into clean study notes with summaries, key vocabulary, core concepts, and self-check questions.',
    hero: false,
  },
  {
    id: 'debate',
    name: 'Debate',
    icon: Scale,
    color: '#6b7fa3',
    tagline: 'Balanced perspectives',
    desc: 'Explore both sides of any topic. Structured arguments for and against, key tensions, and a nuanced synthesis.',
    hero: false,
  },
];

export default function ToolsPage() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        <p style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'rgba(45,31,40,0.28)', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>Systems</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#2d1f28', marginBottom: 8, letterSpacing: '-0.025em' }}>Three focused systems.</h1>
        <p style={{ fontSize: 14, color: 'rgba(45,31,40,0.45)', marginBottom: 36, lineHeight: 1.65, maxWidth: 480 }}>
          Each one serves a distinct purpose in the learning flow — from understanding a concept to exploring it interactively.
        </p>

        {/* Playground hero */}
        {(() => {
          const t = TOOLS.find(x => x.hero)!;
          const Icon = t.icon;
          return (
            <div style={{
              borderRadius: 20,
              border: `1px solid rgba(94,122,110,0.20)`,
              background: 'rgba(94,122,110,0.04)',
              padding: 28, marginBottom: 14,
              transition: 'all 0.25s',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(94,122,110,0.38)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(94,122,110,0.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(94,122,110,0.20)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(94,122,110,0.10)', border: '1px solid rgba(94,122,110,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5e7a6e', flexShrink: 0, marginTop: 2 }}>
                    <Icon size={22} strokeWidth={1.6} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <p style={{ fontSize: 19, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#2d1f28', letterSpacing: '-0.02em' }}>{t.name}</p>
                      <span style={{ fontSize: 9, fontFamily: 'Space Mono', padding: '2px 8px', borderRadius: 6, background: 'rgba(134,239,172,0.10)', color: '#166534', border: '1px solid rgba(134,239,172,0.22)', letterSpacing: '0.04em' }}>ACTIVE</span>
                    </div>
                    <p style={{ fontSize: 13.5, color: 'rgba(45,31,40,0.48)', lineHeight: 1.68, maxWidth: 480 }}>{t.desc}</p>
                  </div>
                </div>
                <ArrowRight size={17} style={{ color: 'rgba(94,122,110,0.45)', flexShrink: 0, marginTop: 6 }} />
              </div>
            </div>
          );
        })()}

        {/* Lens + Studio */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 36 }}>
          {TOOLS.filter(t => !t.hero).map(tool => {
            const Icon = tool.icon;
            return (
              <div key={tool.id} style={{
                borderRadius: 16, padding: 24,
                border: '1px solid rgba(130,88,109,0.12)',
                background: 'rgba(255,255,255,0.48)',
                transition: 'all 0.22s',
                cursor: 'default',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(130,88,109,0.24)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(130,88,109,0.07)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(130,88,109,0.12)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `rgba(130,88,109,0.08)`, border: `1px solid rgba(130,88,109,0.13)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool.color }}>
                    <Icon size={17} strokeWidth={1.7} />
                  </div>
                  <span style={{ fontSize: 9, fontFamily: 'Space Mono', padding: '2px 8px', borderRadius: 6, background: 'rgba(134,239,172,0.08)', color: '#166534', border: '1px solid rgba(134,239,172,0.18)', letterSpacing: '0.04em' }}>ACTIVE</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'Plus Jakarta Sans', color: '#2d1f28', marginBottom: 6, letterSpacing: '-0.01em' }}>{tool.name}</p>
                <p style={{ fontSize: 12.5, color: 'rgba(45,31,40,0.45)', lineHeight: 1.68 }}>{tool.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Rialo infrastructure note */}
        <div style={{ borderRadius: 16, padding: '22px 26px', background: 'rgba(130,88,109,0.05)', border: '1px solid rgba(130,88,109,0.12)' }}>
          <p style={{ fontSize: 10, fontFamily: 'Space Mono', color: '#82586d', letterSpacing: '0.09em', marginBottom: 7, textTransform: 'uppercase' }}>About rialai</p>
          <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#2d1f28', marginBottom: 8, letterSpacing: '-0.02em' }}>Built around coordinated AI systems</h3>
          <p style={{ fontSize: 13, color: 'rgba(45,31,40,0.45)', lineHeight: 1.72, maxWidth: 520 }}>
            Rather than one generic AI, rialai runs three specialized systems in parallel — each with a distinct purpose. Lens understands. Studio structures. Playground transforms. Inspired by Rialo's vision for coordinated, collaborative AI.
          </p>
        </div>
      </div>
    </div>
  );
}
