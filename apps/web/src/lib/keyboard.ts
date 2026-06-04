type Handler = (e: KeyboardEvent) => void;

const handlers = new Map<string, Handler[]>();

function keyId(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.metaKey || e.ctrlKey) parts.push('mod');
  if (e.shiftKey) parts.push('shift');
  if (e.altKey) parts.push('alt');
  parts.push(e.key.toLowerCase());
  return parts.join('+');
}

document.addEventListener('keydown', (e) => {
  const id = keyId(e);
  const list = handlers.get(id);
  if (list && list.length > 0) {
    e.preventDefault();
    list[list.length - 1]?.(e);
  }
});

export function registerShortcut(combo: string, handler: Handler): () => void {
  const existing = handlers.get(combo) ?? [];
  existing.push(handler);
  handlers.set(combo, existing);
  return () => {
    const cur = handlers.get(combo) ?? [];
    handlers.set(combo, cur.filter((h) => h !== handler));
  };
}
