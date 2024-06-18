import { IsNotEmpty } from 'class-validator';
import { Board } from '../entity/board.entity';

export class GetBoardsDto {
  boards: Board[];
  total: number;
}
