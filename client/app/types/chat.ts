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