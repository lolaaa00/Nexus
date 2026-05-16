import { useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { walletConfig } from "@/config/wallet";
import Sidebar from '@/components/Sidebar';
import Workspace from '@/components/Workspace';
import AgentsPage from '@/components/AgentsPage';
import ActivityPanel from '@/components/ActivityPanel';
import "@rainbow-me/rainbowkit/styles.css";

type Page = 'workspace' | 'agents' | 'marketplace' | 'memory' | 'projects' | 'activity' | 'settings';

const queryClient = new QueryClient();

function AppInner() {
  const [page, setPage] = useState<Page>('workspace');

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0e0d0b' }}>
      <Sidebar page={page} setPage={setPage} user={{ name: 'Builder' }} />

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {page === 'workspace' && <Workspace userName="Builder" />}
        {page === 'agents' && <AgentsPage />}
        {page === 'projects' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 40 }}>📁</p>
            <p style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: 'rgba(209,204,191,0.5)', fontSize: 16 }}>Projects coming soon</p>
            <p style={{ fontSize: 13, color: 'rgba(209,204,191,0.3)' }}>Save and organize your agent outputs</p>
          </div>
        )}
        {page === 'activity' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 40 }}>📊</p>
            <p style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: 'rgba(209,204,191,0.5)', fontSize: 16 }}>Activity log coming soon</p>
          </div>
        )}
        {page === 'memory' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 40 }}>🧠</p>
            <p style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: 'rgba(209,204,191,0.5)', fontSize: 16 }}>Agent memory coming soon</p>
            <p style={{ fontSize: 13, color: 'rgba(209,204,191,0.3)' }}>Persistent context via Rialo identity</p>
          </div>
        )}
        {page === 'settings' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 40 }}>⚙️</p>
            <p style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: 'rgba(209,204,191,0.5)', fontSize: 16 }}>Settings coming soon</p>
          </div>
        )}
      </main>

      {page === 'workspace' && <ActivityPanel />}
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={walletConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: '#82586d', accentColorForeground: 'white', borderRadius: 'large' })}>
          <AppInner />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
