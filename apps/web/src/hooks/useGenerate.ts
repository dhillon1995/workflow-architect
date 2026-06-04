import { useState, useCallback } from 'react';
import { generateWorkflow } from '../lib/api.js';

export type GenerateStatus = 'idle' | 'running' | 'done' | 'error';

export interface GenerateState {
  status: GenerateStatus;
  progress: string;
  workflow: Record<string, unknown> | null;
  summary: string;
  warnings: string[];
  error: string | null;
}

export function useGenerate() {
  const [state, setState] = useState<GenerateState>({
    status: 'idle',
    progress: '',
    workflow: null,
    summary: '',
    warnings: [],
    error: null,
  });

  const generate = useCallback(async (prompt: string) => {
    setState({ status: 'running', progress: 'Starting…', workflow: null, summary: '', warnings: [], error: null });

    try {
      for await (const event of generateWorkflow(prompt)) {
        if (event.type === 'progress') {
          setState((s) => ({ ...s, progress: event.message }));
        } else if (event.type === 'workflow') {
          setState({
            status: 'done',
            progress: '',
            workflow: event.workflow,
            summary: event.summary,
            warnings: event.warnings,
            error: null,
          });
          return event.workflow;
        } else if (event.type === 'error') {
          setState((s) => ({ ...s, status: 'error', error: event.message }));
          return null;
        }
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
    return null;
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle', progress: '', workflow: null, summary: '', warnings: [], error: null });
  }, []);

  return { ...state, generate, reset };
}
