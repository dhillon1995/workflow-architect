import { useState, useEffect, useCallback } from 'react';

export interface HistoryEntry {
  id: string;
  prompt: string;
  workflowName: string;
  timestamp: number;
  workflow: Record<string, unknown>;
}

const KEY = 'wa:history';
const MAX = 20;

function load(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function save(entries: HistoryEntry[]): void {
  localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
}

export function useWorkflowHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(load);

  useEffect(() => {
    save(history);
  }, [history]);

  const addEntry = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const full: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setHistory((prev) => [full, ...prev.filter((e) => e.prompt !== entry.prompt)]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  return { history, addEntry, removeEntry, clearHistory };
}
