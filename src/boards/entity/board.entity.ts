import { User } from 'src/auth/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BoardStatus } from '../board.model';

@Entity()
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  status: BoardStatus;

  @ManyToOne((type) => User, (user) => user.boards, {
    eager: false,
  })
  user: User;
}
