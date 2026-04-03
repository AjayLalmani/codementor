import React from 'react';
import { LogOut } from 'lucide-react';

interface SessionHeaderProps {
  title: string;
  language: string;
  onLanguageChange?: (lang: string) => void;
  isMentor: boolean;
  onEndSession: () => void;
  onLeaveSession: () => void;
}

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'go'];

export function SessionHeader({ 
  title, 
  language, 
  onLanguageChange, 
  isMentor, 
  onEndSession,
  onLeaveSession
}: SessionHeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 sm:px-6 bg-[#1a1a1a] border-b border-gray-800 text-sm">
      <div className="flex items-center gap-4">
        <h1 className="font-semibold text-gray-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          {title}
        </h1>
        <div className="h-4 w-px bg-gray-700 hidden sm:block"></div>
        <select 
          value={language}
          onChange={(e) => onLanguageChange?.(e.target.value)}
          disabled={!isMentor}
          className="bg-gray-900 border border-gray-700 text-gray-300 rounded px-2 py-1 outline-none text-xs"
        >
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      
      <div>
        {isMentor ? (
          <button 
            onClick={onEndSession}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">End Session</span>
          </button>
        ) : (
          <button 
            onClick={onLeaveSession}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Leave</span>
          </button>
        )}
      </div>
    </header>
  );
}
