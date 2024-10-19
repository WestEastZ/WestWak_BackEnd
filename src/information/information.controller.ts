import { InformationDto } from './dto/information.dto';
import { InformationService } from './information.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';

@Controller('information')
export class InformationController {
  constructor(private InformationService: InformationService) {}

  @Post('/create')
  async createInformation(@Body() InformationDto: InformationDto) {
    return this.InformationService.create(InformationDto);
  }

  @Get('/get')
  async getInformation(@Query('id') id: number) {
    return this.InformationService.getInformation(id);
  }
}
