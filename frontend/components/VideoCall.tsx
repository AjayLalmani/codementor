import React, { useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone } from 'lucide-react';

interface VideoCallProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  isMuted: boolean;
  isVideoOff: boolean;
  hasStarted: boolean;
  remoteConnected: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onStartCall: () => void;
  onEndSession?: () => void;
  isMentor: boolean;
}

export function VideoCall({
  localVideoRef,
  remoteVideoRef,
  isMuted,
  isVideoOff,
  hasStarted,
  remoteConnected,
  onToggleMute,
  onToggleVideo,
  onStartCall,
  onEndSession,
  isMentor
}: VideoCallProps) {
  
  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden border border-gray-800 flex flex-col">
      {!hasStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900">
          <button 
            onClick={onStartCall}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
          >
            <Phone size={18} />
            Join Voice / Video
          </button>
        </div>
      ) : (
        <>
          {/* Remote Video (Large) — PiP lives inside here so it never overlaps controls */}
          <div className="flex-1 relative bg-gray-900 flex items-center justify-center min-h-0">
            {!remoteConnected && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 animate-pulse text-sm z-10 pointer-events-none">
                Waiting for other participant...
              </div>
            )}
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />

            {/* Local Video PiP — anchored inside remote video area, above controls */}
            <div className="absolute bottom-2 right-2 w-24 h-20 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg z-20">
              {!isVideoOff ? (
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <VideoOff size={16} />
                </div>
              )}
            </div>
          </div>

          {/* Controls — always visible, never overlapped */}
          <div className="flex-shrink-0 h-14 bg-[#111] flex items-center justify-center gap-3 px-2 z-10">
            <button 
              onClick={onToggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              className={`p-2.5 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'}`}
            >
              {isMuted ? <MicOff size={17} /> : <Mic size={17} />}
            </button>
            <button 
              onClick={onToggleVideo}
              title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
              className={`p-2.5 rounded-full transition-colors ${isVideoOff ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'}`}
            >
              {isVideoOff ? <VideoOff size={17} /> : <Video size={17} />}
            </button>
            {isMentor && onEndSession && (
              <button 
                onClick={onEndSession}
                title="End session for everyone"
                className="p-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg ml-2"
              >
                <PhoneOff size={17} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

