import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { User } from './auth/entity/user.entity';
import { BoardsModule } from './boards/boards.module';
import { Board } from './boards/entity/board.entity';
import { ScrapingModule } from './scraping/scraping.module';
import { RecomendVideoModule } from './recomend-video/recomend-video.module';
import { Top100Module } from './top100/top100.module';
import { Top100 } from './top100/entity/top100.entity';
import { InformationModule } from './information/information.module';
import { Information } from './information/entity/infomation.entity';
import { Awss3Module } from './awss3/awss3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        __dirname + '/../**/*.entity.{js.ts}',
        User,
        Board,
        Top100,
        Information,
      ],
      synchronize: false,
    }),
    AuthModule,
    BoardsModule,
    ScrapingModule,
    RecomendVideoModule,
    Top100Module,
    InformationModule,
    Awss3Module,
  ],
})
export class AppModule {}
