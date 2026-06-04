import { Router } from 'express';
import { z } from 'zod';
import { N8nWorkflow } from '@workflow-architect/shared';
import { diagnoseWorkflow } from '../services/diagnose.js';

export const debugRouter = Router();

const Body = z.object({
  workflow: z.record(z.unknown()),
  error: z.string().min(1).max(5000),
});

function sseWrite(res: import('express').Response, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

debugRouter.post('/', async (req, res) => {
  const body = Body.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: 'workflow (object) and error (string) are required' });
    return;
  }

  const workflowParsed = N8nWorkflow.safeParse(body.data.workflow);
  if (!workflowParsed.success) {
    res.status(400).json({
      error: 'Invalid n8n workflow JSON',
      details: workflowParsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    sseWrite(res, 'progress', { message: 'Parsing workflow and locating failure…' });
    const { diagnosis, fixed } = await diagnoseWorkflow(
      workflowParsed.data,
      body.data.error,
    );

    sseWrite(res, 'diagnosis', {
      diagnosis,
      original: body.data.workflow,
      fixed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    sseWrite(res, 'error', { message });
  }

  res.end();
});
