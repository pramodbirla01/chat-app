// src/utils/presence.ts
/**
 * presence manager: keeps username <-> socketId mapping and lastSeen time.
 * Exported helpers keep the maps encapsulated.
 */

const usernameToSocket = new Map<string, string>();
const socketToUsername = new Map<string, string>();
const lastSeen = new Map<string, Date>();

export const setOnline = (username: string, socketId: string) => {
  usernameToSocket.set(username, socketId);
  socketToUsername.set(socketId, username);
};

export const setOfflineBySocket = (socketId: string) => {
  const username = socketToUsername.get(socketId);
  if (username) {
    usernameToSocket.delete(username);
    socketToUsername.delete(socketId);
    lastSeen.set(username, new Date());
  }
  return username || null;
};

export const getSocketId = (username: string) => usernameToSocket.get(username) || null;

export const getUsernameBySocket = (socketId: string) => socketToUsername.get(socketId) || null;

export const getOnlineUsernames = () => Array.from(usernameToSocket.keys());

export const getLastSeen = (username: string) => lastSeen.get(username) || null;
