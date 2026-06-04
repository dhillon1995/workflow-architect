import Anthropic from '@anthropic-ai/sdk';
import { selectByTypes, buildCatalogContext } from '@workflow-architect/n8n-catalog';
import { WorkflowDiagnosis } from '@workflow-architect/shared';
import type { N8nWorkflow } from '@workflow-architect/shared';
import { set as lodashSet } from '../lib/set-path.js';

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });

const diagnoseWorkflowTool: Anthropic.Tool = {
  name: 'diagnose_workflow',
  description: 'Diagnose the root cause of a broken n8n workflow and provide structured fixes.',
  input_schema: {
    type: 'object' as const,
    properties: {
      rootCause: { type: 'string', description: 'One sentence root cause' },
      affectedNodeId: { type: 'string' },
      affectedNodeName: { type: 'string' },
      category: {
        type: 'string',
        enum: ['auth', 'params', 'expression', 'connection', 'logic', 'version', 'timeout', 'other'],
      },
      explanation: {
        type: 'string',
        description: 'Markdown explanation with the problem, why it occurred, and how to fix it',
      },
      suggestedFixes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            nodeId: { type: 'string' },
            nodeName: { type: 'string' },
            paramPath: {
              type: 'string',
              description:
                'Dot-notation path relative to the node object. E.g. "parameters.channel", "typeVersion", "credentials.slackApi.name"',
            },
            oldValue: { description: 'Current (incorrect) value, if known' },
            newValue: { description: 'Corrected value' },
            description: { type: 'string', description: 'Human-readable fix description' },
          },
          required: ['nodeId', 'nodeName', 'paramPath', 'newValue', 'description'],
        },
      },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
    },
    required: ['rootCause', 'category', 'explanation', 'suggestedFixes', 'confidence'],
  },
};

/** Extract node names mentioned in the error message */
function extractMentionedNodes(errorText: string, workflow: N8nWorkflow): string[] {
  const mentioned: string[] = [];
  for (const node of workflow.nodes) {
    if (errorText.includes(`"${node.name}"`) || errorText.includes(node.name)) {
      mentioned.push(node.name);
    }
    // Also match on type string
    if (errorText.includes(node.type)) {
      mentioned.push(node.name);
    }
  }
  return [...new Set(mentioned)];
}

/** Apply patches from suggestedFixes to a deep clone of the workflow */
export function applyFixes(
  workflow: N8nWorkflow,
  fixes: WorkflowDiagnosis['suggestedFixes'],
): N8nWorkflow {
  // Deep clone via JSON round-trip
  const fixed = JSON.parse(JSON.stringify(workflow)) as N8nWorkflow;

  for (const fix of fixes) {
    const node = fixed.nodes.find((n) => n.id === fix.nodeId || n.name === fix.nodeName);
    if (!node) continue;

    // Apply the patch using dot-notation path relative to the node object
    lodashSet(node as Record<string, unknown>, fix.paramPath, fix.newValue);
  }

  return fixed;
}

export async function diagnoseWorkflow(
  workflow: N8nWorkflow,
  errorText: string,
): Promise<{
  diagnosis: WorkflowDiagnosis;
  fixed: N8nWorkflow;
}> {
  const mentionedNodeNames = extractMentionedNodes(errorText, workflow);
  const mentionedNodes = workflow.nodes.filter(
    (n) => mentionedNodeNames.includes(n.name) || mentionedNodeNames.length === 0,
  );

  // Get catalog context for the affected node types
  const nodeTypes = mentionedNodes.map((n) => n.type);
  const catalogNodes = selectByTypes(nodeTypes);
  const catalogContext = buildCatalogContext(catalogNodes);

  const workflowSummary = {
    name: workflow.name,
    nodes: workflow.nodes.map((n) => ({
      id: n.id,
      name: n.name,
      type: n.type,
      typeVersion: n.typeVersion,
      hasCredentials: Boolean(n.credentials),
      parameters: n.parameters,
    })),
    connections: workflow.connections,
  };

  const systemPrompt: Anthropic.TextBlockParam[] = [
    {
      type: 'text',
      text: `You are an expert n8n workflow debugger. Diagnose broken workflows with precision.

CATALOG CONTEXT (for affected nodes):
${catalogContext || '(no catalog match — use your knowledge of n8n)'}

RULES:
- Be specific: identify the exact field causing the problem.
- For paramPath, use dot-notation relative to the node object (e.g. "parameters.channel", "typeVersion", "credentials.slackApi.id").
- For expression errors, provide the corrected expression as newValue.
- For version mismatches, update typeVersion and any changed parameter keys.
- For connection errors, the fix targets the connections object — use "connections.<SourceName>.main" as the path concept, but describe it clearly.
- Confidence 0.9+ means you are certain; 0.5 means plausible but verify.`,
      cache_control: { type: 'ephemeral' },
    },
  ];

  const userMessage = `WORKFLOW:
${JSON.stringify(workflowSummary, null, 2)}

ERROR:
${errorText}

Diagnose the root cause and provide structured fixes.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    tools: [diagnoseWorkflowTool],
    tool_choice: { type: 'tool', name: 'diagnose_workflow' },
    messages: [{ role: 'user', content: userMessage }],
  });

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
  );
  if (!toolUse) throw new Error('No diagnosis returned');

  const parsed = WorkflowDiagnosis.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(`Invalid diagnosis: ${parsed.error.message}`);
  }

  const diagnosis = parsed.data;
  const fixed = applyFixes(workflow, diagnosis.suggestedFixes);

  return { diagnosis, fixed };
}
