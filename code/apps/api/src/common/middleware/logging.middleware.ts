import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const logger = new Logger('HTTP');

export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const { method, originalUrl } = req;
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.log(`${method} ${originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
}
