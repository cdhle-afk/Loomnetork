'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FiberInput } from '@/components/design-system/FiberInput';
import { WeaveButton } from '@/components/design-system/WeaveButton';
import { GlassPanel } from '@/components/design-system/GlassPanel';
import { FiberBackground } from '@/components/design-system/FiberBackground';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <FiberBackground />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        <div className="flex flex-col justify-center space-y-8">
          <div className="flex flex-col items-start">
            <Briefcase className="w-12 h-12 text-indigo-500 mb-4" />
            <h1 className="text-6xl font-extrabold tracking-tighter leading-none">THE<br />LOOM</h1>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.5em] text-indigo-400">
              Professional Network
            </span>
            <p className="text-slate-400 max-w-md text-lg">
              Weaving professional connections into high-tension networks for career growth.
            </p>
          </div>
          <div className="space-y-4 text-sm text-slate-500">
            <p className="font-mono uppercase tracking-widest text-[10px]">System Features</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                Professional Profile Architecture
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                Connection Network Topology
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                Content Distribution System
              </li>
            </ul>
          </div>
        </div>

        <GlassPanel className="p-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Access Network</h2>
              <p className="text-slate-400 text-sm">Enter your credentials to connect to the system</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <FiberInput
                label="Email Address"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <FiberInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <WeaveButton type="submit" disabled={loading} className="w-full">
                {loading ? 'Connecting...' : 'Login'}
              </WeaveButton>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[rgba(15,18,25,0.7)] px-2 text-slate-500 font-mono">Or continue with</span>
              </div>
            </div>

            <WeaveButton
              type="button"
              variant="secondary"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full"
            >
              <svg className="w-5 h-5 mr-2 inline" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </WeaveButton>

            <div className="text-center text-sm text-slate-400">
              Not registered yet?{' '}
              <Link href="/signup" className="text-indigo-400 hover:text-white transition-colors">
                Create Account
              </Link>
            </div>

            <div className="border-t border-white/5 pt-6">
              <div className="font-mono text-[10px] text-slate-500">
                STATUS: AUTH_READY<br />
                VERSION: 2.0.4_FIBER
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
