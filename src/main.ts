import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const port = process.env.SERVER_PORT;
  const LocalURL = process.env.FRONT_LOCAL_URL;
  const BaseURL = process.env.FRONT_BASE_URL;

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [LocalURL, BaseURL],
    credentials: true,
    exposedHeaders: ['Authorization'],
  });
  app.use(cookieParser.default());
  await app.listen(port);
  Logger.log(`App ${port}`);
}
bootstrap();
