import { useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useChatStore, type ChatState } from "@/store/chatStore.ts";
import type { UIConversation } from "@/types/chat.ts";

export function useChat() {
  const { user } = useAuth();
  const lastUserId = useRef<string | null>(null);

  // 1. SELECTORES ATÓMICOS
  // Ahora el Store ya devuelve UIConversation y UIMessage directamente
  const conversationsMap = useChatStore(
    (state: ChatState) => state.conversations,
  );
  const conversationIds = useChatStore(
    (state: ChatState) => state.conversationIds,
  );
  const currentConversationId = useChatStore(
    (state: ChatState) => state.currentConversationId,
  );
  const allMessagesMap = useChatStore((state: ChatState) => state.messages);
  const loadingConversations = useChatStore(
    (state: ChatState) => state.loadingConversations,
  );
  const loadingMessagesMap = useChatStore(
    (state: ChatState) => state.loadingMessages,
  );

  // Acciones del Store
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

  // 2. EFECTO DE CARGA INICIAL
  useEffect(() => {
    const userId = user?.id;
    if (userId && userId !== lastUserId.current) {
      lastUserId.current = userId;
      setCurrentUser(userId);
      loadConversations().catch(console.error);
    }
  }, [user?.id, setCurrentUser, loadConversations]);

  // 3. DATOS PREPARADOS PARA LA UI
  // Ya no necesitamos funciones de mapeo aquí, el Store ya lo hizo.
  const conversationsUI = useMemo(() => {
    return conversationIds.map((id) => conversationsMap[id]).filter(Boolean);
  }, [conversationIds, conversationsMap]);

  const currentConversationUI = useMemo(() => {
    return currentConversationId
      ? conversationsMap[currentConversationId] || null
      : null;
  }, [currentConversationId, conversationsMap]);

  const messagesUI = useMemo(() => {
    if (!currentConversationId) return [];
    const currentMessages = allMessagesMap[currentConversationId] || {};

    // Convertimos el Record a Array y ordenamos por fecha (timestamp)
    return Object.values(currentMessages).sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }, [currentConversationId, allMessagesMap]);

  const loading = useMemo(() => {
    const isMsgLoading = currentConversationId
      ? loadingMessagesMap[currentConversationId]
      : false;
    return loadingConversations || isMsgLoading;
  }, [loadingConversations, loadingMessagesMap, currentConversationId]);

  // 4. CALLBACKS
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
      // Enviamos al ID del otro participante
      await sendMessageStore(currentConversationUI.user.id, text);
    },
    [currentConversationUI, user, sendMessageStore],
  );

  // 5. RETURN ESTABLE
  return useMemo(
    () => ({
      conversations: conversationsUI,
      currentConversation: currentConversationUI,
      messages: messagesUI,
      loading,
      selectConversation,
      sendMessage,
      loadConversations,
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
