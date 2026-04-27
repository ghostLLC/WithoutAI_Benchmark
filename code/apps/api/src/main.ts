import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { loggingMiddleware } from './common/middleware/logging.middleware';
import { rateLimitMiddleware } from './common/middleware/rate-limit.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors();

  // 全局 DTO 校验管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 限流中间件
  app.use(rateLimitMiddleware);

  // 请求日志中间件
  app.use(loggingMiddleware);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API server running on http://localhost:${port}`);
}
bootstrap();
