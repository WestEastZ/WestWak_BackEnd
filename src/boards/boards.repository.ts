import { BoardDto } from './dto/board.dto';
import { DataSource, Repository } from 'typeorm';
import { Board } from './entity/board.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from 'src/auth/entity/user.entity';

@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor(private dataSource: DataSource) {
    super(Board, dataSource.createEntityManager());
  }

  // 게시물 생성
  async createBoard(BoardDto: BoardDto, user: User): Promise<Board> {
    try {
      const { description } = BoardDto;

      const board = this.create({
        description,
        status: 'PUBLIC',
        user,
      });

      await this.save(board);

      return board;
    } catch (error) {
      console.error('Error creating board:', error);
      throw new InternalServerErrorException(
        '게시물 생성 중 오류가 발생했습니다.',
      );
    }
  }
}
