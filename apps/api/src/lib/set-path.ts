/** Set a value at a dot-notation path on an object, creating intermediate objects as needed. */
export function set(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  let cur: Record<string, unknown> = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (key === undefined) break;
    if (cur[key] === null || typeof cur[key] !== 'object') {
      cur[key] = {};
    }
    cur = cur[key] as Record<string, unknown>;
  }

  const last = keys[keys.length - 1];
  if (last !== undefined) {
    cur[last] = value;
  }
}
