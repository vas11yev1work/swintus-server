export enum SocketOn {
  CREATE_GAME = 'create_game',
  JOIN_GAME = 'join_game',
  START_GAME = 'start_game',
  GET_CARDS = 'get_cards',
}

export enum SocketEmit {
  SERVER_ERROR = 'server_error',
  GAME_ERROR = 'game_error',
  GAME_INFO = 'game_info',
  USER_JOINED = 'user_joined',
  GAME_STARTED = 'game_started',
  WHO_AM_I = 'who_am_i',
}
