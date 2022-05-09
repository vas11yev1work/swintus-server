import {
  Column,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { GameStatus } from '../utils/types';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column()
  gameName: string;

  @Column({
    type: 'simple-enum',
    enum: GameStatus,
    default: GameStatus.PENDING,
  })
  gameStatus: GameStatus;

  @Column('simple-array')
  heap: string[];

  @OneToMany(() => User, user => user.game, { onDelete: 'CASCADE' })
  users: User[];
}
