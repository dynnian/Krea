export interface User {
  id: string;
  name: string;
  avatar?: string;
  online?: boolean;
}

export interface Conversation {
  id: string;
  user: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  avatar?: string; // avatar del remitente (para mostrar en la UI)
}
