import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class Top100Dto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  date: string;

  @IsOptional()
  @ValidateIf((o) => o.isRanked === true)
  @IsNumber()
  @Type(() => Number)
  rank: number | null;

  @IsNotEmpty()
  @IsBoolean()
  isRanked: boolean;
}
