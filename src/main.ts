import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const port = process.env.SERVER_PORT;
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  Logger.log(`App ${port}`);
}
bootstrap();
