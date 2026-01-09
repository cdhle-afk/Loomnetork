'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { FiberBackground } from '@/components/design-system/FiberBackground';
import { GlassPanel } from '@/components/design-system/GlassPanel';
import { FiberInput } from '@/components/design-system/FiberInput';
import { supabase, Profile, Connection } from '@/lib/supabase';
import { Users, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

type ProfileWithConnection = Profile & {
  connection_status?: 'connected' | 'none';
};

export default function NetworkPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [connections, setConnections] = useState<Profile[]>([]);
  const [suggestions, setSuggestions] = useState<ProfileWithConnection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchConnections();
      fetchSuggestions();
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('connections')
      .select(`
        connected_user_id,
        profiles:connected_user_id (
          id,
          full_name,
          headline,
          avatar_url,
          location
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (data) {
      const connectedProfiles = data
        .map((c: any) => c.profiles)
        .filter(Boolean);
      setConnections(connectedProfiles);
    }
    setLoading(false);
  };

  const fetchSuggestions = async () => {
    if (!user) return;

    const { data: connectedIds } = await supabase
      .from('connections')
      .select('connected_user_id')
      .eq('user_id', user.id);

    const excludeIds = [user.id, ...(connectedIds?.map((c: any) => c.connected_user_id) || [])];

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(6);

    if (data) {
      setSuggestions(data.map((p) => ({ ...p, connection_status: 'none' as const })));
    }
  };

  const filteredConnections = connections.filter((profile) =>
    profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.headline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading || !user) {
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
      <Navigation />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tighter mb-2">Network</h1>
          <p className="text-slate-400 font-mono text-sm">
            {connections.length} connections
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <GlassPanel className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Users className="w-6 h-6 text-indigo-500" />
                Your Connections
              </h2>

              <div className="mb-6">
                <FiberInput
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                {filteredConnections.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    {searchQuery ? 'No connections match your search' : 'No connections yet'}
                  </div>
                ) : (
                  filteredConnections.map((profile) => (
                    <Link
                      key={profile.id}
                      href={`/profile/${profile.id}`}
                      className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all group"
                    >
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name}
                          className="w-16 h-16 rounded-full border border-white/10"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                          <span className="text-indigo-400 font-bold text-xl">
                            {profile.full_name[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg group-hover:text-indigo-400 transition-colors">
                          {profile.full_name}
                        </h3>
                        {profile.headline && (
                          <p className="text-slate-400 text-sm">{profile.headline}</p>
                        )}
                        {profile.location && (
                          <p className="text-slate-500 text-xs font-mono mt-1">
                            {profile.location}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </GlassPanel>
          </div>

          <div className="lg:col-span-1">
            <GlassPanel className="p-6">
              <h3 className="font-bold text-lg mb-6">People You May Know</h3>
              <div className="space-y-4">
                {suggestions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No suggestions available
                  </div>
                ) : (
                  suggestions.map((profile) => (
                    <Link
                      key={profile.id}
                      href={`/profile/${profile.id}`}
                      className="block p-3 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.full_name}
                            className="w-12 h-12 rounded-full border border-white/10"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                            <span className="text-indigo-400 text-sm font-bold">
                              {profile.full_name[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {profile.full_name}
                          </p>
                          {profile.headline && (
                            <p className="text-xs text-slate-400 truncate">
                              {profile.headline}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
