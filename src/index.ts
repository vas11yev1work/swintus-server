import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { game } from './game';
import { AppDataSource } from './data-source';

dotenv.config();

AppDataSource.initialize().then(() => {
  // eslint-disable-next-line no-console
  console.log('Database init');
});

const PORT = process.env.PORT || 5000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', socket => {
  game(socket, io);
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server: http://localhost:${PORT}`);
});
