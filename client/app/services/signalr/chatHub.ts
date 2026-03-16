// services/signalr/chatHub.ts
import { getConnection, startConnection } from "./connection";
import type { DirectMessageDto } from "../../types/chat";

export const onMessageReceived = (
  callback: (message: DirectMessageDto) => void,
) => {
  const connection = getConnection();
  connection.on("ReceiveMessage", callback);
};

export const offMessageReceived = (
  callback: (message: DirectMessageDto) => void,
) => {
  const connection = getConnection();
  connection.off("ReceiveMessage", callback);
};

export const sendMessageViaHub = async (
  senderId: string,
  receiverId: string,
  content: string,
) => {
  const connection = await startConnection();
  console.log("🔌 sendMessageViaHub: connection state =", connection.state);

  await connection.invoke("SendMessage", { senderId, receiverId, content });
  console.log("✅ invoke completed");
};
