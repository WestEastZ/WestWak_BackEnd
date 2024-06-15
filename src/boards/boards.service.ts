import { BoardDto } from './dto/board.dto';
import { BoardRepository } from './boards.repository';
import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/entity/user.entity';
import { Board } from './entity/board.entity';

@Injectable()
export class BoardsService {
  constructor(private BoardRepository: BoardRepository) {}

  createBoard(BoardDto: BoardDto, user: User): Promise<Board> {
    return this.BoardRepository.createBoard(BoardDto, user);
  }
}
