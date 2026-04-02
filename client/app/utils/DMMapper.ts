import type{
  UIConversation,
  UIMessage,
  ConversationDto,
  DirectMessageDto,
} from "../types/chat";

export const mapMessageToUI = (
  msg: DirectMessageDto,
  conversationId: string,
): UIMessage => ({
  id: msg.id,
  conversationId: conversationId,
  senderId: msg.senderId,
  text: msg.content, // Mapeo de contenido
  timestamp: msg.sentAt, // Mapeo de fecha
  avatar: msg.senderAvatarUrl, // Placeholder se maneja en el componente
});

export const mapConversationToUI = (conv: ConversationDto): UIConversation => ({
  id: conv.conversationId,
  user: {
    id: conv.otherParticipantId,
    name: conv.otherParticipantName,
    avatar: conv.otherParticipantAvatar,
    online: false, // Valor por defecto
  },
  lastMessage: conv.lastMessage?.content || "",
  lastMessageTime: conv.lastMessageAt,
});
