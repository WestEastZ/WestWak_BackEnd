import { User } from 'src/auth/entity/user.entity';
import {
  BaseEntity,
  Column,
  DeleteDateColumn,
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
  username: string;

  @Column()
  userId: number;

  @Column()
  description: string;

  @Column({ default: 'PUBLIC' })
  status: BoardStatus;

  @Column()
  createdAt: string | null;

  @ManyToOne((type) => User, (user) => user.boards, {
    eager: false,
  })
  user: User;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
