import { useChatStore } from "../store/chatStore";
import {
  startConnection,
  onMessageReceived,
  offMessageReceived,
} from "./chatHub";

let initialized = false;

export const initSignalR = (currentUserId: string) => {
  if (initialized) return;
  initialized = true;

  // Set the current user in the store (if not already)
  useChatStore.getState().setCurrentUser(currentUserId);

  startConnection().catch(console.error);

  onMessageReceived((message: Message) => {
    // Determine conversationId. The message DTO doesn't have it, so we need to derive.
    // One approach: use a sorted combination of sender and receiver IDs.
    const conversationId = [message.senderId, message.receiverId]
      .sort()
      .join("-");
    useChatStore.getState().addMessage(conversationId, message);
  });
};

export const stopSignalR = () => {
  // stop connection and cleanup
  initialized = false;
  // you might call stopConnection() from connection.ts
};
