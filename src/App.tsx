import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Workspace from '@/components/Workspace';
import ToolsPage from '@/components/AgentsPage';
import HistoryPage from '@/components/HistoryPage';
import MemoryPage from '@/components/MemoryPage';
import AuthScreen from '@/components/AuthScreen';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { addMemory } from '@/lib/storage';

export type Page = 'create' | 'tools' | 'history' | 'memory';

function AppInner() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('create');
  const [reexplorePrompt, setReexplorePrompt] = useState<string | undefined>();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#d1ccbf' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2.5px solid rgba(130,88,109,0.2)', borderTopColor: '#82586d', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  function handleReexplore(prompt: string) {
    setReexplorePrompt(prompt);
    setPage('create');
  }

  function handleMemorySave(prompt: string, lensOutput: string) {
    addMemory(prompt, lensOutput);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#d1ccbf' }}>
      <Sidebar page={page} setPage={setPage} />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {page === 'create'  && (
          <Workspace
            onMemorySave={handleMemorySave}
            initialPrompt={reexplorePrompt}
            onPromptConsumed={() => setReexplorePrompt(undefined)}
          />
        )}
        {page === 'tools'   && <ToolsPage />}
        {page === 'history' && <HistoryPage onReexplore={handleReexplore} />}
        {page === 'memory'  && <MemoryPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
