import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '../lib/hooks/useChat';
import ConversationList from '../components/Chat/ConversationList';
import MessageList from '../components/Chat/MessageList';
import MessageInput from '../components/Chat/MessageInput';
import { Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

export default function ChatPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { conversations, currentConversation, messages, selectConversation, sendMessage } = useChat();
  const [drawerVisible, setDrawerVisible] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const handleSelect = (conv: any) => {
    selectConversation(conv);
    setDrawerVisible(false);
  };

  return (
    <div className="fixed inset-0 top-[64px] z-10 bg-[#E3E2DE] overflow-hidden flex justify-center font-sans">
      <div className="w-full max-w-[1440px] flex gap-6 p-4 md:p-6 overflow-hidden">
        
        {/* SIDEBAR DESKTOP */}
        <div className="hidden md:flex w-80 lg:w-96 bg-white border border-blue-100 rounded-2xl flex-col overflow-hidden shadow-sm flex-shrink-0">
          <ConversationList
            conversations={conversations}
            selectedId={currentConversation?.id}
            onSelect={selectConversation}
          />
        </div>

        {/* DRAWER MOBILE */}
        <Drawer
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={300}
          styles={{ body: { padding: 0 } }}
          className="md:hidden"
        >
          <ConversationList
            conversations={conversations}
            selectedId={currentConversation?.id}
            onSelect={handleSelect}
          />
        </Drawer>

        {/* CHAT AREA */}
        <div className="flex-1 bg-white border border-blue-100 rounded-2xl flex flex-col overflow-hidden shadow-sm relative">
          {currentConversation ? (
            <>
              <header className="h-16 bg-[#1351AA] flex items-center px-4 md:px-6 flex-shrink-0">
                {/* Botón condicional: Forzado a desaparecer en desktop */}
                <div className="md:hidden flex items-center">
                  <Button
                    type="text"
                    icon={<MenuOutlined style={{color:"#ffffff"}} className="text-white" />}
                    onClick={() => setDrawerVisible(true)}
                    className="mr-3 hover:bg-white/10 border-none"
                  />
                </div>
                
                <div className="flex items-center gap-3 text-white">
                  <img 
                    src={currentConversation.user.avatar || 'https://placehold.co/40x40'} 
                    className="w-10 h-10 rounded-full object-cover border border-white/20" 
                  />
                  <div>
                    <h3 className="font-bold text-sm leading-tight text-white">{currentConversation.user.name}</h3>
                    <p className="text-[10px] text-blue-100">
                      {currentConversation.user.online ? t('chat.online') : t('chat.offline')}
                    </p>
                  </div>
                </div>
              </header>

              <MessageList messages={messages} currentUserId={user.id} />

              <div className="p-4 bg-white border-t border-blue-50">
                <MessageInput onSend={sendMessage} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="md:hidden mb-4">
                <Button 
                  onClick={() => setDrawerVisible(true)} 
                  className="bg-[#1351AA] text-white border-none"
                >
                  {t('chat.conversations')}
                </Button>
              </div>
              <p className="text-lg font-medium">{t('chat.select_conversation')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}