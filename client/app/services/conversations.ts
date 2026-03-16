import type { ConversationDto, DirectMessageDto } from "../types/chat.ts";
import axios from "../lib/axios.ts";

export async function fetchConversations(): Promise<ConversationDto[]> {
  const response = await axios.get('/DirectMessages/conversations');
  return response.data;
}

export async function fetchMessages(conversationId: string): Promise<DirectMessageDto[]> {
  const response = await axios.get(`/DirectMessages/conversations/${conversationId}/messages`);
  return response.data;
}

export async function sendMessageRest(receiverId: string, content: string): Promise<DirectMessageDto> {
  const response = await axios.post('/DirectMessages', {
    receiverId,
    content
  });
  return response.data;
}
