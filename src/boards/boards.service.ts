import { BoardDto } from './dto/board.dto';
import { BoardRepository } from './boards.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/auth/entity/user.entity';
import { Board } from './entity/board.entity';
import { GetBoardsDto } from './dto/getBoards.dto';

@Injectable()
export class BoardsService {
  constructor(private BoardRepository: BoardRepository) {}

  // 게시물 생성
  createBoard(BoardDto: BoardDto, user: User): Promise<Board> {
    return this.BoardRepository.createBoard(BoardDto, user);
  }

  // 모든 게시물 조회
  async getBoards(page: number): Promise<GetBoardsDto> {
    const pageSize = 5;

    const [boards, total] = await this.BoardRepository.findAndCount({
      order: { createdAt: 'DESC' },
      // 가져올 게시글의 갯수
      take: pageSize,

      // 생략할 게시글의 갯수
      skip: page <= 0 ? 0 : (page - 1) * pageSize,
    });

    const lastPage = Math.ceil(total / pageSize);

    if (lastPage >= page) {
      return { boards, total };
    } else {
      throw new NotFoundException('해당 페이지는 존재하지 않습니다.');
    }
  }

  // 나의 게시물 조회
  async getMyBoards(user: User, page: number): Promise<GetBoardsDto> {
    const pageSize = 1;
    const userId = user.id;

    const [boards, total] = await this.BoardRepository.findAndCount({
      where: { user: { id: userId } },
      take: pageSize,
      skip: page <= 0 ? 0 : (page - 1) * pageSize,
    });

    const lastPage = Math.ceil(total / pageSize);

    if (lastPage >= page) {
      return { boards, total };
    } else {
      throw new NotFoundException('해당 페이지는 존재하지 않습니다.');
    }
  }

  // 게시물 수정
  updateBoard(id: number, BoardDto: BoardDto): Promise<Board> {
    return this.BoardRepository.updateBoard(id, BoardDto);
  }

  // 게시물 삭제
  deleteBoard(id: number): Promise<Board> {
    return this.BoardRepository.deleteBoard(id);
  }
}
