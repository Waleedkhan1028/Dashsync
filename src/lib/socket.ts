import { io } from "socket.io-client";

// Use environment variable for production, fallback to localhost for development
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"], // Fallback to polling if WebSocket fails
});
