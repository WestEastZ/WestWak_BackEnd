import { Board } from 'src/boards/entity/board.entity';
import { AuthProvider } from 'src/types/enum/auth.enum';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Index(['username', 'provider'], { unique: true })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ type: 'datetime', nullable: true })
  refreshTokenExp: Date;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
    nullable: true,
  })
  provider: AuthProvider;

  @OneToMany((type) => Board, (board) => board.user, {
    eager: true,
  })
  boards: Board[];
}
