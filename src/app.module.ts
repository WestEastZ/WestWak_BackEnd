import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { BoardsModule } from './boards/boards.module';
import { ScrapingModule } from './scraping/scraping.module';
import { RecomendVideoModule } from './recomend-video/recomend-video.module';
import { Top100Module } from './top100/top100.module';
import { InformationModule } from './information/information.module';
import { Awss3Module } from './awss3/awss3.module';
import { BroadCastModule } from './broadcast/broad-cast.module';
import { typeORMConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeORMConfig),
    AuthModule,
    BoardsModule,
    ScrapingModule,
    RecomendVideoModule,
    Top100Module,
    InformationModule,
    Awss3Module,
    BroadCastModule,
  ],
})
export class AppModule {}
