import { User } from './../auth/entity/user.entity';
import { BoardsService } from './boards.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BoardDto } from './dto/board.dto';
import { Board } from './entity/board.entity';
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { AuthGuard } from '@nestjs/passport';
import { GetBoardsDto } from './dto/getBoards.dto';
import { OwnershipGuard } from './guard/ownership.guard';
import { BoardStatusValidationPipe } from './pipe/boardStatusValidation.pipe';

@Controller('boards')
export class BoardsController {
  constructor(private BoardsService: BoardsService) {}

  // 게시물 생성
  @Post('/create')
  @UseGuards(AuthGuard('jwt'))
  async createBoard(
    @Body() BoardDto: BoardDto,
    @GetUser() user: User,
  ): Promise<Board> {
    console.log('Received request body:', JSON.stringify(BoardDto));
    console.log('Board Dto', BoardDto);
    return this.BoardsService.createBoard(BoardDto, user);
  }

  // 모든 게시물 조회
  @Get()
  async getBoards(@Query('page') page: number): Promise<GetBoardsDto> {
    return await this.BoardsService.getBoards(page);
  }

  // 나의 게시물 조회
  @Get('/:username')
  async getMyBoards(
    @GetUser() user: User,
    @Query('page') page: number,
  ): Promise<GetBoardsDto> {
    return await this.BoardsService.getMyBoards(user, page);
  }

  // 게시물 수정
  @Patch('/:id')
  @UseGuards(AuthGuard('jwt'), OwnershipGuard) // 본인 게시물 확인
  updateBoard(
    @Param('id', ParseIntPipe) id: number,
    @Body(BoardStatusValidationPipe) BoardDto: BoardDto, // 게시물 상태 확인
  ): Promise<Board> {
    return this.BoardsService.updateBoard(id, BoardDto);
  }

  // 게시물 삭제
  @Delete('/:id')
  @UseGuards(AuthGuard('jwt'), OwnershipGuard)
  deleteBoard(@Param('id', ParseIntPipe) id: number): Promise<Board> {
    return this.BoardsService.deleteBoard(id);
  }
}
