import { User } from './../auth/entity/user.entity';
import { JwtAccessGuard } from 'src/auth/token/jwt-access.guard';
import { BoardsService } from './boards.service';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { BoardDto } from './dto/board.dto';
import { Board } from './entity/board.entity';

@Controller('boards')
@UseGuards(JwtAccessGuard)
export class BoardsController {
  constructor(private BoardsService: BoardsService) {}

  // 게시물 생성
  @Post('/create')
  async createBoard(
    @Body() BoardDto: BoardDto,
    @Req() req: any,
  ): Promise<Board> {
    const user = req.user;
    return this.BoardsService.createBoard(BoardDto, user);
  }
}
