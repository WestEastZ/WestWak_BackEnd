import { InformationDto } from './dto/information.dto';
import { InfomationRepository } from './information.respository';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class InformationService {
  constructor(private InfomationRepository: InfomationRepository) {}

  create(InformationDto: InformationDto) {
    return this.InfomationRepository.createInformation(InformationDto);
  }

  async getInformation(id: number) {
    return await this.InfomationRepository.findOne({
      where: { id },
    });
  }
}
