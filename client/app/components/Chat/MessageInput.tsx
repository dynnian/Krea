import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  onSend: (text: string) => void;
}

export default function MessageInput({ onSend }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <div className="flex items-center gap-2 bg-[#f8fafc] border border-blue-100 rounded-xl p-2 pr-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder={t('chat.placeholder') || "Escribe un mensaje..."}
        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 outline-none text-gray-800"
      />
      
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className={`p-2.5 rounded-xl transition-all ${
          text.trim()
            ? "bg-[#1351AA] text-white shadow-md active:scale-95 hover:bg-[#0f408a]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        <Send size={18} className="ml-0.5" />
      </button>
    </div>
  );
}