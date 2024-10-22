import { InformationDto } from './dto/information.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Information } from './entity/infomation.entity';

@Injectable()
export class InfomationRepository extends Repository<Information> {
  constructor(private dataSource: DataSource) {
    super(Information, dataSource.createEntityManager());
  }

  async createInformation(InformationDto: InformationDto) {
    try {
      const { title, artist, album, date, length } = InformationDto;

      const data = this.create({
        title,
        artist,
        album,
        date,
        length,
      });

      await this.save(data);
    } catch (error) {
      throw new InternalServerErrorException(
        '정보를 생성하는 중 오류가 발생했습니다.',
      );
    }
  }
}
