import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const catalog: CatalogNode[] = require('../nodes.json') as CatalogNode[];

export interface CatalogNode {
  type: string;
  displayName: string;
  category: string;
  description: string;
  isTrigger: boolean;
  typeVersion: number;
  keywords: string[];
  requiredParameters: CatalogParameter[];
  optionalParameters: CatalogParameter[];
  credentialsType: string | null;
  examplePrompt: string;
}

export interface CatalogParameter {
  name: string;
  type: string;
  options?: string[];
  default?: unknown;
  description?: string;
}

export function getAllNodes(): CatalogNode[] {
  return catalog;
}

export function getNodeByType(type: string): CatalogNode | undefined {
  return catalog.find((n) => n.type === type);
}

/**
 * Score a catalog node against the intent text.
 * Returns 0 if not relevant, higher = more relevant.
 */
function scoreNode(node: CatalogNode, intentTokens: string[]): number {
  const corpus = [
    node.displayName.toLowerCase(),
    node.description.toLowerCase(),
    node.category.toLowerCase(),
    node.examplePrompt.toLowerCase(),
    ...node.keywords.map((k) => k.toLowerCase()),
  ].join(' ');

  let score = 0;
  for (const token of intentTokens) {
    if (token.length < 3) continue;
    if (corpus.includes(token)) {
      if (node.keywords.some((k) => k.toLowerCase() === token)) {
        score += 4;
      } else if (node.displayName.toLowerCase().includes(token)) {
        score += 3;
      } else {
        score += 1;
      }
    }
  }

  return score;
}

/**
 * Select the most relevant catalog nodes for the given intent string.
 * Returns at most `maxNodes` entries, always including at least one trigger if any match.
 */
export function selectNodes(
  intent: string,
  maxNodes = 12,
): CatalogNode[] {
  const tokens = intent
    .toLowerCase()
    .replace(/[^a-z0-9\s#@]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);

  const scored = catalog
    .map((node) => ({ node, score: scoreNode(node, tokens) }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score);

  const topTrigger = scored.find((e) => e.node.isTrigger);
  const topNonTriggers = scored
    .filter((e) => !e.node.isTrigger)
    .slice(0, maxNodes - 1);

  const selected = new Map<string, CatalogNode>();

  if (topTrigger) selected.set(topTrigger.node.type, topTrigger.node);
  for (const e of topNonTriggers) {
    if (selected.size >= maxNodes) break;
    selected.set(e.node.type, e.node);
  }

  if (selected.size === 0) {
    const fallbacks = catalog.filter((n) =>
      ['n8n-nodes-base.manualTrigger', 'n8n-nodes-base.httpRequest'].includes(n.type),
    );
    fallbacks.forEach((n) => selected.set(n.type, n));
  }

  return Array.from(selected.values());
}

/**
 * Select nodes by explicit list of type strings (used in debug mode).
 */
export function selectByTypes(types: string[]): CatalogNode[] {
  return types.flatMap((t) => {
    const found = catalog.find((n) => n.type === t);
    return found ? [found] : [];
  });
}

/**
 * Render a compact catalog entry for injection into a Claude prompt.
 */
export function formatForPrompt(node: CatalogNode): string {
  const required = node.requiredParameters
    .map((p) => `    - ${p.name} (${p.type})${p.description ? ': ' + p.description : ''}`)
    .join('\n');

  const optional = node.optionalParameters
    .slice(0, 3)
    .map((p) => `    - ${p.name} (${p.type})`)
    .join('\n');

  return [
    `Node: ${node.displayName}`,
    `  type: "${node.type}"`,
    `  typeVersion: ${node.typeVersion}`,
    `  isTrigger: ${node.isTrigger}`,
    `  credentialsType: ${node.credentialsType ?? 'null'}`,
    `  requiredParameters:`,
    required || '    (none)',
    optional ? `  optionalParameters (top 3):\n${optional}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Build the catalog context block for a Claude prompt, from selected node types.
 */
export function buildCatalogContext(nodes: CatalogNode[]): string {
  return nodes.map(formatForPrompt).join('\n\n');
}
