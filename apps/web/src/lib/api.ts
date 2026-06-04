const API_BASE = '/projects/workflowarchitect/api';

export interface ProgressEvent {
  type: 'progress';
  step?: number;
  message: string;
}

export interface WorkflowEvent {
  type: 'workflow';
  workflow: Record<string, unknown>;
  summary: string;
  warnings: string[];
}

export interface DiagnosisEvent {
  type: 'diagnosis';
  diagnosis: import('@workflow-architect/shared').WorkflowDiagnosis;
  original: Record<string, unknown>;
  fixed: Record<string, unknown>;
}

export interface ErrorEvent {
  type: 'error';
  message: string;
}

export type GenerateStreamEvent = ProgressEvent | WorkflowEvent | ErrorEvent;
export type DebugStreamEvent = ProgressEvent | DiagnosisEvent | ErrorEvent;

async function* parseSSE(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<{ event: string; data: unknown }> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const messages = buffer.split('\n\n');
    buffer = messages.pop() ?? '';

    for (const msg of messages) {
      if (!msg.trim()) continue;
      let event = 'message';
      let data = '';
      for (const line of msg.split('\n')) {
        if (line.startsWith('event: ')) event = line.slice(7).trim();
        else if (line.startsWith('data: ')) data = line.slice(6);
      }
      try {
        yield { event, data: JSON.parse(data) };
      } catch {
        // ignore malformed chunks
      }
    }
  }
}

export async function* generateWorkflow(
  prompt: string,
): AsyncGenerator<GenerateStreamEvent> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text();
    yield { type: 'error', message: text || `HTTP ${res.status}` };
    return;
  }

  for await (const { event, data } of parseSSE(res.body)) {
    if (event === 'progress') yield { type: 'progress', ...(data as object) } as ProgressEvent;
    else if (event === 'workflow') yield { type: 'workflow', ...(data as object) } as WorkflowEvent;
    else if (event === 'error') yield { type: 'error', ...(data as object) } as ErrorEvent;
  }
}

export async function* debugWorkflow(
  workflow: Record<string, unknown>,
  error: string,
): AsyncGenerator<DebugStreamEvent> {
  const res = await fetch(`${API_BASE}/debug`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflow, error }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text();
    yield { type: 'error', message: text || `HTTP ${res.status}` };
    return;
  }

  for await (const { event, data } of parseSSE(res.body)) {
    if (event === 'progress') yield { type: 'progress', ...(data as object) } as ProgressEvent;
    else if (event === 'diagnosis') yield { type: 'diagnosis', ...(data as object) } as DiagnosisEvent;
    else if (event === 'error') yield { type: 'error', ...(data as object) } as ErrorEvent;
  }
}
