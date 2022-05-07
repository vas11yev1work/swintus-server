import { Server, Socket } from 'socket.io';
import {
  CreateAndJoinGame,
  GameStatus,
  GetCards,
  StartGame,
  UserRole,
} from './utils/types';
import { Game } from './entity/Game';
import { User } from './entity/User';
import { AppDataSource } from './data-source';
import { SocketEmit, SocketOn } from './utils/constants';
import { createError } from './utils/error';
import { generateCards } from './utils/cards';

const userRepository = AppDataSource.getRepository(User);
const gameRepository = AppDataSource.getRepository(Game);

const sendServerError = (socket: Socket, e?: any) => {
  socket.emit(SocketEmit.SERVER_ERROR, createError('Что-то пошло не так', e));
};

const publicGameInfo = (game: Game): Partial<Game> => {
  return {
    id: game.id,
    gameName: game.gameName,
    gameStatus: game.gameStatus,
  };
};

const publicUserInfo = (user: User): Partial<User> => {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
};

function join(socket: Socket, io: Server, game: Game, user: User) {
  socket.join(`game_${game.uuid}`);
  socket.emit(SocketEmit.GAME_INFO, publicGameInfo(game));
  socket.emit(SocketEmit.WHO_AM_I, {
    ...publicUserInfo(user),
    cards: user.cards,
  });
  socket.broadcast
    .to(`game_${game.uuid}`)
    .emit(SocketEmit.USER_JOINED, publicUserInfo(user));
}

export const game = (socket: Socket, io: Server) => {
  socket.on(SocketOn.CREATE_GAME, async (data: CreateAndJoinGame) => {
    try {
      const gameCandidate = await gameRepository.findOne({
        where: { gameName: data.gameName },
      });

      if (gameCandidate) {
        socket.emit(
          SocketEmit.GAME_ERROR,
          createError('Игра с таким названием уже существует')
        );
        return;
      }

      const user = await userRepository.create({
        username: data.username,
        role: UserRole.ADMIN,
        cards: [],
      });
      await userRepository.save(user);

      const game = await gameRepository.create({
        gameName: data.gameName,
        users: [],
        heap: [],
      });
      game.users.push(user);

      await gameRepository.save(game);

      join(socket, io, game, user);
    } catch (e) {
      sendServerError(socket, e);
    }
  });

  socket.on(SocketOn.JOIN_GAME, async (data: CreateAndJoinGame) => {
    try {
      // TODO: есть ли юзер уже в комнате

      const game = await gameRepository.findOne({
        where: { gameName: data.gameName },
        relations: {
          users: true,
        },
      });

      if (!game) {
        socket.emit(
          SocketEmit.GAME_ERROR,
          createError('Игры с таким названием не существует')
        );
        return;
      }

      if (game.gameStatus === GameStatus.STARTED) {
        socket.emit(SocketEmit.GAME_ERROR, createError('Игра уже началась'));
        return;
      }

      if (game.users.length === 10) {
        socket.emit(SocketEmit.GAME_ERROR, createError('Игра переполнена'));
        return;
      }

      const user = await userRepository.create({
        username: data.username,
        role: UserRole.PLAYER,
        cards: [],
      });
      await userRepository.save(user);

      game.users.push(user);
      await gameRepository.save(game);

      join(socket, io, game, user);
    } catch (e) {
      sendServerError(socket, e);
    }
  });

  socket.on(SocketOn.START_GAME, async (data: StartGame) => {
    try {
      const game = await gameRepository.findOne({
        where: { id: data.gameId },
        relations: {
          users: true,
        },
      });

      if (!game) {
        socket.emit(
          SocketEmit.GAME_ERROR,
          createError('Игры с таким названием не существует')
        );
        return;
      }

      if (game.users.length === 1) {
        socket.emit(
          SocketEmit.GAME_ERROR,
          createError('Дождитесь хотя бы еще одного игрока, чтобы начать игру')
        );
        return;
      }

      const user = await userRepository.findOne({
        where: { id: data.userId },
      });

      if (user.role !== UserRole.ADMIN) {
        socket.emit(
          SocketEmit.GAME_ERROR,
          createError('Вы не можете начать игру')
        );
        return;
      }

      const userIds = game.users.map(u => u.id);

      if (!userIds.includes(user.id)) {
        socket.emit(
          SocketEmit.GAME_ERROR,
          createError('Вы не являетесь участником данной игры')
        );
        return;
      }

      game.heap = generateCards();
      game.gameStatus = GameStatus.STARTED;

      await gameRepository.save(game);

      io.in(`game_${game.uuid}`).emit(SocketEmit.GAME_STARTED, game); // TODO: game info
    } catch (e) {
      sendServerError(socket, e);
    }
  });

  socket.on(SocketOn.GET_CARDS, async (data: GetCards) => {
    const user = await userRepository.findOne({
      where: { id: data.userId },
      relations: {
        game: true,
      },
    });

    const game = await gameRepository.findOne({
      where: { id: user.game.id },
    });

    const cardsForUser = game.heap.splice(0, data.count);
    await gameRepository.save(game);

    user.cards.push(...cardsForUser);
    await userRepository.save(user);
  });
};
