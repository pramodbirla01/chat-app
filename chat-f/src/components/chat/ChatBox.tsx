"use client"
import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

interface Message {
  from: string;
  content: string;
  createdAt: string;
}

const ChatBox: React.FC<{ username: string; toUser: string }> = ({ username, toUser }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on("connect", () => {
      socketRef.current?.emit("register", username);
    });
    socketRef.current.on("privateMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, [username]);

  const handleSend = () => {
    if (!input.trim() || !toUser) return;
    socketRef.current?.emit("privateMessage", {
      to: toUser,
      content: input,
      from: username,
    });
    setInput("");
  };

  return (
    <div className="bg-white p-6 rounded shadow w-96 mx-auto">
      <h2 className="text-lg font-bold mb-2 text-center">Chat as <span className="text-blue-600">{username}</span></h2>
      <div className="h-64 overflow-y-auto border rounded mb-2 bg-gray-50 p-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.from === username ? "text-right" : "text-left"}`}>
            <span className="font-semibold">{msg.from}:</span> {msg.content}
            <div className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-1 px-3 py-2 border rounded-l"
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

const Chat: React.FC = () => {
  const [username, setUsername] = useState("");
  const [toUser, setToUser] = useState("");
  const [connected, setConnected] = useState(false);

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow w-80">
          <h2 className="text-xl font-bold mb-4 text-center">Set Username</h2>
          <input
            className="w-full px-3 py-2 border rounded mb-4"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 border rounded mb-4"
            type="text"
            placeholder="Send to username..."
            value={toUser}
            onChange={(e) => setToUser(e.target.value)}
          />
          <button
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            onClick={() => username && toUser && setConnected(true)}
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  return <ChatBox username={username} toUser={toUser} />;
};

export default Chat;
