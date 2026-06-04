import { z } from 'zod';

// Credential reference — IDs are placeholders, never real secrets
const CredentialRef = z.object({
  id: z.string(),
  name: z.string(),
});

// Connection target descriptor
const ConnectionTarget = z.object({
  node: z.string(),
  type: z.enum([
    'main',
    'ai_tool',
    'ai_memory',
    'ai_agent',
    'ai_document',
    'ai_embedding',
    'ai_languageModel',
    'ai_outputParser',
    'ai_retriever',
    'ai_textSplitter',
    'ai_vectorStore',
  ]),
  index: z.number().int().nonnegative(),
});

// Per-output-port connection list: array of connection arrays
// Outer index = output port number, inner = list of targets from that port
const PortConnections = z.array(z.array(ConnectionTarget));

// Node-level connection map: keys are output type names
const NodeConnectionMap = z.record(PortConnections);

const N8nNode = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  typeVersion: z.number(),
  position: z.tuple([z.number(), z.number()]),
  parameters: z.record(z.unknown()).default({}),
  credentials: z.record(CredentialRef).optional(),
  disabled: z.boolean().optional(),
  webhookId: z.string().optional(),
  notes: z.string().optional(),
  notesInFlow: z.boolean().optional(),
  retryOnFail: z.boolean().optional(),
  maxTries: z.number().int().optional(),
  waitBetweenTries: z.number().optional(),
  alwaysOutputData: z.boolean().optional(),
  executeOnce: z.boolean().optional(),
  continueOnFail: z.boolean().optional(),
  onError: z
    .enum(['continueRegularOutput', 'continueErrorOutput', 'stopWorkflow'])
    .optional(),
});

const N8nWorkflowSettings = z.object({
  executionOrder: z.enum(['v0', 'v1']).optional(),
  saveManualExecutions: z.boolean().optional(),
  callerPolicy: z.string().optional(),
  errorWorkflow: z.string().optional(),
  timezone: z.string().optional(),
  saveDataErrorExecution: z.enum(['all', 'none']).optional(),
  saveDataSuccessExecution: z.enum(['all', 'none']).optional(),
  saveExecutionProgress: z.boolean().optional(),
  executionTimeout: z.number().optional(),
});

const N8nTag = z.object({
  id: z.string(),
  name: z.string(),
});

const N8nMeta = z.object({
  templateCredsSetupCompleted: z.boolean().optional(),
  instanceId: z.string().optional(),
  templateId: z.string().optional(),
});

export const N8nWorkflow = z.object({
  name: z.string().min(1),
  nodes: z.array(N8nNode),
  // Connections keyed by source node NAME (not id) — this is the n8n gotcha
  connections: z.record(NodeConnectionMap),
  active: z.boolean().optional().default(false),
  settings: N8nWorkflowSettings.optional().default({ executionOrder: 'v1' }),
  staticData: z.unknown().optional(),
  pinData: z.record(z.unknown()).optional(),
  versionId: z.string().optional(),
  meta: N8nMeta.optional(),
  id: z.string().optional(),
  tags: z.array(N8nTag).optional(),
});

export type N8nWorkflow = z.infer<typeof N8nWorkflow>;
export type N8nNode = z.infer<typeof N8nNode>;
export type ConnectionTarget = z.infer<typeof ConnectionTarget>;
export type N8nWorkflowSettings = z.infer<typeof N8nWorkflowSettings>;

// Minimal workflow that will import cleanly into n8n
export const MinimalWorkflow = N8nWorkflow.pick({
  name: true,
  nodes: true,
  connections: true,
  active: true,
  settings: true,
});

export type MinimalWorkflow = z.infer<typeof MinimalWorkflow>;
