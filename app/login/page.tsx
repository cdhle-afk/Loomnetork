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
  const { signIn } = useAuth();

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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <FiberBackground />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        <div className="flex flex-col justify-center space-y-8">
          <div className="flex items-center gap-3">
            <Briefcase className="w-10 h-10 text-indigo-500" />
            <div>
              <h1 className="text-6xl font-extrabold tracking-tighter leading-none">THE<br />LOOM</h1>
            </div>
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
