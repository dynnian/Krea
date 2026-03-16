import { useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useChatStore, type ChatState } from "@/store/chatStore.ts"; // Asegúrate de importar ChatState
import type {
  ConversationDto,
  DirectMessageDto,
  UIConversation,
  UIMessage,
} from "@/types/chat.ts";
import dayjs from "../dayjs.ts";


const mapConversationToUI = (dto: ConversationDto): UIConversation => {
  let lastMessageTime = '';
  if (dto.lastMessageAt) {
    const date = dayjs(dto.lastMessageAt);
    if (date.isToday()) {
      lastMessageTime = date.format('HH:mm'); // 14:30
    } else if (date.isYesterday()) {
      // Usar el texto según el idioma actual de dayjs
      lastMessageTime = dayjs.locale() === 'es' ? 'Ayer' : 'Yesterday';
    } else {
      lastMessageTime = date.format('DD/MM/YY'); // 15/03/26
    }
  }

  return {
    id: dto.conversationId,
    user: {
      id: dto.otherParticipantId,
      name: dto.otherParticipantName,
      avatar: dto.otherParticipantAvatar,
      online: false, // pendiente del backend
    },
    lastMessage: dto.lastMessage?.content,
    lastMessageTime,
  };
};

const mapMessageToUI = (
  dto: DirectMessageDto,
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
  const lastUserId = useRef<string | null>(null);

  // 1. SELECTORES ATÓMICOS (Evitan el error de getSnapshot)
  const conversationsDto = useChatStore(
    (state: ChatState) => state.conversations,
  );
  const conversationIds = useChatStore(
    (state: ChatState) => state.conversationIds,
  );
  const currentConversationId = useChatStore(
    (state: ChatState) => state.currentConversationId,
  );
  const allMessages = useChatStore((state: ChatState) => state.messages);
  const loadingConversations = useChatStore(
    (state: ChatState) => state.loadingConversations,
  );
  const loadingMessagesMap = useChatStore(
    (state: ChatState) => state.loadingMessages,
  );

  // Acciones estables de Zustand
  const setCurrentUser = useChatStore(
    (state: ChatState) => state.setCurrentUser,
  );
  const loadConversations = useChatStore(
    (state: ChatState) => state.loadConversations,
  );
  const loadMessages = useChatStore((state: ChatState) => state.loadMessages);
  const setCurrentConversation = useChatStore(
    (state: ChatState) => state.setCurrentConversation,
  );
  const sendMessageStore = useChatStore(
    (state: ChatState) => state.sendMessage,
  );

  // 2. EFECTO DE CARGA CONTROLADO (Solo por ID)
  useEffect(() => {
    const userId = user?.id;
    if (userId && userId !== lastUserId.current) {
      lastUserId.current = userId;
      setCurrentUser(userId);
      loadConversations().catch(console.error);
    }
  }, [user?.id, setCurrentUser, loadConversations]);

  // 3. MEMORIZACIÓN DE DATOS UI
  const conversationsUI = useMemo(() => {
    return conversationIds
      .map((id) => conversationsDto[id])
      .filter(Boolean)
      .map(mapConversationToUI);
  }, [conversationIds, conversationsDto]);

  const currentConversationUI = useMemo(() => {
    return currentConversationId && conversationsDto[currentConversationId]
      ? mapConversationToUI(conversationsDto[currentConversationId])
      : null;
  }, [currentConversationId, conversationsDto]);

  const messagesUI = useMemo(() => {
    const currentMessagesMap = currentConversationId
      ? allMessages[currentConversationId]
      : null;
    if (!currentConversationId || !currentMessagesMap) return [];

    return Object.values(currentMessagesMap)
      .sort((a, b) => a.sentAt.localeCompare(b.sentAt))
      .map((dto) => mapMessageToUI(dto, currentConversationId));
  }, [currentConversationId, allMessages]);

  const loading = useMemo(() => {
    const isMsgLoading = currentConversationId
      ? loadingMessagesMap[currentConversationId]
      : false;
    return loadingConversations || isMsgLoading;
  }, [loadingConversations, loadingMessagesMap, currentConversationId]);

  // 4. CALLBACKS MEMORIZADOS
  const selectConversation = useCallback(
    async (conversation: UIConversation) => {
      setCurrentConversation(conversation.id);
      await loadMessages(conversation.id);
    },
    [setCurrentConversation, loadMessages],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!currentConversationUI || !user) return;
      await sendMessageStore(currentConversationUI.user.id, text);
      console.log("sendMessage called with text:", text);
    },
    [currentConversationUI, user, sendMessageStore],
  );

  // 5. RETURN TOTALMENTE ESTABLE
  return useMemo(
    () => ({
      conversations: conversationsUI,
      currentConversation: currentConversationUI,
      messages: messagesUI,
      loading,
      selectConversation,
      sendMessage,
      loadConversations, // Lo añadimos por si ChatPage lo necesita llamar manualmente
    }),
    [
      conversationsUI,
      currentConversationUI,
      messagesUI,
      loading,
      selectConversation,
      sendMessage,
      loadConversations,
    ],
  );
}
