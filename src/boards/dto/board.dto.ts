import { IsNotEmpty } from 'class-validator';

export class BoardDto {
  @IsNotEmpty()
  description: string;
}
