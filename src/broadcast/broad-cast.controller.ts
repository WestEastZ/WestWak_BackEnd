import { BroadCastService } from './broad-cast.service';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';

@Controller('broadcast')
export class BroadCastController {
  constructor(private BroadCastService: BroadCastService) {}

  @Get()
  async getBroadCast(@Query('ids') ids: string) {
    if (!ids) {
      throw new HttpException('URL is required', HttpStatus.BAD_REQUEST);
    }

    const streamerIds = ids.split(',');
    const data = await this.BroadCastService.getBroadCast(streamerIds);

    return data;
  }
}
