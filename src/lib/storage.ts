export interface HistoryEntry {
  id: string;
  prompt: string;
  timestamp: number;
}

export interface MemoryEntry {
  id: string;
  prompt: string;
  lensOutput: string;
  timestamp: number;
}

const HISTORY_KEY = 'rialai_history';
const MEMORY_KEY  = 'rialai_memory';

export function getHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]'); } catch { return []; }
}

export function addHistory(prompt: string): void {
  const entries = getHistory();
  const entry: HistoryEntry = { id: `h_${Date.now()}`, prompt, timestamp: Date.now() };
  localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...entries].slice(0, 50)));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function getMemory(): MemoryEntry[] {
  try { return JSON.parse(localStorage.getItem(MEMORY_KEY) ?? '[]'); } catch { return []; }
}

export function addMemory(prompt: string, lensOutput: string): void {
  const entries = getMemory();
  if (entries.some(e => e.prompt === prompt)) return;
  const entry: MemoryEntry = { id: `m_${Date.now()}`, prompt, lensOutput, timestamp: Date.now() };
  localStorage.setItem(MEMORY_KEY, JSON.stringify([entry, ...entries].slice(0, 30)));
}

export function deleteMemory(id: string): void {
  localStorage.setItem(MEMORY_KEY, JSON.stringify(getMemory().filter(e => e.id !== id)));
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}
