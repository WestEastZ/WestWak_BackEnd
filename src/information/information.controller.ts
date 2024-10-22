import { InformationDto } from './dto/information.dto';
import { InformationService } from './information.service';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

@Controller('information')
export class InformationController {
  constructor(private InformationService: InformationService) {}

  @Post('/create')
  async createInformation(@Body() InformationDto: InformationDto) {
    return this.InformationService.create(InformationDto);
  }

  @Get('/get')
  async getInformation(@Query('id') id: number) {
    const information = await this.InformationService.getInformation(id);

    if (!information) {
      throw new NotFoundException(`${id}의 게시물을 찾을 수 없습니다.`);
    }

    return information;
  }
}
