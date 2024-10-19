import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import sharp from 'sharp';
import { lookup } from 'mime-types';

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
    const optimizeImage = await this.optimizeImage(file.buffer);
    const bucketName = this.ConfigService.get<string>('AWS_BUCKET_NAME');
    const conetentType = lookup(file.originalname);

    console.log(conetentType);

    const data = {
      Bucket: bucketName,
      Key: `gomem/${file.originalname}`,
      Body: optimizeImage,
      ContentType: 'image/webp',
    };

    const result = await this.s3.upload(data).promise();

    return result.Location;
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
      ).map((object) => {
        return `https://${bucketName}.s3.${region}.amazonaws.com/${object.Key}`;
      });

      return imageUrl;
    } catch (error) {
      console.log(error);
    }
  }

  // resize / optimize
  async optimizeImage(img: Buffer): Promise<Buffer> {
    return sharp(img).resize(800).webp({ quality: 80 }).toBuffer();
  }
}
