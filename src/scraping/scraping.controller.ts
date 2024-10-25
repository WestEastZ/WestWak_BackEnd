import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Query,
} from '@nestjs/common';
import { ScrapingService } from './scraping.service';

@Controller('scraping')
export class ScrapingController {
  constructor(private ScrapingService: ScrapingService) {}

  @Get('/onair')
  async getOnAirStatus(@Query('ids') ids: string) {
    if (!ids) {
      throw new HttpException('URL is required', HttpStatus.BAD_REQUEST);
    }

    const streamerIds = ids.split(',');

    try {
      const result = await this.ScrapingService.getBroadCastInfo(streamerIds);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/top100')
  async getTop100(@Query('url') url: string) {
    if (!url) {
      throw new HttpException('URL is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.ScrapingService.getTop100(url);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
