import WebSocket from "ws";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Server } from "http";
import { JwtPayload } from "../types";

/**
 * WebSocket server — enables real-time push notifications to connected clients.
 * Used to instantly notify applicants when their application status changes.
 * Falls back gracefully — if user is offline, email queue handles delivery.
 */

/**
 * In-memory map of connected users.
 * Key: userId (from JWT)
 * Value: their active WebSocket connection
 * Entries are added on connect and removed on disconnect.
 */
const clients = new Map<string, WebSocket>();

/**
 * Initialises the WebSocket server on the same HTTP server as Express.
 * Authentication: JWT token passed as URL query parameter on connection.
 * Example: ws://yourapp.com?token=eyJhbGci...
 *
 * Uses the same HTTP server as Express so both run on the same port.
 * (This is why server.ts uses http.createServer() instead of app.listen())
 */
export const initWebSocketServer = (server: Server) => {
  const wss = new WebSocket.Server({ server });

  /**
   * Heartbeat — pings all connected clients every 30 seconds.
   * Detects dead connections that didn't properly close.
   * Without this, the clients Map would accumulate stale connections.
   */
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping(); // client auto-responds with pong
      }
    });
  }, 30000);

  // Clean up heartbeat interval when WebSocket server closes
  // Prevents Node.js process from hanging during graceful shutdown
  wss.on('close', () => clearInterval(interval));

  /**
   * Runs every time a new client connects.
   * Extracts and verifies JWT from URL query params.
   * Stores the connection in clients Map using userId as key.
   */
  wss.on("connection", (ws: WebSocket, req) => {
    // Extract JWT from connection URL: ws://app.com?token=eyJ...
    const params = new URLSearchParams(req.url?.split("?")[1]);
    const token = params.get("token");

    // Reject connection if no token provided
    if (!token) {
      ws.close(4001, "Authentication token missing");
      return;
    }

    try {
      // Verify token with same secret as HTTP auth
      const payload = jwt.verify(token, env.jwt.secret) as JwtPayload;
      const userId = payload.id;

      // Register this connection so notifyUser() can find it
      clients.set(userId, ws);
      console.log(`User ${userId} connected via WebSocket`);

      // Clean up when user disconnects
      ws.on("close", () => {
        clients.delete(userId);
        console.log(`User ${userId} disconnected from WebSocket`);
      });

    } catch (err) {
      // Token invalid or expired — reject connection
      ws.close(4002, "Invalid authentication token");
    }
  });
};

/**
 * Sends a real-time notification to a specific user.
 * Called by application service when status changes.
 * Silently skips if user is offline — email queue handles that case.
 *
 * @param userId - the recipient's user ID
 * @param data   - the notification payload (type, message, status)
 */
export const notifyUser = (userId: string, data: object) => {
  const ws = clients.get(userId);

  // Only send if connection exists AND is fully open
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
};