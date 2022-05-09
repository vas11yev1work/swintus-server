import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Game } from './Game';
import { UserRole } from '../utils/types';

@Entity()
export class User {
  @Column()
  @PrimaryColumn()
  id: string;

  @Column()
  username: string;

  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.PLAYER,
  })
  role: UserRole;

  @Column('simple-array')
  cards: string[];

  @ManyToOne(() => Game, game => game.users, { onDelete: 'CASCADE' })
  game: Game;
}
