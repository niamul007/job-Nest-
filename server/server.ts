import http from 'http';
import app from './src/app';
import { env } from './src/config/env';
import './src/config/db';
import './src/config/redis';
import { initWebSocketServer } from './src/websocket/ws.server';

const server = http.createServer(app);

initWebSocketServer(server);

server.listen(env.port, () => {
  console.log(`🚀 Server is running on port ${env.port}`);
});