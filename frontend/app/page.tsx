'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { Code2, Video, MessageSquare } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] text-center px-4">
      <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0f0f0f] to-[#0f0f0f] -z-10"></div>
      
      <div className="mb-8 p-4 bg-indigo-500/10 rounded-full inline-block">
        <Code2 size={48} className="text-indigo-500" />
      </div>

      <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-6 tracking-tight">
        CodeMentor
      </h1>
      
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12">
        Experience seamless 1-on-1 collaborative coding with integrated WebRTC video calling, real-time code synchronization, and live chat.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link href="/login" className="px-8 py-3 rounded-lg font-medium bg-gray-800 hover:bg-gray-700 text-white transition-colors border border-gray-700 w-full sm:w-auto text-center">
          Sign In
        </Link>
        <Link href="/signup" className="px-8 py-3 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] w-full sm:w-auto text-center">
          Get Started
        </Link>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl text-left">
        <div className="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-xl">
          <Code2 className="text-indigo-400 mb-4" size={24} />
          <h3 className="text-lg font-semibold mb-2">Real-time Editor</h3>
          <p className="text-gray-400 text-sm">Write code together in sync with zero latency using Monaco Editor.</p>
        </div>
        <div className="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-xl">
          <Video className="text-cyan-400 mb-4" size={24} />
          <h3 className="text-lg font-semibold mb-2">Integrated Video</h3>
          <p className="text-gray-400 text-sm">See and hear your partner clearly with built-in P2P WebRTC.</p>
        </div>
        <div className="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-xl">
          <MessageSquare className="text-purple-400 mb-4" size={24} />
          <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
          <p className="text-gray-400 text-sm">Communicate seamlessly without leaving your coding environment.</p>
        </div>
      </div>
    </div>
  );
}
