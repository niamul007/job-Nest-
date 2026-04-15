import WebSocket from "ws";
import jwt from "jsonwebtoken";
import {env} from "../config/env";


const clients = new Map<number, WebSocket>();

export const initWebSocketServer = (server: any) => {
  const wss = new WebSocket.Server({ server });
  wss.on("connection", (ws: WebSocket, req) => {
    // Extract token from query params
    const params = new URLSearchParams(req.url?.split("?")[1]);
    const token = params.get("token");
    if (!token) {
      ws.close(4001, "Authentication token missing");
      return;
    }
    try {
      const payload: any = jwt.verify(token, env.jwt.secret);
      const userId = payload.userId;
      clients.set(userId, ws);
      console.log(`User ${userId} connected via WebSocket`);
      ws.on("close", () => {
        clients.delete(userId);
        console.log(`User ${userId} disconnected from WebSocket`);
      });
    } catch (err) {
      ws.close(4002, "Invalid authentication token");
    }
  });
};

export const notifyUser = (userId: number, data: object) => {
  const ws = clients.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
};

// The import for WebSocketServer and WebSocket from ws
// The import for your JWT config from env
// Import jwt from jsonwebtoken
// Create the clients map — type it as Map<number, WebSocket>
// Export an initWebSocketServer function that takes an http.Server as parameter (we'll fill the body next)
// Export a notifyUser function that takes userId: number and data: object
