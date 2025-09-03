// src/socket/index.ts
import { Server as IOServer, Socket } from "socket.io";
import Message from "../models/Message";
import {
  setOnline,
  setOfflineBySocket,
  getSocketId,
  getUsernameBySocket,
  getOnlineUsernames
} from "../utils/presence";

/**
 * Setup Socket.IO event handlers. Call with `setupSocket(io)`.
 */
export function setupSocket(io: IOServer) {
  // helper to broadcast online user list
  const broadcastOnlineUsers = () => {
    io.emit("onlineUsers", getOnlineUsernames());
  };

  io.on("connection", (socket: Socket) => {
    console.log("🔗 socket connected:", socket.id);

    // Register username (client should send username after connecting)
    socket.on("register", (username: string) => {
      if (!username) return;
      setOnline(username, socket.id);
      console.log(`✅ ${username} registered -> ${socket.id}`);
      broadcastOnlineUsers();
    });

    // PRIVATE MESSAGE handler
    socket.on("privateMessage", async (payload: { to: string; content: string; from?: string }) => {
      try {
        const from = payload.from || getUsernameBySocket(socket.id);
        const to = payload.to;
        const content = (payload.content || "").trim();
        if (!from || !to || !content) return;

        const saved = await Message.create({
          kind: "private",
          sender: from,
          receiver: to,
          content
        });

        // deliver to recipient if online
        const targetSocketId = getSocketId(to);
        const messageData = {
          _id: saved._id,
          kind: saved.kind,
          from: saved.sender,
          to: saved.receiver,
          content: saved.content,
          createdAt: saved.createdAt
        };

        if (targetSocketId) {
          io.to(targetSocketId).emit("privateMessage", messageData);
        }

        // echo to sender
        socket.emit("privateMessage", messageData);
      } catch (err) {
        console.error("privateMessage error:", err);
      }
    });

    // ROOM join/leave and roomMessage
    socket.on("joinRoom", ({ room }: { room: string }) => {
      if (!room) return;
      socket.join(room);
      const user = getUsernameBySocket(socket.id) || socket.id;
      io.to(room).emit("roomInfo", { event: "join", user, room });
    });

    socket.on("leaveRoom", ({ room }: { room: string }) => {
      if (!room) return;
      socket.leave(room);
      const user = getUsernameBySocket(socket.id) || socket.id;
      io.to(room).emit("roomInfo", { event: "leave", user, room });
    });

    socket.on("roomMessage", async (payload: { room: string; content: string; from?: string }) => {
      try {
        const from = payload.from || getUsernameBySocket(socket.id);
        const room = payload.room;
        const content = (payload.content || "").trim();
        if (!from || !room || !content) return;

        const saved = await Message.create({
          kind: "room",
          sender: from,
          room,
          content
        });

        const data = {
          _id: saved._id,
          kind: saved.kind,
          room: saved.room,
          from: saved.sender,
          content: saved.content,
          createdAt: saved.createdAt
        };

        io.to(room).emit("roomMessage", data);
      } catch (err) {
        console.error("roomMessage error:", err);
      }
    });

    // Typing indicators
    socket.on("typingPrivate", ({ to }: { to: string }) => {
      const from = getUsernameBySocket(socket.id);
      if (!from || !to) return;
      const targetSocketId = getSocketId(to);
      if (targetSocketId) io.to(targetSocketId).emit("typingPrivate", { from });
    });

    socket.on("typingRoom", ({ room }: { room: string }) => {
      const from = getUsernameBySocket(socket.id);
      if (!from || !room) return;
      socket.to(room).emit("typingRoom", { from, room });
    });

    // mark message as seen
    socket.on("markSeen", async ({ messageId }: { messageId: string }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { seen: true });
      } catch (err) {
        console.error("markSeen error:", err);
      }
    });

    // disconnect handling
    socket.on("disconnect", () => {
      const username = setOfflineOnDisconnect(socket.id);
      console.log("❌ disconnected:", socket.id, username || "");
      broadcastOnlineUsers();
    });

    // helper to set offline and return username
    function setOfflineOnDisconnect(sid: string) {
      return setOfflineBySocket(sid);
    }
  });
}
