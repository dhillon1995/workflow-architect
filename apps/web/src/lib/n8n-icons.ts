import {
  Globe, Clock, FileText, Layout, Github, CreditCard, ShoppingBag,
  Database, Mail, Building2, AlertCircle, Play, MessageSquare,
  MessageCircle, Send, Phone, Table2, BookOpen, HardDrive, Cloud,
  Bot, Sparkles, AlignLeft, Braces, Code2, GitFork, GitBranch,
  Merge, PenSquare, RotateCcw, Timer, Reply, Lock, Calendar,
  Minus, StickyNote, Ticket, Layers, CheckSquare, LayoutGrid,
  Headphones, TrendingUp, Video, Users, CalendarDays, Zap,
  Laptop, Package, type LucideIcon,
} from 'lucide-react';

const NODE_ICONS: Record<string, LucideIcon> = {
  // Triggers
  'n8n-nodes-base.manualTrigger': Play,
  'n8n-nodes-base.webhook': Globe,
  'n8n-nodes-base.scheduleTrigger': Clock,
  'n8n-nodes-base.errorTrigger': AlertCircle,
  'n8n-nodes-base.typeformTrigger': FileText,
  'n8n-nodes-base.n8nFormTrigger': Layout,
  'n8n-nodes-base.githubTrigger': Github,
  'n8n-nodes-base.stripeTrigger': CreditCard,
  'n8n-nodes-base.shopifyTrigger': ShoppingBag,
  'n8n-nodes-base.airtableTrigger': Database,
  'n8n-nodes-base.emailReadImap': Mail,
  'n8n-nodes-base.hubspotTrigger': Building2,

  // Communication
  'n8n-nodes-base.slack': MessageSquare,
  'n8n-nodes-base.discord': MessageCircle,
  'n8n-nodes-base.gmail': Mail,
  'n8n-nodes-base.emailSend': Send,
  'n8n-nodes-base.telegram': Send,
  'n8n-nodes-base.twilio': Phone,
  'n8n-nodes-base.microsoftTeams': Users,

  // Data
  'n8n-nodes-base.googleSheets': Table2,
  'n8n-nodes-base.airtable': Database,
  'n8n-nodes-base.notion': BookOpen,
  'n8n-nodes-base.postgres': Database,
  'n8n-nodes-base.mySql': Database,
  'n8n-nodes-base.mongoDb': Database,
  'n8n-nodes-base.redis': Zap,
  'n8n-nodes-base.googleDrive': HardDrive,
  'n8n-nodes-base.googleDocs': FileText,
  'n8n-nodes-base.awsS3': Cloud,
  'n8n-nodes-base.dropbox': Cloud,

  // AI
  '@n8n/n8n-nodes-langchain.agent': Bot,
  '@n8n/n8n-nodes-langchain.chainLlm': Sparkles,
  '@n8n/n8n-nodes-langchain.chainSummarization': AlignLeft,
  '@n8n/n8n-nodes-langchain.lmChatAnthropic': Sparkles,
  '@n8n/n8n-nodes-langchain.lmChatOpenAi': Sparkles,
  '@n8n/n8n-nodes-langchain.outputParserStructured': Braces,

  // Utility
  'n8n-nodes-base.httpRequest': Globe,
  'n8n-nodes-base.code': Code2,
  'n8n-nodes-base.if': GitFork,
  'n8n-nodes-base.switch': GitBranch,
  'n8n-nodes-base.merge': Merge,
  'n8n-nodes-base.set': PenSquare,
  'n8n-nodes-base.splitInBatches': RotateCcw,
  'n8n-nodes-base.wait': Timer,
  'n8n-nodes-base.respondToWebhook': Reply,
  'n8n-nodes-base.noOp': Minus,
  'n8n-nodes-base.stickyNote': StickyNote,
  'n8n-nodes-base.xml': Code2,
  'n8n-nodes-base.crypto': Lock,
  'n8n-nodes-base.dateTime': Calendar,

  // Apps
  'n8n-nodes-base.github': Github,
  'n8n-nodes-base.jira': Ticket,
  'n8n-nodes-base.linear': Layers,
  'n8n-nodes-base.hubspot': Building2,
  'n8n-nodes-base.salesforce': Cloud,
  'n8n-nodes-base.stripe': CreditCard,
  'n8n-nodes-base.shopify': ShoppingBag,
  'n8n-nodes-base.asana': CheckSquare,
  'n8n-nodes-base.trello': LayoutGrid,
  'n8n-nodes-base.zendesk': Headphones,
  'n8n-nodes-base.pipedrive': TrendingUp,
  'n8n-nodes-base.zoom': Video,
  'n8n-nodes-base.freshdesk': Headphones,
  'n8n-nodes-base.calCom': CalendarDays,
};

export function getNodeIcon(type: string): LucideIcon {
  return NODE_ICONS[type] ?? Package;
}

const TRIGGER_TYPES = new Set([
  'n8n-nodes-base.manualTrigger',
  'n8n-nodes-base.webhook',
  'n8n-nodes-base.scheduleTrigger',
  'n8n-nodes-base.errorTrigger',
  'n8n-nodes-base.typeformTrigger',
  'n8n-nodes-base.n8nFormTrigger',
  'n8n-nodes-base.githubTrigger',
  'n8n-nodes-base.stripeTrigger',
  'n8n-nodes-base.shopifyTrigger',
  'n8n-nodes-base.airtableTrigger',
  'n8n-nodes-base.emailReadImap',
  'n8n-nodes-base.hubspotTrigger',
]);

export function isTrigger(type: string): boolean {
  return TRIGGER_TYPES.has(type) || type.toLowerCase().includes('trigger');
}

const TRANSFORM_TYPES = new Set([
  'n8n-nodes-base.code',
  'n8n-nodes-base.if',
  'n8n-nodes-base.switch',
  'n8n-nodes-base.merge',
  'n8n-nodes-base.set',
  'n8n-nodes-base.splitInBatches',
  'n8n-nodes-base.wait',
  'n8n-nodes-base.xml',
  'n8n-nodes-base.crypto',
  'n8n-nodes-base.dateTime',
  'n8n-nodes-base.noOp',
  'n8n-nodes-base.stickyNote',
]);

const ACTION_TYPES = new Set([
  'n8n-nodes-base.httpRequest',
  'n8n-nodes-base.respondToWebhook',
  '@n8n/n8n-nodes-langchain.agent',
  '@n8n/n8n-nodes-langchain.chainLlm',
  '@n8n/n8n-nodes-langchain.chainSummarization',
  '@n8n/n8n-nodes-langchain.lmChatAnthropic',
  '@n8n/n8n-nodes-langchain.lmChatOpenAi',
  '@n8n/n8n-nodes-langchain.outputParserStructured',
]);

export type NodeCategory = 'trigger' | 'transform' | 'action' | 'integration';

export function getNodeCategory(type: string): NodeCategory {
  if (isTrigger(type)) return 'trigger';
  if (TRANSFORM_TYPES.has(type)) return 'transform';
  if (ACTION_TYPES.has(type)) return 'action';
  return 'integration';
}

export { type LucideIcon };
