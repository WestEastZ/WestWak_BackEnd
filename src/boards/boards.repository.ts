import { BoardDto } from './dto/board.dto';
import { DataSource, Repository } from 'typeorm';
import { Board } from './entity/board.entity';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/auth/entity/user.entity';

@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor(private dataSource: DataSource) {
    super(Board, dataSource.createEntityManager());
  }

  // 게시물 생성
  async createBoard(BoardDto: BoardDto, user: User): Promise<Board> {
    try {
      const { description, status } = BoardDto;

      const utcDate = new Date();

      const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);

      const formattedDateTime = kstDate
        .toISOString()
        .replace('T', ' ')
        .slice(0, 16);

      const board = this.create({
        username: user.username,
        userId: user.id,
        description,
        status,
        createdAt: formattedDateTime,
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

  // 게시물 수정
  async updateBoard(id: number, BoardDto: BoardDto): Promise<Board> {
    const board = await this.findOne({ where: { id } });

    if (!board) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    board.description = BoardDto.description;
    board.status = BoardDto.status;

    await this.save(board);

    return board;
  }

  // 게시물 삭제
  async deleteBoard(id: number): Promise<Board> {
    const board = await this.findOne({ where: { id } });

    if (!board) {
      throw new NotFoundException('일치하는 게시물이 없습니다.');
    }

    // 논리적 삭제
    await this.softDelete(id);

    return board;
  }
}
