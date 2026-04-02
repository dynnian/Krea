// app/services/signalrListener.ts
import { useChatStore } from "../store/chatStore";
import { startConnection, stopConnection } from "./signalr/connection";
import { onMessageReceived, offMessageReceived } from "./signalr/chatHub";
import { storage } from "../lib/storage";
import type { DirectMessageDto, ConversationDto } from "../types/chat";

let initialized = false;
let messageHandler: (message: DirectMessageDto) => void;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL; // e.g., http://127.0.0.1:5101/api

export const initSignalR = (userId: string) => {
  if (initialized) return;
  initialized = true;

  useChatStore.getState().setCurrentUser(userId);

  startConnection().catch(console.error);

  messageHandler = (message: DirectMessageDto) => {
    const { currentUserId, conversations } = useChatStore.getState();
    if (!currentUserId) return;

    const otherId =
      message.senderId === currentUserId
        ? message.receiverId
        : message.senderId;

    // CAMBIO AQUÍ: Buscar en conv.user.id
    const conversationEntry = Object.entries(conversations).find(
      ([_, conv]) => conv.user.id === otherId,
    );

    if (conversationEntry) {
      const [convId] = conversationEntry;
      useChatStore.getState().addMessage(convId, message);
    } else {
      fetchNewConversation(otherId, message);
    }
  };

  onMessageReceived(messageHandler);
};

async function fetchNewConversation(
  otherUserId: string,
  message: DirectMessageDto,
) {
  const token = storage.getToken();
  if (!token) {
    console.error("No token available to fetch new conversation");
    return;
  }

  try {
    const response = await fetch(
      `${apiBaseUrl}/DirectMessages/${otherUserId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.status}`);
    }

    const data = await response.json();

    // Build a ConversationDto that matches the store's expected shape
    const conversation: ConversationDto = {
      conversationId: data.conversationId,
      otherParticipantId: data.otherParticipantId,
      otherParticipantName: data.otherParticipantName,
      otherParticipantAvatar: data.otherParticipantAvatar,
      lastMessage: data.messages?.[0] || null, // use the most recent message
      lastMessageAt: data.messages?.[0]?.sentAt || null,
      unreadCount: 0, // default; if the API returns it, use data.unreadCount ?? 0
    };

    useChatStore.getState().addConversation(conversation);
    useChatStore.getState().addMessage(conversation.conversationId, message);
  } catch (error) {
    console.error("Error fetching new conversation:", error);
  }
}

export const stopSignalR = () => {
  if (messageHandler) {
    offMessageReceived(messageHandler);
  }
  stopConnection();
  initialized = false;
};
