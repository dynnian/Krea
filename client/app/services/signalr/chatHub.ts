import { type Message } from "../../types/chat";
import { getConnection } from "./connection.ts";

export const onMessageReceived = (callback: (message: Message) => void) => {
  const connection = getConnection("");
  connection.on("ReceiveMessage", callback);
};

export const offMessageReceived = (callback: (message: Message) => void) => {
  const connection = getConnection("");
  connection.off("ReceiveMessage", callback);
};

export const sendMessageViaHub = async (
  conversationId: string,
  text: string,
) => {
  const connection = getConnection("");
  await connection.invoke("SendMessage", { conversationId, text });
};
