import { HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const windowMs = 60_000;
const maxRequests = 100;

const store = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 300_000);

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    ?? req.ip
    ?? req.socket.remoteAddress
    ?? 'unknown';

  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }

  entry.count++;

  if (entry.count > maxRequests) {
    res.status(HttpStatus.TOO_MANY_REQUESTS).json({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: '请求过于频繁，请稍后再试',
    });
    return;
  }

  next();
}
