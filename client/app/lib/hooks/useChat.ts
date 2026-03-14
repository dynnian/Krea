import { useEffect, useCallback } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { storage } from "../storage.ts";
import {
  startConnection,
  stopConnection,
} from "../../services/signalr/connection";
import {
  onMessageReceived,
  offMessageReceived,
} from "../../services/signalr/chatHub";
import type {
  Conversation as ConversationDTO,
  Message as MessageDTO,
} from "../../types/chat.ts";
import { useChatStore } from "../../store/chatStore.ts";

// UI-friendly types (matches your old hook's return)
export interface UIConversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    online?: boolean;
  };
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface UIMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  avatar?: string | null;
}

// Mappers from DTO to UI
const mapConversationToUI = (dto: ConversationDTO): UIConversation => ({
  id: dto.conversationId,
  user: {
    id: dto.otherParticipantId,
    name: dto.otherParticipantName,
    avatar: dto.otherParticipantAvatar,
    online: false, // can be extended later
  },
  lastMessage: dto.messages?.[0]?.content,
  lastMessageTime: dto.messages?.[0]?.sentAt,
});

const mapMessageToUI = (
  dto: MessageDTO,
  conversationId: string,
): UIMessage => ({
  id: dto.id,
  conversationId,
  senderId: dto.senderId,
  text: dto.content,
  timestamp: dto.sentAt,
  avatar: dto.senderAvatarUrl,
});

export function useChat() {
  const { user } = useAuth();
  const token = storage.getToken(); // adjust based on your auth context

  // Store selectors
  const conversationsDTO = useChatStore((state) => state.conversations);
  const conversationIds = useChatStore((state) => state.conversationIds);
  const messagesDTO = useChatStore((state) =>
    state.currentConversationId
      ? state.messages[state.currentConversationId]
      : {},
  );
  const currentConversationId = useChatStore(
    (state) => state.currentConversationId,
  );
  const loadingConversations = useChatStore(
    (state) => state.loadingConversations,
  );
  const loadingMessages = useChatStore((state) =>
    state.currentConversationId
      ? state.loadingMessages[state.currentConversationId]
      : false,
  );

  // Store actions
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);
  const loadConversations = useChatStore((state) => state.loadConversations);
  const loadMessages = useChatStore((state) => state.loadMessages);
  const setCurrentConversationId = useChatStore(
    (state) => state.setCurrentConversation,
  );
  const sendMessageStore = useChatStore((state) => state.sendMessage);
  const addMessage = useChatStore((state) => state.addMessage);

  // Initialize user in store and load conversations
  useEffect(() => {
    if (user) {
      console.log("User present, loading conversations");
      setCurrentUser(user.id);
      loadConversations();
    }
  }, [user, setCurrentUser, loadConversations]);

  // SignalR connection
  useEffect(() => {
    if (!user || !token) return;
    startConnection().catch(console.error);
    return () => {
      stopConnection();
    };
  }, [user, token]);

  // Listen for incoming messages
  useEffect(() => {
    const handleNewMessage = (messageDTO: MessageDTO) => {
      // Derive conversationId from sender/receiver (pair-based)
      const conversationId = [messageDTO.senderId, messageDTO.receiverId]
        .sort()
        .join("-");
      addMessage(conversationId, messageDTO);
    };

    onMessageReceived(handleNewMessage);
    return () => offMessageReceived(handleNewMessage);
  }, [addMessage]);

  // Build UI lists
  const conversationsUI = conversationIds
    .map((id) => conversationsDTO[id])
    .filter(Boolean)
    .map(mapConversationToUI);

  const currentConversationUI =
    currentConversationId && conversationsDTO[currentConversationId]
      ? mapConversationToUI(conversationsDTO[currentConversationId])
      : null;

  const messagesUI =
    currentConversationId && messagesDTO
      ? Object.values(messagesDTO)
          .sort((a, b) => a.sentAt.localeCompare(b.sentAt))
          .map((dto) => mapMessageToUI(dto, currentConversationId))
      : [];

  // Select conversation
  const selectConversation = useCallback(
    async (conversation: UIConversation) => {
      setCurrentConversationId(conversation.id);
      // Load messages if not already present (store handles idempotency)
      await loadMessages(conversation.id);
    },
    [setCurrentConversationId, loadMessages],
  );

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!currentConversationUI || !user) return;
      const receiverId = currentConversationUI.user.id;
      await sendMessageStore(receiverId, text);
    },
    [currentConversationUI, user, sendMessageStore],
  );

  return {
    conversations: conversationsUI,
    currentConversation: currentConversationUI,
    messages: messagesUI,
    loading: loadingConversations || loadingMessages,
    selectConversation,
    sendMessage,
  };
}
