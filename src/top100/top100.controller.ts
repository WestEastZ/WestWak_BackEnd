import { Top100Dto } from './dto/top100.dto';
import { Top100Service } from './top100.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';

@Controller('top100')
export class Top100Controller {
  constructor(private Top100Service: Top100Service) {}

  // 차트 생성
  @Post('/create')
  async createTop100(@Body() Top100Dto: Top100Dto) {
    return this.Top100Service.create(Top100Dto);
  }

  @Get('/get')
  async getTop100(@Query('id') id: number) {
    return this.Top100Service.getTop100(id);
  }
}
