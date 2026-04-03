import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import throttle from 'lodash/throttle';

export function useEditor(socket: Socket | null, sessionId: string, defaultLang: string) {
  const [code, setCode] = useState('// Write your code here');
  const [language, setLanguage] = useState(defaultLang);
  const isRemoteChangeRef = useRef(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('editor:update', (data: { code: string; language: string; userId: string }) => {
      isRemoteChangeRef.current = true;
      setCode(data.code);
      setLanguage(data.language);
      
      // Reset after a short delay so local changes can be tracked again
      setTimeout(() => {
        isRemoteChangeRef.current = false;
      }, 50);
    });

    return () => {
      socket.off('editor:update');
    };
  }, [socket]);

  // Throttled emitter to prevent flooding
  const emitChange = useCallback(
    throttle((newCode: string, lang: string, userId: string) => {
      if (socket) {
        socket.emit('editor:change', {
          sessionId,
          code: newCode,
          language: lang,
          userId,
        });
      }
    }, 50),
    [socket, sessionId]
  );

  const handleEditorChange = (value: string | undefined, userId: string) => {
    const newVal = value || '';
    if (!isRemoteChangeRef.current) {
      setCode(newVal);
      emitChange(newVal, language, userId);
    }
  };

  const handleLanguageChange = (lang: string, userId: string) => {
    setLanguage(lang);
    if (!isRemoteChangeRef.current) {
      emitChange(code, lang, userId);
    }
  };

  return { code, language, handleEditorChange, handleLanguageChange, setCode, setLanguage };
}
