import React, { useRef, useEffect } from 'react';
import { List, Avatar, Typography, Flex } from 'antd';
import type { Message } from '../../types/chat';

const { Text } = Typography;

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
    <div className="flex-1 overflow-y-auto p-8">
      <List
        dataSource={messages}
        split={false}
        renderItem={(msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <List.Item className="border-0 p-0 mb-4">
              <Flex justify={isMe ? 'flex-end' : 'flex-start'} align="start" gap={8}>
                {!isMe && (
                  <Avatar src={msg.avatar} size={32} className="mt-1" />
                )}
                <div
                  className={`max-w-[645px] px-4 py-2 rounded-2xl ${
                    isMe
                      ? 'bg-[#E3E2DE] text-[#1B1C1E]'
                      : 'bg-[#377334] text-[#E3E2DE]'
                  }`}
                >
                  <Text className="text-base font-medium block">{msg.text}</Text>
                </div>
                {isMe && <div style={{ width: 32 }} />} {/* spacer for alignment */}
              </Flex>
            </List.Item>
          );
        }}
      />
      <div ref={bottomRef} />
    </div>
  );
}