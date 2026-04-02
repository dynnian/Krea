import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ConversationDto, DirectMessageDto, UIConversation, UIMessage } from "../types/chat";
import {
  fetchConversations,
  fetchMessages,
  sendMessageRest,
} from "../services/conversations";
import { sendMessageViaHub } from "../services/signalr/chatHub";
import { mapConversationToUI, mapMessageToUI } from "../utils/DMMapper.ts";

export interface ChatState {
  conversations: Record<string, UIConversation>;
  conversationIds: string[];
  messages: Record<string, Record<string, UIMessage>>;
  currentConversationId: string | null;
  currentUserId: string | null;
  loadingConversations: boolean;
  loadingMessages: Record<string, boolean>;

  setCurrentUser: (id: string) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  addMessage: (conversationId: string, message: DirectMessageDto) => void;
  addConversation: (conversation: ConversationDto) => void;
  setCurrentConversation: (id: string | null) => void;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      conversations: {},
      conversationIds: [],
      messages: {},
      currentConversationId: null,
      currentUserId: null,
      loadingConversations: false,
      loadingMessages: {},

      setCurrentUser: (id) => set({ currentUserId: id }),

      addConversation: (conversation: ConversationDto) => {
        set((state) => {
          const uiConv = mapConversationToUI(conversation);
          if (state.conversations[uiConv.id]) return state;

          return {
            conversations: { ...state.conversations, [uiConv.id]: uiConv },
            conversationIds: [uiConv.id, ...state.conversationIds],
          };
        });
      },

      loadConversations: async () => {
        set({ loadingConversations: true });
        try {
          const data = await fetchConversations();
          const entities: Record<string, UIConversation> = {};
          const ids: string[] = [];

          data.forEach((dto) => {
            // USAR EL MAPPER AQUÍ
            const uiConv = mapConversationToUI(dto);
            entities[uiConv.id] = uiConv;
            ids.push(uiConv.id);
          });

          set({ conversations: entities, conversationIds: ids });
        } finally {
          set({ loadingConversations: false });
        }
      },

      loadMessages: async (conversationId: string) => {
        set((state) => ({
          loadingMessages: { ...state.loadingMessages, [conversationId]: true },
        }));
        try {
          const apiMessages = await fetchMessages(conversationId);

          // MAPEO AQUÍ
          const uiMessages = apiMessages.reduce(
            (acc, msg) => {
              acc[msg.id] = mapMessageToUI(msg, conversationId);
              return acc;
            },
            {} as Record<string, UIMessage>,
          );

          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: uiMessages,
            },
          }));
        } finally {
          set((state) => ({
            loadingMessages: {
              ...state.loadingMessages,
              [conversationId]: false,
            },
          }));
        }
      },

      addMessage: (conversationId: string, message: DirectMessageDto) => {
        set((state) => {
          const uiMessage = mapMessageToUI(message, conversationId);
          const conversationMessages = state.messages[conversationId] || {};

          const newMessages = {
            ...state.messages,
            [conversationId]: {
              ...conversationMessages,
              [uiMessage.id]: uiMessage,
            },
          };

          const conversation = state.conversations[conversationId];
          if (conversation) {
            // Actualizamos el objeto UIConversation
            const updatedConversation: UIConversation = {
              ...conversation,
              lastMessage: uiMessage.text,
              lastMessageTime: new Date(message.sentAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };

            return {
              messages: newMessages,
              conversations: {
                ...state.conversations,
                [conversationId]: updatedConversation,
              },
              conversationIds: [
                conversationId,
                ...state.conversationIds.filter((id) => id !== conversationId),
              ],
            };
          }
          return { messages: newMessages };
        });
      },

      setCurrentConversation: (id) => set({ currentConversationId: id }),

      sendMessage: async (receiverId, content) => {
        const { currentConversationId, currentUserId } = get();
        if (!currentConversationId || !currentUserId) return;

        try {
          await sendMessageViaHub(currentUserId, receiverId, content);
          // No agregamos mensaje optimista; el real vendrá por SignalR
        } catch (error) {
          try {
            const sent = await sendMessageRest(receiverId, content);
            // Si usas REST como fallback, agregas el mensaje devuelto
            get().addMessage(currentConversationId, sent);
          } catch (restError) {
            console.error("REST also failed", restError);
          }
        }
      },
    }),
    { name: "ChatStore" },
  ),
);