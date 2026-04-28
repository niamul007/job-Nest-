import http from 'http';
import app from './src/app';
import { env } from './src/config/env';
import './src/config/db';
import './src/config/redis';
import { redisClient } from './src/config/redis';
import { pool } from './src/config/db';
import { initWebSocketServer } from './src/websocket/ws.server';
import './src/queues/email.worker';

/**
 * Create a raw Node.js HTTP server using the Express app as the request handler.
 * We use http.createServer() instead of app.listen() because we need access to
 * the underlying server instance to attach the WebSocket server.
 */
const server: http.Server = http.createServer(app);

// Attach the WebSocket server to the same HTTP server instance
initWebSocketServer(server);

// Start listening on the port defined in environment config
server.listen(env.port, () => {
  console.log(`🚀 Server running on port ${env.port}`);
});

/**
 * Gracefully shuts down the server when a termination signal is received.
 * Ensures all active connections (HTTP, Redis, PostgreSQL) are properly
 * closed before the process exits — preventing data loss or zombie connections.
 *
 * @param signal - The OS signal that triggered the shutdown (e.g. SIGINT, SIGTERM)
 */
async function gracefulShutdown(signal: string) {
  console.log(`\n⚠️  ${signal} received — shutting down...`);
  server.close(async () => {
    await redisClient.quit(); // Close Redis connection
    await pool.end();         // Close PostgreSQL connection pool
    console.log('✅ All connections closed.');
    process.exit(0);          // Exit cleanly with no error code
  });
}

// SIGINT  → triggered by Ctrl+C in terminal (local dev)
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
// SIGTERM → triggered by deployment platforms (Railway, Docker, PM2)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));