import { useState, useCallback } from 'react';
import { debugWorkflow } from '../lib/api.js';
import type { WorkflowDiagnosis } from '@workflow-architect/shared';

export type DebugStatus = 'idle' | 'running' | 'done' | 'error';

export interface DebugState {
  status: DebugStatus;
  progress: string;
  diagnosis: WorkflowDiagnosis | null;
  original: Record<string, unknown> | null;
  fixed: Record<string, unknown> | null;
  error: string | null;
}

export function useDebug() {
  const [state, setState] = useState<DebugState>({
    status: 'idle',
    progress: '',
    diagnosis: null,
    original: null,
    fixed: null,
    error: null,
  });

  const diagnose = useCallback(
    async (workflow: Record<string, unknown>, errorText: string) => {
      setState({ status: 'running', progress: 'Analysing…', diagnosis: null, original: null, fixed: null, error: null });

      try {
        for await (const event of debugWorkflow(workflow, errorText)) {
          if (event.type === 'progress') {
            setState((s) => ({ ...s, progress: event.message }));
          } else if (event.type === 'diagnosis') {
            setState({
              status: 'done',
              progress: '',
              diagnosis: event.diagnosis,
              original: event.original,
              fixed: event.fixed,
              error: null,
            });
            return;
          } else if (event.type === 'error') {
            setState((s) => ({ ...s, status: 'error', error: event.message }));
            return;
          }
        }
      } catch (err) {
        setState((s) => ({
          ...s,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        }));
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({ status: 'idle', progress: '', diagnosis: null, original: null, fixed: null, error: null });
  }, []);

  return { ...state, diagnose, reset };
}
