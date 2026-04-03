'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { supabase } from '../../lib/supabase';
import api from '../../lib/api';
import { Profile } from '../../types';
import { Code2, Copy, Play, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [inviteToken, setInviteToken] = useState('');
  const [createdSessionData, setCreatedSessionData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) setProfile(data as Profile);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/sessions/create', { title, language });
      setCreatedSessionData(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create session');
    }
  };

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Extract token if user pasted full URL
    let tokenToUse = inviteToken;
    try {
      if (inviteToken.includes('invite=')) {
         tokenToUse = new URL(inviteToken).searchParams.get('invite') || inviteToken;
      } else if (inviteToken.startsWith('http')) {
         const url = new URL(inviteToken);
         tokenToUse = url.searchParams.get('invite') || url.pathname.split('/').pop() || inviteToken;
      }
    } catch(e) {}

    try {
      const { data } = await api.post('/sessions/join', { inviteToken: tokenToUse });
      router.push(`/session/${data.sessionId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to join session');
    }
  };

  const copyToClipboard = () => {
    if (createdSessionData) {
      navigator.clipboard.writeText(createdSessionData.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f0f0f] text-gray-200">
        <header className="h-16 border-b border-gray-800 bg-[#1a1a1a] flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Code2 className="text-indigo-500" />
            <span className="font-bold text-lg tracking-tight">CodeMentor</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">Signed in as <span className="font-medium text-white">{profile?.full_name}</span></span>
            <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700 uppercase text-xs tracking-wider">{profile?.role}</span>
            <button 
              onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
              className="text-gray-400 hover:text-white transition-colors ml-4"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6 mt-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {profile?.role === 'mentor' ? (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 shadow-xl">
              <h2 className="text-2xl font-semibold mb-6">Create a Mentoring Session</h2>
              {!createdSessionData ? (
                <form onSubmit={handleCreateSession} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Session Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. React Hooks Deep Dive"
                      className="w-full bg-[#0f0f0f] border border-gray-700 rounded-md px-4 py-2 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Primary Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-[#0f0f0f] border border-gray-700 rounded-md px-4 py-2 focus:border-indigo-500 outline-none"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="go">Go</option>
                    </select>
                  </div>
                  <button type="submit" className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors w-full">
                    Generate Invitation Link
                  </button>
                </form>
              ) : (
                <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-6">
                  <h3 className="text-green-400 font-medium flex items-center gap-2 mb-4">
                    <CheckCircle2 size={20} /> Session Created Successfully
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">Share this invite link with your student:</p>
                  <div className="flex items-center gap-2 mb-6">
                    <input 
                      readOnly 
                      value={createdSessionData.inviteLink} 
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-300 outline-none"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-gray-300 transition-colors"
                    >
                      {copied ? <CheckCircle2 size={20} className="text-green-400" /> : <Copy size={20} />}
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => router.push(`/session/${createdSessionData.sessionId}`)} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors">
                      <Play size={16} /> Enter Session Room
                    </button>
                    <button onClick={() => setCreatedSessionData(null)} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-medium transition-colors">
                      Create Another
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 shadow-xl">
              <h2 className="text-2xl font-semibold mb-6">Join a Mentoring Session</h2>
              <p className="text-gray-400 mb-6 max-w-lg">
                Enter the invite link or token provided by your mentor to join the live collaborative workspace.
              </p>
              <form onSubmit={handleJoinSession} className="flex gap-4 max-w-xl text-left">
                <input
                  type="text"
                  required
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  placeholder="Paste invite link or token here"
                  className="flex-1 bg-[#0f0f0f] border border-gray-700 rounded-md px-4 py-3 focus:border-indigo-500 outline-none text-gray-200"
                />
                <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors whitespace-nowrap">
                  Join Room
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
