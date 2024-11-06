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
    const result = await this.InfomationRepository.findOne({
      where: { id },
    });

    return result;
  }

  async getAllInformattion() {
    const result = await this.InfomationRepository.find({
      select: ['id', 'title', 'artist'],
    });

    return result;
  }
}
