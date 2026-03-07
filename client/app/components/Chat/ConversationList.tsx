import React from 'react';
import { type Conversation } from '../../types/chat';
import { Avatar } from 'antd';

interface Props {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conv: Conversation) => void;
}

export default function ConversationList({ conversations, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-col">
      {conversations.map((conv, index) => (
        <React.Fragment key={conv.id}>
          <button
            onClick={() => onSelect(conv)}
            className={`flex items-center gap-4 px-6 py-3 w-full text-left hover:bg-[#BFD1EA] transition-colors ${
              selectedId === conv.id ? 'bg-[#BFD1EA]' : index === 0 ? 'bg-[#94B1DA]' : 'bg-[#BFD1EA]'
            }`}
          >
            <div className="relative">
              <Avatar src={conv.user.avatar} size={64} className="border border-gray-800" />
              {conv.user.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[#1B1C1E] text-lg truncate">{conv.user.name}</div>
              <div className="text-sm text-[#1B1C1E] truncate">
                {conv.lastMessage} - {conv.lastMessageTime}
              </div>
            </div>
          </button>
          {index < conversations.length - 1 && (
            <div className="border-t border-[#8F8E8A] mx-6"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}