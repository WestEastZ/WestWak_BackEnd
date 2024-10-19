import { Information } from 'src/information/entity/infomation.entity';
import { InfomationRepository } from './../information/information.respository';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Top100 } from './entity/top100.entity';
import { Top100Dto } from './dto/top100.dto';

@Injectable()
export class Top100Repository extends Repository<Top100> {
  constructor(
    private dataSource: DataSource,
    private InfomationRepository: InfomationRepository,
  ) {
    super(Top100, dataSource.createEntityManager());
  }

  // 차트 생성
  async createTop100(Top100Dto: Top100Dto) {
    try {
      const { date, title, rank, isRanked } = Top100Dto;
      const information = await this.InfomationRepository.findOne({
        where: { title },
      });

      const chart = this.create({
        date,
        title,
        rank,
        isRanked,
        information,
      });

      await this.save(chart);
    } catch (error) {
      console.error('Error creating data:', error);
    }
  }

  // 날짜 순 정렬
  async getTop100(id: number) {
    const data = await this.createQueryBuilder('top100')
      .innerJoinAndSelect('top100.information', 'information')
      .where('information.id = :id', { id })
      .orderBy('top100.date', 'ASC')
      .getMany();

    const chartData = data.map((item) => ({
      x: item.date,
      y: item.rank,
    }));

    const title = data[0].information.title;

    return { title, chartData };
  }
}
