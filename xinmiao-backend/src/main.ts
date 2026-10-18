import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    credentials: true,
  });
  // 加大请求体限制（大文件上传）
  app.use(express.json({ limit: '500mb' }));
  app.use(express.urlencoded({ limit: '500mb', extended: true }));
  // 静态托管上传的图片文件
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  // 生产模式：托管前端打包好的静态文件（backend/public/）
  const publicDir = join(process.cwd(), 'public');
  app.use('/', express.static(publicDir));
  // SPA 路由回退：非 /api、非 /uploads 的路径都返回 index.html
  app.use((req: any, res: any, next: any) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(join(publicDir, 'index.html'));
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const port = process.env.PORT ? +process.env.PORT : 3000;
  await app.listen(port);
  console.log(`🚀 服务已启动: http://localhost:${port}/api`);
}
bootstrap();
