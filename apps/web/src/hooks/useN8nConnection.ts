import { useState, useCallback } from 'react';

export interface N8nConnection {
  baseUrl: string;
  apiKey: string;
}

const SESSION_KEY = 'wa:n8n-connection';

function loadConnection(): N8nConnection | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as N8nConnection) : null;
  } catch {
    return null;
  }
}

export function useN8nConnection() {
  const [connection, setConnectionState] = useState<N8nConnection | null>(loadConnection);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const connect = useCallback(async (baseUrl: string, apiKey: string): Promise<boolean> => {
    setTesting(true);
    setTestError(null);
    try {
      const url = baseUrl.replace(/\/$/, '');
      const res = await fetch(`${url}/api/v1/workflows?limit=1`, {
        headers: { 'X-N8N-API-KEY': apiKey },
      });
      if (!res.ok) {
        setTestError(`Connection failed: HTTP ${res.status}`);
        return false;
      }
      const conn: N8nConnection = { baseUrl: url, apiKey };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(conn));
      setConnectionState(conn);
      return true;
    } catch (err) {
      setTestError(err instanceof Error ? err.message : 'Connection failed');
      return false;
    } finally {
      setTesting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setConnectionState(null);
  }, []);

  const deployWorkflow = useCallback(
    async (workflow: Record<string, unknown>): Promise<string | null> => {
      if (!connection) return null;
      const res = await fetch(`${connection.baseUrl}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': connection.apiKey,
        },
        body: JSON.stringify(workflow),
      });
      if (!res.ok) throw new Error(`Deploy failed: HTTP ${res.status}`);
      const data = (await res.json()) as { id?: string };
      return data.id ?? null;
    },
    [connection],
  );

  return { connection, connect, disconnect, deployWorkflow, testing, testError };
}
