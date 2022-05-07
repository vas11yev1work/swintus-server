export enum UserRole {
  ADMIN = 'ADMIN',
  PLAYER = 'PLAYER',
}

export enum GameStatus {
  PENDING = 'PENDING',
  STARTED = 'STARTED',
}

export interface CreateAndJoinGame {
  gameName: string;
  username: string;
}

export interface StartGame {
  userId: number;
  gameId: number;
}

export interface GetCards {
  userId: number;
  count: number;
}
