import React from 'react';
import { Textarea, TextareaProps } from "@/components/ui/textarea";

interface IndentableTextareaProps extends TextareaProps {
  onTab?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const IndentableTextarea: React.FC<IndentableTextareaProps> = ({ onTab, ...props }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;

      e.currentTarget.value = e.currentTarget.value.substring(0, start) + '  ' + e.currentTarget.value.substring(end);
      
      // 커서 위치 조정
      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;

      // 변경 이벤트 트리거
      const event = new Event('input', { bubbles: true });
      e.currentTarget.dispatchEvent(event);

      onTab?.(e);
    }
  };

  return <Textarea {...props} onKeyDown={handleKeyDown} />;
};

export default IndentableTextarea;