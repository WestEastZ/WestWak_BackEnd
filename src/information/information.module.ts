import { Module } from '@nestjs/common';
import { InformationController } from './information.controller';
import { InformationService } from './information.service';
import { InfomationRepository } from './information.respository';

@Module({
  controllers: [InformationController],
  providers: [InformationService, InfomationRepository],
})
export class InformationModule {}
