import React from 'react';
import { List, Avatar, Badge, Typography } from 'antd';
import type { UIConversation } from '../../types/chat';

const { Text } = Typography;

interface Props {
  conversations: UIConversation[];
  selectedId?: string;
  onSelect: (conv: UIConversation) => void;
}

export default function ConversationList({ conversations, selectedId, onSelect }: Props) {
  return (
    <List
      dataSource={conversations}
      split={false}
      renderItem={(conv, index) => {
        const isSelected = conv.id === selectedId;
        const bgColor = isSelected
          ? 'bg-[#BFD1EA]'
          : index === 0
          ? 'bg-[#94B1DA]'
          : 'bg-[#BFD1EA]';

        return (
          <div
            onClick={() => onSelect(conv)}
            className={`cursor-pointer px-6 py-3 hover:bg-[#94B1DA] ${bgColor}`}
          >
            <List.Item className="border-0 p-0">
              <List.Item.Meta
                avatar={
                  <Badge
                    color="green"
                    dot={conv.user.online}
                    offset={[-5, 40]}
                  >
                    <Avatar src={conv.user.avatar} size={64} className="border border-gray-800" />
                  </Badge>
                }
                title={
                  <Text strong className="text-[#1B1C1E] text-lg block truncate">
                    {conv.user.name}
                  </Text>
                }
                description={
                  <Text className="text-[#1B1C1E] text-sm truncate">
                    {conv.lastMessage} - {conv.lastMessageTime}
                  </Text>
                }
              />
            </List.Item>
            {index < conversations.length - 1 && (
              <div className="border-t border-[#8F8E8A] mx-6 my-2" />
            )}
          </div>
        );
      }}
    />
  );
}