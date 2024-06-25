import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const port = process.env.SERVER_PORT;
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3330'],
    credentials: true,
    exposedHeaders: ['Authorization'],
  });
  app.use(cookieParser());
  await app.listen(port);
  Logger.log(`App ${port}`);
}
bootstrap();
