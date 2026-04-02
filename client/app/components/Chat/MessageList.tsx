import React, { useRef, useEffect, useMemo } from 'react';
import type { UIMessage } from '../../types/chat';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

// Cargamos los plugins necesarios
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

interface Props {
  messages: UIMessage[];
  currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentLang = localStorage.getItem('lang') || 'es';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- LÓGICA DE AGRUPACIÓN ---
  const groupedMessages = useMemo(() => {
    const groups: { [key: string]: UIMessage[] } = {};
    
    messages.forEach((msg) => {
      const date = dayjs(msg.timestamp).format('YYYY-MM-DD');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/30 custom-scrollbar">
      {groupedMessages.map(([date, msgs]) => (
        /* ESTE CONTENEDOR ES LA CLAVE: El sticky morirá al final de este div */
        <div key={date} className="relative mb-8">
          
          {/* SEPARADOR STICKY */}
          <div className="sticky top-2 z-10 flex justify-center mb-6 pointer-events-none">
            <span className="bg-[#E1F3FB] text-[#54656F] text-[11px] font-bold px-4 py-1.5 rounded-lg shadow-sm uppercase tracking-tight backdrop-blur-md bg-opacity-90 border border-white/50 pointer-events-auto">
              {getDayLabel(date, currentLang)}
            </span>
          </div>

          {/* MENSAJES DEL DÍA */}
          <div className="space-y-4">
            {msgs.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] md:max-w-[70%] p-3 md:p-4 rounded-2xl shadow-sm border ${
                    isMe ? "bg-[#1351AA] text-white border-[#1351AA] rounded-tr-none" 
                         : "bg-white text-gray-800 border-gray-100 rounded-tl-none"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <span className={`text-[9px] mt-2 block font-medium ${isMe ? "text-blue-100 text-right" : "text-gray-400 text-left"}`}>
                      {dayjs(msg.timestamp).format('HH:mm')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div ref={bottomRef} className="h-2" />
    </div>
  );
}

// Función auxiliar fuera del componente para limpieza
const getDayLabel = (dateStr: string, lang: string) => {
  const date = dayjs(dateStr).locale(lang);
  if (date.isToday()) return lang === 'es' ? 'Hoy' : 'Today';
  if (date.isYesterday()) return lang === 'es' ? 'Ayer' : 'Yesterday';
  
  const format = lang === 'es' ? 'D [de] MMMM' : 'MMMM D';
  return date.isSame(dayjs(), 'year') ? date.format(format) : date.format(`${format}, YYYY`);
};