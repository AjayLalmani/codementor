import { useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { ChatMessage } from '../types';

export function useChat(socket: Socket | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('chat:message', handleMessage);

    return () => {
      socket.off('chat:message', handleMessage);
    };
  }, [socket]);

  const sendMessage = useCallback((sessionId: string, content: string, senderId: string, senderName: string) => {
    if (socket && content.trim()) {
      socket.emit('chat:message', {
        sessionId,
        content,
        senderId,
        senderName
      });
    }
  }, [socket]);

  return { messages, sendMessage, setMessages };
}
