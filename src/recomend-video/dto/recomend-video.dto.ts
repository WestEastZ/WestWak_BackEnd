import { IsNotEmpty, IsString } from 'class-validator';

export class RecomendVideoDto {
  @IsNotEmpty()
  @IsString()
  videoId: string;

  @IsNotEmpty()
  @IsString()
  date: string;
}
