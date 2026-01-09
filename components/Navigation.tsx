'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Briefcase, Home, Users, User, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Navigation() {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const links = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/network', icon: Users, label: 'Network' },
    { href: `/profile/${user.id}`, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(15,18,25,0.7)] backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/feed" className="flex items-center gap-3 group">
            <Briefcase className="w-6 h-6 text-indigo-500 group-hover:text-white transition-colors" />
            <span className="text-xl font-extrabold tracking-tighter">THE LOOM</span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all",
                    isActive
                      ? "text-white bg-white/5 border-b-2 border-indigo-500"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {profile && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">{profile.full_name}</div>
                  <div className="text-xs text-slate-400 font-mono">{profile.headline || 'Professional'}</div>
                </div>
                {profile.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-8 h-8 rounded-full border border-white/10"
                  />
                )}
              </div>
            )}
            <button
              onClick={signOut}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
