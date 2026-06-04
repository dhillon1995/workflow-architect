import { z } from 'zod';

// Intermediate representation — structured output from Claude's build_workflow tool.
// Pure, validated, LLM-facing. The translate service turns this into n8n JSON.

const IRParameter = z.object({
  name: z.string(),
  value: z.unknown(),
});

const IRCredential = z.object({
  // The credential type key used in n8n (e.g. "slackApi", "googleSheetsOAuth2Api")
  type: z.string(),
  // Human-readable label Claude picks for the credential reference
  displayName: z.string(),
});

export const IRNode = z.object({
  // Stable short ID used in dependsOn references (e.g. "node_1", "node_2")
  id: z.string().regex(/^[a-z0-9_]+$/),
  // n8n node type string from the catalog (e.g. "n8n-nodes-base.slack")
  nodeType: z.string(),
  // Display name that will appear in the canvas
  label: z.string(),
  parameters: z.array(IRParameter),
  credential: IRCredential.optional(),
  // IDs of upstream nodes this node depends on
  dependsOn: z.array(z.string()).default([]),
});

export const IRTrigger = z.object({
  nodeType: z.string(),
  label: z.string(),
  parameters: z.array(IRParameter),
  credential: IRCredential.optional(),
});

export const IRWorkflow = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(300),
  trigger: IRTrigger,
  steps: z.array(IRNode).min(1).max(20),
});

export type IRWorkflow = z.infer<typeof IRWorkflow>;
export type IRNode = z.infer<typeof IRNode>;
export type IRTrigger = z.infer<typeof IRTrigger>;
export type IRParameter = z.infer<typeof IRParameter>;

// Diagnosis output — structured output from Claude's diagnose_workflow tool
export const DiagnosisCategory = z.enum([
  'auth',
  'params',
  'expression',
  'connection',
  'logic',
  'version',
  'timeout',
  'other',
]);

export const SuggestedFix = z.object({
  nodeId: z.string(),
  nodeName: z.string(),
  paramPath: z.string(),
  oldValue: z.unknown().optional(),
  newValue: z.unknown(),
  description: z.string(),
});

export const WorkflowDiagnosis = z.object({
  rootCause: z.string(),
  affectedNodeId: z.string().optional(),
  affectedNodeName: z.string().optional(),
  category: DiagnosisCategory,
  // Markdown-formatted explanation
  explanation: z.string(),
  suggestedFixes: z.array(SuggestedFix),
  // Confidence 0-1 that the diagnosis is correct
  confidence: z.number().min(0).max(1),
});

export type WorkflowDiagnosis = z.infer<typeof WorkflowDiagnosis>;
export type SuggestedFix = z.infer<typeof SuggestedFix>;
export type DiagnosisCategory = z.infer<typeof DiagnosisCategory>;

// Generate API response
export const GenerateResponse = z.object({
  workflow: z.record(z.unknown()),
  summary: z.string(),
  warnings: z.array(z.string()),
});

export type GenerateResponse = z.infer<typeof GenerateResponse>;

// Debug API response
export const DebugResponse = z.object({
  diagnosis: WorkflowDiagnosis,
  original: z.record(z.unknown()),
  fixed: z.record(z.unknown()),
});

export type DebugResponse = z.infer<typeof DebugResponse>;
