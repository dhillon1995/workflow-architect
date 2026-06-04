import Anthropic from '@anthropic-ai/sdk';
import type { CatalogNode } from '@workflow-architect/n8n-catalog';
import { buildCatalogContext } from '@workflow-architect/n8n-catalog';
import { IRWorkflow } from '@workflow-architect/shared';

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });

const buildWorkflowTool: Anthropic.Tool = {
  name: 'build_workflow',
  description:
    'Build a structured n8n workflow from the user description. Use ONLY node types from the catalog context.',
  input_schema: {
    type: 'object' as const,
    properties: {
      name: { type: 'string', description: 'Short workflow name (max 60 chars)' },
      description: { type: 'string', description: 'One sentence description' },
      trigger: {
        type: 'object',
        description: 'The trigger node — what starts this workflow',
        properties: {
          nodeType: { type: 'string', description: 'Exact type string from catalog' },
          label: { type: 'string', description: 'Display name for this node in the canvas' },
          parameters: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                value: { description: 'Parameter value — string, number, boolean, or object' },
              },
              required: ['name', 'value'],
            },
          },
          credential: {
            type: 'object',
            properties: {
              type: { type: 'string', description: 'credentialsType from catalog' },
              displayName: { type: 'string', description: 'Human name for the credential' },
            },
            required: ['type', 'displayName'],
          },
        },
        required: ['nodeType', 'label', 'parameters'],
      },
      steps: {
        type: 'array',
        description: 'Action/utility nodes in dependency order',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Short stable ID like node_1, node_2' },
            nodeType: { type: 'string', description: 'Exact type string from catalog' },
            label: { type: 'string', description: 'Display name for this node' },
            parameters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  value: { description: 'Parameter value' },
                },
                required: ['name', 'value'],
              },
            },
            credential: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                displayName: { type: 'string' },
              },
              required: ['type', 'displayName'],
            },
            dependsOn: {
              type: 'array',
              items: { type: 'string' },
              description:
                'IDs of upstream nodes this step depends on. Empty array means it runs immediately after the trigger.',
            },
          },
          required: ['id', 'nodeType', 'label', 'parameters', 'dependsOn'],
        },
      },
    },
    required: ['name', 'description', 'trigger', 'steps'],
  },
};

export async function buildWorkflow(
  prompt: string,
  catalogNodes: CatalogNode[],
): Promise<IRWorkflow> {
  const catalogContext = buildCatalogContext(catalogNodes);

  const system: Anthropic.TextBlockParam[] = [
    {
      type: 'text',
      text: `You are an expert n8n workflow builder. Build valid n8n workflows using ONLY the node types listed below.

CRITICAL RULES:
- Use ONLY node types from the catalog. Never invent node types.
- Connections are built from the "dependsOn" array — list the IDs of upstream steps.
- Steps with dependsOn: [] run immediately after the trigger.
- Generate realistic parameter values based on the user's description.
- For credential fields, use the credentialsType from the catalog as the "type" field.
- Keep labels short and descriptive (max 30 chars).

CATALOG:
${catalogContext}`,
      cache_control: { type: 'ephemeral' },
    },
  ];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system,
    tools: [buildWorkflowTool],
    tool_choice: { type: 'tool', name: 'build_workflow' },
    messages: [{ role: 'user', content: `Build an n8n workflow for: ${prompt}` }],
  });

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
  );

  if (!toolUse) {
    throw new Error('Claude did not return a tool_use block');
  }

  const parsed = IRWorkflow.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(
      `Invalid IR: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
    );
  }

  return parsed.data;
}
