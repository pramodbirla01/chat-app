// src/server.ts
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createApp } from "./app";
import { setupSocket } from "./socket";

dotenv.config(); // load .env

const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || "";

async function start() {
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("🗄️  MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }

  const app = createApp();
  const server = http.createServer(app);

  // init socket.io (setup handlers)
  const { Server } = await import("socket.io");
  const io = new Server(server, { cors: { origin: "*" } });
  setupSocket(io);

  console.log("🟢 Socket.IO is running and listening for connections");

  server.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
}

start();
