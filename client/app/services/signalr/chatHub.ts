import { getConnection, startConnection } from "./connection";
import { Message } from "../../types/chat";

export const onMessageReceived = (callback: (message: Message) => void) => {
  const connection = getConnection();
  connection.on("ReceiveMessage", callback);
};

export const offMessageReceived = (callback: (message: Message) => void) => {
  const connection = getConnection();
  connection.off("ReceiveMessage", callback);
};

export const sendMessageViaHub = async (
  receiverId: string,
  content: string,
) => {
  const connection = await startConnection(); // ensures started
  await connection.invoke("SendMessage", { receiverId, content });
};
