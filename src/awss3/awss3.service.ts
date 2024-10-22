import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import sharp from 'sharp';

@Injectable()
export class Awss3Service {
  private s3: AWS.S3;
  constructor(private readonly ConfigService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.ConfigService.get<string>('AWS_ACCESS_KEY'),
      secretAccessKey: this.ConfigService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.ConfigService.get<string>('AWS_REGION'),
    });
  }

  // upload
  async uploadFileS3(file: Express.Multer.File) {
    try {
      const optimizeImage = await this.optimizeImage(file.buffer);
      const bucketName = this.ConfigService.get<string>('AWS_BUCKET_NAME');

      const data = {
        Bucket: bucketName,
        Key: `gomem/${file.originalname}`,
        Body: optimizeImage,
        ContentType: 'image/webp',
      };

      const result = await this.s3.upload(data).promise();

      return result.Location;
    } catch (error) {
      throw new InternalServerErrorException('파일을 업로드할 수 없습니다.');
    }
  }

  // get Image Url
  async getImageUrl(directory: string) {
    const bucketName = this.ConfigService.get<string>('AWS_BUCKET_NAME');
    const region = this.ConfigService.get<string>('AWS_REGION');
    const imageRegex = /\.(jpe?g|png|gif|webp)$/i;

    const params = {
      Bucket: bucketName,
      Prefix: directory,
    };

    try {
      const data = await this.s3.listObjectsV2(params).promise();

      const imageUrl = data.Contents.filter((url) =>
        imageRegex.test(url.Key),
      ).map(
        (object) =>
          `https://${bucketName}.s3.${region}.amazonaws.com/${object.Key}`,
      );

      if (imageUrl.length === 0) {
        throw new NotFoundException('이미지가 존재하지 않습니다.');
      }

      return imageUrl;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        '이미지 URL을 가져오는 중 오류가 발생했습니다.',
      );
    }
  }

  // resize / optimize
  async optimizeImage(img: Buffer): Promise<Buffer> {
    try {
      return sharp(img).resize(800).webp({ quality: 80 }).toBuffer();
    } catch (error) {
      throw new InternalServerErrorException(
        '이미지 최적화 중 오류가 발생했습니다.',
      );
    }
  }
}
