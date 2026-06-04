import { Router } from 'express';
import { z } from 'zod';
import { selectNodes, selectByTypes } from '@workflow-architect/n8n-catalog';
import { classifyIntent } from '../services/classify.js';
import { buildWorkflow } from '../services/build-workflow.js';
import { translateToN8n } from '../services/translate.js';
import { validateWorkflow } from '../services/validate.js';

export const generateRouter = Router();

const Body = z.object({
  prompt: z.string().min(10).max(2000),
});

function sseWrite(res: import('express').Response, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

generateRouter.post('/', async (req, res) => {
  const body = Body.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.issues[0]?.message ?? 'Invalid input' });
    return;
  }

  const { prompt } = body.data;

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    // Step 1: Classify
    sseWrite(res, 'progress', { step: 1, message: 'Classifying intent…' });
    const typeIds = await classifyIntent(prompt);

    // Step 2: Select catalog subset
    sseWrite(res, 'progress', { step: 2, message: 'Selecting relevant nodes…' });
    const catalogNodes =
      typeIds.length > 0 ? selectByTypes(typeIds) : selectNodes(prompt);

    // Step 3: Build workflow IR via tool use
    sseWrite(res, 'progress', { step: 3, message: 'Building workflow structure…' });
    const ir = await buildWorkflow(prompt, catalogNodes);

    // Step 4: Translate to n8n JSON
    sseWrite(res, 'progress', { step: 4, message: 'Translating to n8n format…' });
    const n8nWorkflow = translateToN8n(ir);

    // Step 5: Validate
    sseWrite(res, 'progress', { step: 5, message: 'Validating…' });
    const validation = validateWorkflow(n8nWorkflow);

    if (!validation.valid) {
      sseWrite(res, 'error', {
        message: 'Workflow failed validation',
        warnings: validation.warnings,
      });
      res.end();
      return;
    }

    sseWrite(res, 'workflow', {
      workflow: validation.data,
      summary: `Generated "${ir.name}": ${ir.description}`,
      warnings: validation.warnings,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    sseWrite(res, 'error', { message });
  }

  res.end();
});
