'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FiberInput } from '@/components/design-system/FiberInput';
import { WeaveButton } from '@/components/design-system/WeaveButton';
import { GlassPanel } from '@/components/design-system/GlassPanel';
import { FiberBackground } from '@/components/design-system/FiberBackground';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);

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
              Join The Network
            </span>
            <p className="text-slate-400 max-w-md text-lg">
              Build your professional presence. Connect with industry leaders. Grow your career.
            </p>
          </div>
          <div className="space-y-4 text-sm text-slate-500">
            <p className="font-mono uppercase tracking-widest text-[10px]">What You Get</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                Dynamic Professional Profile
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                Unlimited Connections
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                Content Publishing Platform
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                Career Timeline Builder
              </li>
            </ul>
          </div>
        </div>

        <GlassPanel className="p-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Create Account</h2>
              <p className="text-slate-400 text-sm">Initialize your professional network presence</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <FiberInput
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

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
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <WeaveButton type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating Account...' : 'Sign Up'}
              </WeaveButton>
            </form>

            <div className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-white transition-colors">
                Login
              </Link>
            </div>

            <div className="border-t border-white/5 pt-6">
              <div className="font-mono text-[10px] text-slate-500">
                STATUS: REGISTRATION_READY<br />
                VERSION: 2.0.4_FIBER
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
