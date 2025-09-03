// src/models/Message.ts
import mongoose, { Schema, Document } from "mongoose";

export type MessageKind = "private" | "room";

export interface IMessage extends Document {
  kind: MessageKind;
  sender: string;
  receiver?: string;
  room?: string;
  content: string;
  seen?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    kind: { type: String, enum: ["private", "room"], required: true },
    sender: { type: String, required: true },
    receiver: { type: String }, // username for private
    room: { type: String },     // room name for room messages
    content: { type: String, required: true },
    seen: { type: Boolean, default: false }
  },
  { timestamps: true }
);

MessageSchema.index({ kind: 1, sender: 1, receiver: 1, createdAt: 1 });
MessageSchema.index({ kind: 1, room: 1, createdAt: 1 });

export default mongoose.model<IMessage>("Message", MessageSchema);
