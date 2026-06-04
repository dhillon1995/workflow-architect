import { N8nWorkflow } from '@workflow-architect/shared';

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  data?: N8nWorkflow;
}

export function validateWorkflow(raw: unknown): ValidationResult {
  const warnings: string[] = [];
  const result = N8nWorkflow.safeParse(raw);

  if (!result.success) {
    return {
      valid: false,
      warnings: result.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`,
      ),
    };
  }

  const wf = result.data;

  // Warn about missing credentials
  for (const node of wf.nodes) {
    if (!node.credentials && node.type !== 'n8n-nodes-base.manualTrigger') {
      const needsCreds = [
        'slack', 'gmail', 'hubspot', 'salesforce', 'github', 'notion',
        'airtable', 'postgres', 'mySql', 'googleSheets', 'stripe', 'shopify',
        'discord', 'telegram', 'twilio', 'jira', 'linear', 'anthropic', 'openAi',
      ].some((svc) => node.type.toLowerCase().includes(svc.toLowerCase()));
      if (needsCreds) {
        warnings.push(
          `Node "${node.name}" likely needs credentials — configure them in n8n before activating.`,
        );
      }
    }
  }

  // Warn about connection integrity
  const nodeNames = new Set(wf.nodes.map((n) => n.name));
  for (const [sourceName, connMap] of Object.entries(wf.connections)) {
    if (!nodeNames.has(sourceName)) {
      warnings.push(
        `Connection key "${sourceName}" does not match any node name. Check for typos.`,
      );
    }
    for (const portConns of Object.values(connMap)) {
      for (const connList of portConns) {
        for (const conn of connList) {
          if (!nodeNames.has(conn.node)) {
            warnings.push(
              `Connection target "${conn.node}" does not match any node name.`,
            );
          }
        }
      }
    }
  }

  return { valid: true, warnings, data: wf };
}
