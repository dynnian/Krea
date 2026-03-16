// app/services/chat.ts
import type { Conversation, Message } from "../types/chat.ts";
import axios from "../lib/axios.ts";

export async function fetchConversations(): Promise<Conversation[]> {
  try {
    const response = await axios.get("/conversations");
    return response.data;
  } catch (error) {
    throw new Error("Error al cargar conversaciones");
  }
}

export async function fetchMessages(
  conversationId: string,
): Promise<Message[]> {
  try {
    const response = await axios.get(
      `/conversations/${conversationId}/messages`,
    );
    return response.data;
  } catch (error) {
    throw new Error("Error al cargar mensajes");
  }
}

// This REST endpoint is still available as a fallback, but you'll likely use SignalR for sending
export async function sendMessageRest(
  conversationId: string,
  text: string,
): Promise<Message> {
  try {
    const response = await axios.post(
      `/conversations/${conversationId}/messages`,
      { text },
    );
    return response.data;
  } catch (error) {
    throw new Error("Error al enviar mensaje");
  }
}
