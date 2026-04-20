import WebSocket from "ws";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Server } from "http";          // ✅ proper type
import { JwtPayload } from "../types";  // ✅ proper type

const clients = new Map<string, WebSocket>(); // ✅ string not number

export const initWebSocketServer = (server: Server) => {
  const wss = new WebSocket.Server({ server });

  // ✅ heartbeat lives here — right after wss is created
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    })
  }, 30000)

  // ✅ clean up interval when server closes
  wss.on('close', () => clearInterval(interval));

  wss.on("connection", (ws: WebSocket, req) => {
    const params = new URLSearchParams(req.url?.split("?")[1]);
    const token = params.get("token");

    if (!token) {
      ws.close(4001, "Authentication token missing");
      return;
    }

    try {
      const payload = jwt.verify(token, env.jwt.secret) as JwtPayload;
      const userId = payload.id; // ✅ matches JwtPayload interface

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

export const notifyUser = (userId: string, data: object) => {
  const ws = clients.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
};