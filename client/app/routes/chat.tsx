import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useAuth } from '~/contexts/AuthContext';
import { useChat } from '../lib/hooks/useChat';
import ConversationList from '../components/Chat/ConversationList';
import MessageList from '../components/Chat/MessageList';
import MessageInput from '../components/Chat/MessageInput';
import { Spin } from 'antd';

export default function ChatPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    selectConversation,
    sendMessage,
  } = useChat();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#E3E2DE]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#E3E2DE]">
      {/* Lista de conversaciones */}
      <div className="w-[421px] bg-[#E8F1FC] border-r border-[#646360] overflow-y-auto">
        <ConversationList
          conversations={conversations}
          selectedId={currentConversation?.id}
          onSelect={selectConversation}
        />
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 bg-[#E8F1FC] flex flex-col overflow-hidden">
        {currentConversation ? (
          <>
            {/* Cabecera */}
            <div className="p-4 border-b border-[#646360] bg-[#E8F1FC]">
              <div className="flex items-center gap-3">
                <img
                  src={currentConversation.user.avatar || 'https://placehold.co/48x48'}
                  alt={currentConversation.user.name}
                  className="w-12 h-12 rounded-full border border-gray-800"
                />
                <div>
                  <div className="font-medium text-[#1B1C1E] text-lg">
                    {currentConversation.user.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentConversation.user.online ? t('chat.online') : t('chat.offline')}
                  </div>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <MessageList messages={messages} currentUserId={user.id} />

            {/* Input */}
            <MessageInput onSend={sendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            {t('chat.select_conversation')}
          </div>
        )}
      </div>
    </div>
  );
}