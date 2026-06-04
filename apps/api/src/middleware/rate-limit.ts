import type { Request, Response, NextFunction } from 'express';

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const CAPACITY = 10;
const REFILL_RATE = 10; // tokens per minute
const buckets = new Map<string, Bucket>();

function getIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
    req.socket.remoteAddress ??
    'unknown'
  );
}

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = getIp(req);
  const now = Date.now();

  let bucket = buckets.get(ip);
  if (!bucket) {
    bucket = { tokens: CAPACITY, lastRefill: now };
  }

  const elapsed = (now - bucket.lastRefill) / 60_000;
  bucket.tokens = Math.min(CAPACITY, bucket.tokens + elapsed * REFILL_RATE);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    buckets.set(ip, bucket);
    res.status(429).json({ error: 'Rate limit exceeded. Try again in a moment.' });
    return;
  }

  bucket.tokens -= 1;
  buckets.set(ip, bucket);
  next();
}
