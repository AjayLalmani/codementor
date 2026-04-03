import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { SendIcon } from 'lucide-react';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
}

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] border-l border-gray-800">
      <div className="p-4 border-b border-gray-800 bg-[#0f0f0f]">
        <h3 className="font-semibold text-gray-200">Session Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => {
          const isSystem = m.type === 'system';
          const time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          if (isSystem) {
            return (
              <div key={m.id || idx} className="text-center">
                <span className="text-xs italic text-gray-500 bg-gray-900/50 px-2 py-1 rounded-full">
                  {m.content}
                </span>
              </div>
            );
          }

          return (
            <div key={m.id || idx} className="flex flex-col">
              <div className="flex items-baseline space-x-2">
                <span className="text-sm font-medium text-indigo-400">{m.senderName}</span>
                <span className="text-[10px] text-gray-500">{time}</span>
              </div>
              <p className="text-sm text-gray-300 mt-1">{m.content}</p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-gray-800 bg-[#0f0f0f] flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-900 text-gray-200 border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        />
        <button 
          type="submit"
          disabled={!input.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md transition-colors"
        >
          <SendIcon size={16} />
        </button>
      </form>
    </div>
  );
}
