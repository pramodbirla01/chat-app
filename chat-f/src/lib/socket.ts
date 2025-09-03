import { io, Socket } from "socket.io-client";

const URL = "http://localhost:5000"; // backend server
export const socket: Socket = io(URL, {
  autoConnect: false,
});
