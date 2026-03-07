import React, { useRef, useEffect } from 'react';
import { type Message } from '../../types/chat';
import { Avatar } from 'antd';

interface Props {
  messages: Message[];
  currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-4">
      {messages.map((msg) => {
        const isMe = msg.senderId === currentUserId;
        return (
          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            {!isMe && <Avatar src={msg.avatar} size={32} className="mr-2" />}
            <div
              className={`max-w-[645px] px-4 py-2 rounded-2xl ${
                isMe ? 'bg-[#E3E2DE] text-[#1B1C1E]' : 'bg-[#377334] text-[#E3E2DE]'
              }`}
            >
              <div className="text-base font-medium">{msg.text}</div>
            </div>
            {isMe && <div className="w-8" />}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}