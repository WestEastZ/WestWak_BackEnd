import { Top100Dto } from './dto/top100.dto';
import { Top100Repository } from './top100.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Top100Service {
  constructor(private Top100Repository: Top100Repository) {}

  create(Top100Dto: Top100Dto) {
    return this.Top100Repository.createTop100(Top100Dto);
  }

  async getTop100(id: number) {
    return this.Top100Repository.getTop100(id);
  }
}
