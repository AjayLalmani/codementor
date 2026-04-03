'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { SessionHeader } from '../../../components/SessionHeader';
import { CodeEditor } from '../../../components/Editor';
import { ChatPanel } from '../../../components/ChatPanel';
import { VideoCall } from '../../../components/VideoCall';

import { useSocket } from '../../../hooks/useSocket';
import { useEditor } from '../../../hooks/useEditor';
import { useChat } from '../../../hooks/useChat';
import { useWebRTC } from '../../../hooks/useWebRTC';

import { supabase } from '../../../lib/supabase';
import api from '../../../lib/api';

export default function SessionRoom() {
  const { sessionId } = useParams() as { sessionId: string };
  const router = useRouter();

  const [sessionData, setSessionData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { socket, isConnected } = useSocket();
  const { code, language, handleEditorChange, handleLanguageChange } = useEditor(socket, sessionId, 'javascript');
  const { messages, sendMessage } = useChat(socket);
  
  const isMentor = profile?.role === 'mentor';
  const {
    localVideoRef,
    remoteVideoRef,
    initializeWebRTC,
    hasVideo,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    remoteConnected,
    stopTracks
  } = useWebRTC(socket, sessionId, isMentor);

  useEffect(() => {
    async function initSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const { data: pData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (pData) setProfile(pData);

        const { data: sData } = await api.get(`/sessions/${sessionId}`);
        if (sData.status === 'ended') {
          alert('Session has already ended');
          router.push('/dashboard');
          return;
        }
        setSessionData(sData);

        if (sData && pData) {
          handleLanguageChange(sData.language, pData.id);
        }
      } catch (err) {
        console.error(err);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, [sessionId, router]);

  useEffect(() => {
    if (isConnected && socket && sessionData && profile) {
      socket.emit('session:join', {
        sessionId,
        userId: profile.id,
        userName: profile.full_name
      });
    }
  }, [isConnected, socket, sessionData, profile, sessionId]);

  useEffect(() => {
    if (!socket) return;
    
    const handleEnded = () => {
      alert('Session was ended by the mentor.');
      router.push('/dashboard');
    };

    socket.on('session:ended', handleEnded);
    return () => { socket.off('session:ended', handleEnded); };
  }, [socket, router]);

  useEffect(() => {
    // Unmount cleanup
    return () => {
      stopTracks();
    };
  }, []);

  const handleEndSession = async () => {
    if (!isMentor) return;
    try {
      await api.patch(`/sessions/${sessionId}/end`);
      socket?.emit('session:end', { sessionId });
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLeaveSession = () => {
    router.push('/dashboard');
  };

  const onStartVideo = () => {
    initializeWebRTC();
  };

  if (loading || !sessionData || !profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-[#0f0f0f] text-gray-200 overflow-hidden">
        {!isConnected && (
          <div className="absolute top-0 left-0 w-full bg-yellow-600 text-white text-xs py-1 text-center z-50">
            Reconnecting to server...
          </div>
        )}
        <SessionHeader 
          title={sessionData.title}
          language={language}
          onLanguageChange={(lang) => handleLanguageChange(lang, profile.id)}
          isMentor={isMentor}
          onEndSession={handleEndSession}
          onLeaveSession={handleLeaveSession}
        />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main Editor */}
          <main className="flex-1 border-r border-gray-800 p-2 overflow-hidden">
            <CodeEditor 
              code={code}
              language={language}
              readOnly={false}
              onChange={(val) => handleEditorChange(val, profile.id)}
            />
          </main>
          
          {/* Right Sidebar (Chat + Video) */}
          <aside className="w-80 flex flex-col bg-[#1a1a1a]">
            {/* Video Call Block */}
            <div className="h-64 border-b border-gray-800 p-2">
              <VideoCall 
                localVideoRef={localVideoRef}
                remoteVideoRef={remoteVideoRef}
                isMuted={isMuted}
                isVideoOff={isVideoOff}
                hasStarted={hasVideo}
                remoteConnected={remoteConnected}
                onToggleMute={toggleMute}
                onToggleVideo={toggleVideo}
                onStartCall={onStartVideo}
                isMentor={isMentor}
                onEndSession={handleEndSession}
              />
            </div>

            {/* Chat Panel */}
            <div className="flex-1 overflow-hidden">
               <ChatPanel 
                 messages={messages}
                 onSendMessage={(content) => sendMessage(sessionId, content, profile.id, profile.full_name)}
               />
            </div>
          </aside>
        </div>
      </div>
    </ProtectedRoute>
  );
}
