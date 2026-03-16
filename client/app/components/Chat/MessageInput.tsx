import React, { useState } from 'react';
import { Input, Button, Space } from 'antd';
import { Send } from 'lucide-react';
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
    <div className="p-6 border-t border-[#8F8E8A]">
      <Space.Compact className="w-full bg-[#E3E2DE] rounded-full px-6 py-3 border border-[#8F8E8A]">
        
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('chat.placeholder')}
          variant="borderless"
          className="flex-1 bg-transparent placeholder-[#8F8E8A]"
          onPressEnter={handleSend}
        />
        <Button
          type="text"
          icon={<Send size={24} />}
          onClick={handleSend}
          className="text-gray-700"
        />
      </Space.Compact>
    </div>
  );
}