import { type Conversation, type Message } from "../types/chat.ts";

const API_BASE = "/api";

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/conversations`);
  if (!res.ok) throw new Error("Error al cargar conversaciones");
  return res.json();
}

export async function fetchMessages(
  conversationId: string,
): Promise<Message[]> {
  const res = await fetch(
    `${API_BASE}/conversations/${conversationId}/messages`,
  );
  if (!res.ok) throw new Error("Error al cargar mensajes");
  return res.json();
}

export async function sendMessage(
  conversationId: string,
  text: string,
): Promise<Message> {
  const res = await fetch(
    `${API_BASE}/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    },
  );
  if (!res.ok) throw new Error("Error al enviar mensaje");
  return res.json();
}
