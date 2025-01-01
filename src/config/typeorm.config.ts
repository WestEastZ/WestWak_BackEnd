import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from 'src/auth/entity/user.entity';
import { Board } from 'src/boards/entity/board.entity';
import { Information } from 'src/information/entity/infomation.entity';
import { Top100 } from 'src/top100/entity/top100.entity';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Board, Top100, Information],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: false,
  synchronize: false,
};

// 마이그레이션 DataSource
export default new DataSource({
  ...typeORMConfig,
  type: 'mysql',
} as any);
