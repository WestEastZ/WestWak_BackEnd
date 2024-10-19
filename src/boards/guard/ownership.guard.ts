import { BoardRepository } from './../boards.repository';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly BoardRepository: BoardRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    Logger.log(
      `Received request: ${request.method} ${request.url} ${request.params.id} ${request.user.username}`,
    );

    const user = request.user;
    const boardId = parseInt(request.params.id, 10);

    const board = await this.BoardRepository.findOne({
      where: { id: boardId },
      relations: ['user'],
    });

    if (!board) {
      throw new ForbiddenException('게시물을 찾을 수 없습니다.');
    }

    if (!board.user) {
      throw new ForbiddenException('게시물 작성자를 확인할 수 없습니다.');
    }

    if (board.user.id !== user.id) {
      throw new ForbiddenException(
        '본인이 작성한 게시물만 수정할 수 있습니다.',
      );
    }

    return true;
  }
}
