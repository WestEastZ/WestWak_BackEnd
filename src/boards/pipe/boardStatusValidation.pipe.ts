import { BadRequestException, PipeTransform } from '@nestjs/common';
import { BoardStatus } from '../board.model';

export class BoardStatusValidationPipe implements PipeTransform {
  readonly StatusOption = ['PUBLIC', 'PRIVATE'];

  transform(value: any) {
    const status = value.status.toUpperCase();

    if (!this.isStatusValid(status)) {
      throw new BadRequestException(`${status}는 적절한 상태가 아닙니다.`);
    }

    value.status = status;

    return value;
  }

  private isStatusValid(status: BoardStatus) {
    const index = this.StatusOption.indexOf(status);
    return index !== -1;
  }
}
