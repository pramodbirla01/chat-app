// src/routes/messages.ts
import { Router } from "express";
import Message from "../models/Message";
import { getLastSeen } from "../utils/presence";

const router = Router();

/**
 * GET /messages/private/:u1/:u2
 * returns chat history between u1 and u2 (oldest -> newest)
 */
router.get("/private/:u1/:u2", async (req, res) => {
  const { u1, u2 } = req.params;
  try {
    const msgs = await Message.find({
      kind: "private",
      $or: [
        { sender: u1, receiver: u2 },
        { sender: u2, receiver: u1 }
      ]
    }).sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /messages/room/:room
 * returns history of a room (oldest -> newest)
 */
router.get("/room/:room", async (req, res) => {
  const { room } = req.params;
  try {
    const msgs = await Message.find({ kind: "room", room }).sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /last-seen/:username
 */
router.get("/last-seen/:username", (req, res) => {
  const { username } = req.params;
  const last = getLastSeen(username);
  res.json({ username, lastSeen: last });
});

export default router;
