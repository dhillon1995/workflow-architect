import Anthropic from '@anthropic-ai/sdk';
import { getAllNodes } from '@workflow-architect/n8n-catalog';

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });

const allNodes = getAllNodes();
const catalogIndex = allNodes
  .map((n) => `- ${n.displayName} → "${n.type}"`)
  .join('\n');

const SYSTEM = `You are an n8n workflow expert. Given a natural language workflow description, identify which n8n node types are needed.

Available nodes:
${catalogIndex}

Respond with ONLY a JSON array of node type strings, e.g.: ["n8n-nodes-base.webhook","n8n-nodes-base.slack"]
Include the trigger node type and all action/utility nodes required.
Return at most 12 node types. Include only nodes that are in the list above.`;

export async function classifyIntent(prompt: string): Promise<string[]> {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content.find((b) => b.type === 'text')?.text ?? '[]';

  try {
    const match = text.match(/\[[\s\S]*\]/);
    const parsed: unknown = JSON.parse(match?.[0] ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    return [];
  }
}
