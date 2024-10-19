import { Module } from '@nestjs/common';
import { RecomendVideoController } from './recomend-video.controller';
import { RecomendVideoService } from './recomend-video.service';

@Module({
  controllers: [RecomendVideoController],
  providers: [RecomendVideoService]
})
export class RecomendVideoModule {}
