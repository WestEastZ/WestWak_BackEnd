import { FileInterceptor } from '@nestjs/platform-express';
import { Awss3Service } from './awss3.service';
import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

@Controller('awss3')
export class Awss3Controller {
  constructor(private Awss3Service: Awss3Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImg(@UploadedFile() file: Express.Multer.File) {
    return this.Awss3Service.uploadFileS3(file);
  }

  @Get()
  async getImageUrl(@Query('directory') directory: string) {
    return this.Awss3Service.getImageUrl(directory);
  }
}
