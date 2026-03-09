import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Conversation, Message } from "../types/chat";
import {
  fetchConversations,
  fetchMessages,
  sendMessageRest,
} from "../services/conversations";
import { sendMessageViaHub } from "../services/signalr/chatHub";

interface ChatState {
  // Normalized DTOs
  conversations: Record<string, Conversation>;
  conversationIds: string[];
  messages: Record<string, Record<string, Message>>; // by conversationId -> messageId

  // UI state
  currentConversationId: string | null;
  currentUserId: string | null;

  // Loading states
  loadingConversations: boolean;
  loadingMessages: Record<string, boolean>;

  // Actions
  setCurrentUser: (id: string) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  addMessage: (conversationId: string, message: Message) => void;
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

      loadConversations: async () => {
        set({ loadingConversations: true });
        try {
          const data = await fetchConversations();
          const entities: Record<string, Conversation> = {};
          const ids: string[] = [];
          data.forEach((conv) => {
            entities[conv.conversationId] = conv;
            ids.push(conv.conversationId);
          });
          // Sort by latest message time
          ids.sort((a, b) => {
            const timeA = entities[a].messages?.[0]?.sentAt || "";
            const timeB = entities[b].messages?.[0]?.sentAt || "";
            return timeB.localeCompare(timeA);
          });
          set({ conversations: entities, conversationIds: ids });
        } finally {
          set({ loadingConversations: false });
        }
      },

      loadMessages: async (conversationId) => {
        set((state) => ({
          loadingMessages: { ...state.loadingMessages, [conversationId]: true },
        }));
        try {
          const msgs = await fetchMessages(conversationId);
          const messageMap: Record<string, Message> = {};
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
          // Avoid duplicates
          if (state.messages[conversationId]?.[message.id]) return state;

          // Update messages
          const newMessages = {
            ...state.messages,
            [conversationId]: {
              ...(state.messages[conversationId] || {}),
              [message.id]: message,
            },
          };

          // Update conversation's last message (for preview)
          const conversation = state.conversations[conversationId];
          if (conversation) {
            const updatedConversation = {
              ...conversation,
              messages: [message, ...(conversation.messages || [])].slice(0, 1),
            };
            return {
              messages: newMessages,
              conversations: {
                ...state.conversations,
                [conversationId]: updatedConversation,
              },
              // Move conversation to top
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
        const { currentConversationId, currentUserId, addMessage } = get();
        if (!currentConversationId || !currentUserId) return;

        // Optimistic update
        const tempId = crypto.randomUUID();
        const tempMessage: Message = {
          id: tempId,
          senderId: currentUserId,
          receiverId,
          content,
          sentAt: new Date().toISOString(),
          isRead: false,
          senderUsername: "",
          senderDisplayName: "",
          senderAvatarUrl: null,
        };
        addMessage(currentConversationId, tempMessage);

        try {
          await sendMessageViaHub(receiverId, content);
        } catch (error) {
          console.warn("SignalR failed, falling back to REST", error);
          // Remove optimistic message
          set((state) => {
            const { [tempId]: _, ...rest } =
              state.messages[currentConversationId] || {};
            return {
              messages: {
                ...state.messages,
                [currentConversationId]: rest,
              },
            };
          });
          try {
            const sent = await sendMessageRest(currentConversationId, content);
            addMessage(currentConversationId, sent);
          } catch (restError) {
            console.error("REST also failed", restError);
            // Show error notification (you can extend this)
          }
        }
      },
    }),
    { name: "ChatStore" },
  ),
);
