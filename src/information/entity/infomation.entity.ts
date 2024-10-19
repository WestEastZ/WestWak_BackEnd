import { Top100 } from 'src/top100/entity/top100.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Information extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  artist: string;

  @Column()
  album: string;

  @Column()
  date: string;

  @Column()
  length: string;

  @Column()
  Youtube: string;

  @Column()
  Genie: string;

  @Column()
  Melon: string;

  @Column()
  Bugs: string;

  @Column()
  Flo: string;

  @Column()
  Spotify: string;

  @OneToMany(() => Top100, (top100) => top100.information)
  top100: Top100[];
}
