import http from 'http';
import app from './src/app';
import { env } from './src/config/env';
import './src/config/db';
import './src/config/redis';
import { redisClient } from './src/config/redis';
import { pool } from './src/config/db';
import { initWebSocketServer } from './src/websocket/ws.server';
import './src/queues/email.worker';

// ✅ type the server properly
const server: http.Server = http.createServer(app);
initWebSocketServer(server);

server.listen(env.port, () => {
  console.log(`🚀 Server running on port ${env.port}`);
});

async function gracefulShutdown(signal: string) {
  console.log(`\n⚠️  ${signal} received — shutting down...`);
  server.close(async () => {
    await redisClient.quit();
    await pool.end();
    console.log('✅ All connections closed.');
    process.exit(0);
  });
}

process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));