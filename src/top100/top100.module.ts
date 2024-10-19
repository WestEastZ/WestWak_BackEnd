import { Module } from '@nestjs/common';
import { Top100Service } from './top100.service';
import { Top100Controller } from './top100.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Top100 } from './entity/top100.entity';
import { Top100Repository } from './top100.repository';
import { InfomationRepository } from 'src/information/information.respository';

@Module({
  imports: [TypeOrmModule.forFeature([Top100])],
  controllers: [Top100Controller],
  providers: [Top100Service, Top100Repository, InfomationRepository],
})
export class Top100Module {}
