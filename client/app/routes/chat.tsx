import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '../lib/hooks/useChat';
import ConversationList from '../components/Chat/ConversationList';
import MessageList from '../components/Chat/MessageList';
import MessageInput from '../components/Chat/MessageInput';
import { Spin, Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

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

  const [drawerVisible, setDrawerVisible] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSelectConversation = (conv) => {
    selectConversation(conv);
    setDrawerVisible(false);
  };

  return (
    /* AJUSTE CLAVE: 
       Cambiamos 'flex' por 'fixed inset-0 top-[64px] z-10' para ignorar el max-width del padre.
       Mantenemos el 'justify-center' para que el max-w-7xl interno funcione. 
    */
    <div className="fixed inset-0 top-14.5 z-10 bg-[#E3E2DE] overflow-hidden flex justify-center">
      {/* Contenedor con ancho máximo y centrado - Tu código base */}
      <div className="w-full max-w-8xl flex overflow-hidden">
        {/* Sidebar para desktop: 40% en desktop, oculto en móvil */}
        <div className="hidden md:block w-[20%] bg-[#E8F1FC] border-r border-[#646360] overflow-hidden">
          <div className="h-full overflow-y-auto">
            <ConversationList
              conversations={conversations}
              selectedId={currentConversation?.id}
              onSelect={selectConversation}
            />
          </div>
        </div>

        {/* Drawer para móvil */}
        <Drawer
          title={t('chat.conversations')}
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={320}
          push={false}
          destroyOnClose
          className="md:hidden"
        >
          <ConversationList
            conversations={conversations}
            selectedId={currentConversation?.id}
            onSelect={handleSelectConversation}
          />
        </Drawer>

        {/* Área de chat: 70% en desktop, 100% en móvil */}
        <div className="flex-1 md:w-[60%] bg-[#E8F1FC] flex flex-col overflow-hidden">
          {currentConversation ? (
            <>
              {/* Header con botón de menú solo en móvil */}
              <div className="p-4 border-b border-[#646360] bg-[#E8F1FC] flex items-center">
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setDrawerVisible(true)}
                  className="md:hidden mr-2"
                />
                <div className="flex items-center gap-3">
                  <img
                    src={currentConversation.user.avatar || 'https://placehold.co/48x48'}
                    alt={currentConversation.user.name}
                    className="w-12 h-12 rounded-full border border-gray-800 object-cover"
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
              <div className="flex-1 overflow-y-auto p-4">
                <MessageList messages={messages} currentUserId={user.id} />
              </div>

              {/* Input */}
              <div className="p-4 bg-[#E8F1FC] border-t border-[#646360]">
                <MessageInput onSend={sendMessage} />
              </div>
            </>
          ) : (
            /* Cuando no hay conversación seleccionada */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header con botón de menú solo en móvil */}
              <div className="p-4 border-b border-[#646360] bg-[#E8F1FC] flex items-center md:hidden">
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setDrawerVisible(true)}
                  className="mr-2"
                />
                <span className="font-medium text-[#1B1C1E]">{t('chat.conversations')}</span>
              </div>
              {/* Mensaje centrado */}
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-xl font-medium">{t('chat.select_conversation')}</p>
                  <p className="text-sm opacity-70">{t('chat.start_messaging')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}