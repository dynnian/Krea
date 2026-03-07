import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'antd';
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react';

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
    <div className="p-6 border-t border-[#8F8E8A]">
      <div className="flex items-center gap-4 bg-[#E3E2DE] rounded-full px-6 py-3 border border-[#8F8E8A]">
        <div className="flex items-center gap-2">
          <button className="text-gray-700">
            <Paperclip size={24} />
          </button>
          <button className="text-gray-700">
            <ImageIcon size={24} />
          </button>
        </div>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('chat.placeholder')}
          variant="borderless"
          className="flex-1 bg-transparent placeholder-[#8F8E8A]"
          onPressEnter={handleSend}
        />
        <button onClick={handleSend} className="text-gray-700">
          <Send size={24} />
        </button>
      </div>
    </div>
  );
}