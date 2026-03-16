import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ConversationDto, DirectMessageDto } from "../types/chat";
import {
  fetchConversations,
  fetchMessages,
  sendMessageRest,
} from "../services/conversations";
import { sendMessageViaHub } from "../services/signalr/chatHub";

export interface ChatState {
  conversations: Record<string, ConversationDto>;
  conversationIds: string[];
  messages: Record<string, Record<string, DirectMessageDto>>;
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
          if (state.conversations[conversation.conversationId]) return state;
          return {
            conversations: {
              ...state.conversations,
              [conversation.conversationId]: conversation,
            },
            conversationIds: [
              conversation.conversationId,
              ...state.conversationIds,
            ],
          };
        });
      },

      loadConversations: async () => {
        console.log("🟡 loadConversations started");
        set({ loadingConversations: true });
        try {
          const data = await fetchConversations();
          console.log("🟢 fetchConversations succeeded", data);
          const entities: Record<string, ConversationDto> = {};
          const ids: string[] = [];
          data.forEach((conv) => {
            entities[conv.conversationId] = conv;
            ids.push(conv.conversationId);
          });
          ids.sort((a, b) =>
            (entities[b].lastMessageAt || "").localeCompare(
              entities[a].lastMessageAt || "",
            ),
          );
          set({ conversations: entities, conversationIds: ids });
        } catch (error) {
          console.error("🔴 fetchConversations failed", error);
        } finally {
          console.log("🔵 finally: setting loadingConversations = false");
          set({ loadingConversations: false });
        }
      },

      loadMessages: async (conversationId) => {
        set((state) => ({
          loadingMessages: { ...state.loadingMessages, [conversationId]: true },
        }));
        try {
          const msgs = await fetchMessages(conversationId);
          const messageMap: Record<string, DirectMessageDto> = {};
          msgs.forEach((msg) => {
            messageMap[msg.id] = msg;
          });
          set((state) => ({
            messages: { ...state.messages, [conversationId]: messageMap },
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

      addMessage: (conversationId, message) => {
        set((state) => {
          if (state.messages[conversationId]?.[message.id]) return state;
          const newMessages = {
            ...state.messages,
            [conversationId]: {
              ...(state.messages[conversationId] || {}),
              [message.id]: message,
            },
          };
          const conversation = state.conversations[conversationId];
          if (conversation) {
            const updatedConversation = {
              ...conversation,
              lastMessage: message,
              lastMessageAt: message.sentAt,
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
          console.warn("SignalR failed, falling back to REST", error);
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