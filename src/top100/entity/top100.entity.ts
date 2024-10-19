import { Information } from 'src/information/entity/infomation.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Top100 extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  date: string;

  @Column({ type: 'int', nullable: true })
  rank: number | null;

  @Column({ type: 'boolean', default: false })
  isRanked: boolean;

  @ManyToOne(() => Information, (information) => information.top100)
  information: Information;
}
