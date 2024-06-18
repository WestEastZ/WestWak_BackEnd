import { BoardRepository } from './../boards.repository';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly BoardRepository: BoardRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const boardId = request.params.id;

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
