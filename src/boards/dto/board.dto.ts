import { IS_IN, IsNotEmpty, IsString } from 'class-validator';
import { BoardStatus } from '../board.model';
import { Transform } from 'class-transformer';
import { BeforeInsert, BeforeUpdate } from 'typeorm';

export class BoardDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  status?: BoardStatus;
}
