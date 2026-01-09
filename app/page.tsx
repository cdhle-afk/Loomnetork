'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiberBackground } from '@/components/design-system/FiberBackground';
import { WeaveButton } from '@/components/design-system/WeaveButton';
import { Briefcase, Users, Zap, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/feed');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiberBackground />
        <div className="font-mono text-indigo-400 animate-pulse">LOADING_SYSTEM...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <FiberBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <nav className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-indigo-500" />
            <span className="text-2xl font-extrabold tracking-tighter">THE LOOM</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <WeaveButton variant="secondary">Login</WeaveButton>
            </Link>
            <Link href="/signup">
              <WeaveButton>Sign Up</WeaveButton>
            </Link>
          </div>
        </nav>

        <div className="text-center space-y-12 py-20">
          <div className="space-y-6">
            <span className="font-mono text-xs uppercase tracking-[0.5em] text-indigo-400 block">
              Professional Network Architecture
            </span>
            <h1 className="text-7xl md:text-8xl font-extrabold tracking-tighter leading-none">
              WEAVE YOUR<br />
              CAREER<br />
              <span className="text-indigo-500">NETWORK</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Build meaningful professional connections. Share your expertise.
              Grow your career through high-tension networking.
            </p>
          </div>

          <div className="flex items-center justify-center gap-6">
            <Link href="/signup">
              <WeaveButton className="text-lg px-12 py-6">
                Start Weaving
              </WeaveButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
            <div className="space-y-4 p-8 bg-white/[0.02] border border-white/5">
              <Users className="w-10 h-10 text-indigo-500" />
              <h3 className="text-xl font-bold">Connect</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Build your professional network with meaningful connections across industries
              </p>
            </div>
            <div className="space-y-4 p-8 bg-white/[0.02] border border-white/5">
              <Zap className="w-10 h-10 text-indigo-500" />
              <h3 className="text-xl font-bold">Share</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Publish content, insights, and achievements to your professional network
              </p>
            </div>
            <div className="space-y-4 p-8 bg-white/[0.02] border border-white/5">
              <TrendingUp className="w-10 h-10 text-indigo-500" />
              <h3 className="text-xl font-bold">Grow</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Advance your career through strategic networking and professional visibility
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-32 border-t border-white/5 pt-12 pb-8">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[10px] text-slate-500">
              THE LOOM v2.0.4_FIBER<br />
              Professional Network System
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-indigo-500/50" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
