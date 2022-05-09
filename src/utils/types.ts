export enum UserRole {
  ADMIN = 'ADMIN',
  PLAYER = 'PLAYER',
}

export enum GameStatus {
  PENDING = 'PENDING',
  STARTED = 'STARTED',
}

export interface MessageData {
  message: string;
}

export interface CreateAndJoinGame {
  gameName: string;
  username: string;
}

export interface StartGame {
  gameId: number;
}

export interface GetCards {
  count: number;
}
