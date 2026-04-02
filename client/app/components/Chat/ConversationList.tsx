import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UIConversation } from '../../types/chat';
import dayjs from 'dayjs';

interface Props {
  conversations: UIConversation[];
  selectedId?: string;
  onSelect: (conv: UIConversation) => void;
}

export default function ConversationList({ conversations, selectedId, onSelect }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  
  // Obtenemos el idioma para el formateo
  const currentLang = localStorage.getItem('lang') || 'es';

  const filtered = conversations.filter(c => 
    c?.user?.name?.toLowerCase().includes(query.toLowerCase()) ?? false
  );

  // Función para formatear la fecha de la última actividad
  const formatLastMessageTime = (dateStr?: string) => {
    if (!dateStr) return '';
    
    const date = dayjs(dateStr).locale(currentLang);
    const now = dayjs();

    if (date.isSame(now, 'day')) {
      return date.format('HH:mm');
    }
    
    if (date.isSame(now.subtract(1, 'day'), 'day')) {
      return currentLang === 'es' ? 'Ayer' : 'Yesterday';
    }

    if (date.isSame(now, 'year')) {
      return currentLang === 'es' ? date.format('D MMM') : date.format('MMM D');
    }

    return date.format('DD/MM/YY');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 bg-[#1351AA] flex items-center justify-between flex-shrink-0">
        <h2 className="font-bold text-white text-sm">{t('chat.conversations')}</h2>
      </div>

      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder={t('chat.search_placeholder') || "Buscar..."}
            className="w-full bg-gray-100 border-none rounded-lg py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-blue-100 outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {filtered.map((conv) => {
          const isSelected = conv.id === selectedId;
          return (
            <div 
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`p-3 rounded-xl cursor-pointer transition-all border outline-[#95ACCC] ${
                isSelected 
                  ? "bg-[#1351AA] text-white shadow-md border-[#1351AA]" 
                  : "hover:bg-blue-50 text-gray-700 bg-[#E8F1FC] border-transparent"
              }`}
            >
              <div className="flex gap-3">
                <div className="relative flex-shrink-0 items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    isSelected ? 'bg-white/20 border-white/10' : 'bg-gray-100 border-gray-200'
                  }`}>
                    {conv.user.avatar ? (
                      <img src={conv.user.avatar} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User size={18} className={isSelected ? "text-white" : "text-gray-400"} />
                    )}
                  </div>                
                  {conv.user.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className={`font-bold text-xs truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
                      {conv.user.name}
                    </span>
                    <span className={`text-[10px] whitespace-nowrap ml-2 ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
                      {formatLastMessageTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-blue-50" : "text-gray-500"}`}>
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}