// src/app.ts
import express from "express";
import cors from "cors";
import messagesRouter from "./routes/messages";

export function createApp() {
  const app = express();
  const allowedOrigin = process.env.CORS_ORIGIN || "*";
  app.use(cors({ origin: allowedOrigin }));
  app.use(express.json());

  // health check
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // messages routes
  app.use("/messages", messagesRouter);

  return app;
}
