import { Module } from '@nestjs/common';
import { BroadCastService } from './broad-cast.service';
import { BroadCastController } from './broad-cast.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [BroadCastService],
  controllers: [BroadCastController],
})
export class BroadCastModule {}
