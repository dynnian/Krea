import { useState, useEffect, useCallback } from "react";
import { useAuth } from "~/contexts/AuthContext";
import type { Conversation, Message } from "../../types/chat.ts";
import {
  fetchConversations,
  fetchMessages,
  sendMessage as sendMessageApi,
} from "../../services/conversations.ts";
import { startConnection, stopConnection } from "~/services/signalr/connection";
import {
  onMessageReceived,
  offMessageReceived,
  sendMessageViaHub,
} from "../../services/signalr/chatHub.ts";

export function useChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar conversaciones al montar
  useEffect(() => {
    if (!user) return;
    fetchConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Conectar SignalR cuando hay usuario
  useEffect(() => {
    if (!user ) return;
    startConnection("").catch(console.error);

    return () => {
      stopConnection();
    };
  }, [user]);

  // Escuchar mensajes entrantes
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      // Si es de la conversación actual, agregar a messages
      if (message.conversationId === currentConversation?.id) {
        setMessages((prev) => [...prev, message]);
      }
      // Actualizar lista de conversaciones (último mensaje)
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? {
                ...conv,
                lastMessage: message.text,
                lastMessageTime: message.timestamp,
              }
            : conv,
        ),
      );
    };

    onMessageReceived(handleNewMessage);
    return () => offMessageReceived(handleNewMessage);
  }, [currentConversation]);

  // Seleccionar una conversación y cargar sus mensajes
  const selectConversation = useCallback(async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    try {
      const msgs = await fetchMessages(conversation.id);
      setMessages(msgs);
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Enviar mensaje (fallback a API si SignalR falla)
  const sendMessage = useCallback(
    async (text: string) => {
      if (!currentConversation) return;

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        conversationId: currentConversation.id,
        senderId: user!.id,
        text,
        timestamp: new Date().toISOString(),
        avatar: user?.avatar,
      };
      setMessages((prev) => [...prev, tempMessage]);

      try {
        // Intentar enviar por SignalR
        await sendMessageViaHub(currentConversation.id, text);
      } catch (error) {
        // Fallback a HTTP
        console.warn("SignalR failed, using HTTP", error);
        try {
          const sent = await sendMessageApi(currentConversation.id, text);
          // Reemplazar mensaje temporal
          setMessages((prev) => prev.map((m) => (m.id === tempId ? sent : m)));
        } catch (httpError) {
          // Revertir optimistic update
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          throw httpError;
        }
      }
    },
    [currentConversation, user],
  );

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    selectConversation,
    sendMessage,
  };
}
