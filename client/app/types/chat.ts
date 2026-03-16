export interface Conversation {
  conversationId: string;
  otherParticipantId: string;
  otherParticipantName: string;
  otherParticipantAvatar: string | null;
  messages?: Message[]; // last message(s) for preview
}

export interface Message {
  id: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderAvatarUrl: string | null;
  receiverId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}
export interface DirectMessageDto {
  id: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderAvatarUrl: string | null;
  receiverId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface ConversationDto {
  conversationId: string;
  otherParticipantId: string;
  otherParticipantName: string;
  otherParticipantAvatar: string | null;
  lastMessage: DirectMessageDto | null;
  lastMessageAt: string;
  unreadCount: number;
}

// UI-friendly types (what your components expect)
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