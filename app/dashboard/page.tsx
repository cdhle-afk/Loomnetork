'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { FiberBackground } from '@/components/design-system/FiberBackground';
import { GlassPanel } from '@/components/design-system/GlassPanel';
import { WeaveButton } from '@/components/design-system/WeaveButton';
import { supabase, SocialPlatform, NetworkAnalytics } from '@/lib/supabase';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Heart,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Plus,
  Check,
  X,
  ExternalLink,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

const PLATFORM_INFO = {
  linkedin: { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  twitter: { name: 'Twitter', icon: Twitter, color: 'text-sky-500', bgColor: 'bg-sky-500/10' },
  instagram: { name: 'Instagram', icon: Instagram, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  facebook: { name: 'Facebook', icon: Facebook, color: 'text-blue-600', bgColor: 'bg-blue-600/10' },
  youtube: { name: 'YouTube', icon: Youtube, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  tiktok: { name: 'TikTok', icon: FileText, color: 'text-slate-400', bgColor: 'bg-slate-500/10' },
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [analytics, setAnalytics] = useState<NetworkAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddPlatform, setShowAddPlatform] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPlatforms(),
      fetchAnalytics(),
      updateAnalytics()
    ]);
    setLoading(false);
  };

  const fetchPlatforms = async () => {
    const { data } = await supabase
      .from('social_platforms')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: true });

    if (data) setPlatforms(data);
  };

  const fetchAnalytics = async () => {
    const { data } = await supabase
      .from('network_analytics')
      .select('*')
      .eq('user_id', user!.id)
      .eq('date', new Date().toISOString().split('T')[0])
      .maybeSingle();

    if (data) setAnalytics(data);
  };

  const updateAnalytics = async () => {
    if (!user) return;
    await supabase.rpc('update_user_analytics', { p_user_id: user.id });
    await fetchAnalytics();
  };

  const handleAddPlatform = async (platformType: SocialPlatform['platform_type']) => {
    if (!user) return;

    const { error } = await supabase
      .from('social_platforms')
      .insert({
        user_id: user.id,
        platform_type: platformType,
        is_connected: false,
      });

    if (!error) {
      await fetchPlatforms();
      setShowAddPlatform(false);
    }
  };

  const handleRemovePlatform = async (platformId: string) => {
    await supabase
      .from('social_platforms')
      .delete()
      .eq('id', platformId);

    await fetchPlatforms();
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiberBackground />
        <div className="font-mono text-indigo-400 animate-pulse">LOADING_SYSTEM...</div>
      </div>
    );
  }

  const totalFollowers = platforms.reduce((sum, p) => sum + p.followers_count, 0);
  const connectedPlatforms = platforms.filter(p => p.is_connected).length;
  const availablePlatforms = Object.keys(PLATFORM_INFO).filter(
    key => !platforms.some(p => p.platform_type === key)
  );

  return (
    <div className="min-h-screen relative">
      <FiberBackground />
      <Navigation />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter mb-2">Dashboard</h1>
            <p className="text-slate-400 font-mono text-sm">Monitor your network across all platforms</p>
          </div>
          <Link href="/dashboard/publish">
            <WeaveButton>
              <FileText className="w-4 h-4 mr-2 inline" />
              Publish to All
            </WeaveButton>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-indigo-500" />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-extrabold mb-1">{analytics?.total_connections || 0}</div>
            <div className="text-sm text-slate-400">Total Connections</div>
            {analytics && analytics.new_connections > 0 && (
              <div className="text-xs text-green-500 mt-2">+{analytics.new_connections} today</div>
            )}
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-indigo-500" />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-extrabold mb-1">{analytics?.total_posts || 0}</div>
            <div className="text-sm text-slate-400">Total Posts</div>
            {analytics && analytics.new_posts > 0 && (
              <div className="text-xs text-green-500 mt-2">+{analytics.new_posts} today</div>
            )}
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-indigo-500" />
              <BarChart3 className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-3xl font-extrabold mb-1">{analytics?.total_engagement || 0}</div>
            <div className="text-sm text-slate-400">Total Engagement</div>
            <div className="text-xs text-slate-500 mt-2">Likes + Comments</div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-indigo-500" />
              <span className="text-xs font-mono text-slate-500">{connectedPlatforms}/{platforms.length}</span>
            </div>
            <div className="text-3xl font-extrabold mb-1">{totalFollowers.toLocaleString()}</div>
            <div className="text-sm text-slate-400">Total Reach</div>
            <div className="text-xs text-slate-500 mt-2">Across all platforms</div>
          </GlassPanel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <GlassPanel className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Connected Platforms</h2>
                <button
                  onClick={() => setShowAddPlatform(!showAddPlatform)}
                  className="flex items-center gap-2 text-indigo-400 hover:text-white transition-colors text-sm font-mono uppercase"
                >
                  <Plus className="w-4 h-4" />
                  Add Platform
                </button>
              </div>

              {showAddPlatform && availablePlatforms.length > 0 && (
                <div className="mb-6 p-4 bg-white/[0.02] border border-white/10">
                  <p className="text-sm text-slate-400 mb-3 font-mono uppercase tracking-wider">Select Platform</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availablePlatforms.map((key) => {
                      const info = PLATFORM_INFO[key as keyof typeof PLATFORM_INFO];
                      const Icon = info.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => handleAddPlatform(key as SocialPlatform['platform_type'])}
                          className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/10 hover:border-indigo-500/30 transition-all"
                        >
                          <Icon className={`w-5 h-5 ${info.color}`} />
                          <span className="text-sm">{info.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {platforms.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No platforms connected yet</p>
                    <p className="text-sm mt-2">Add platforms to expand your reach</p>
                  </div>
                ) : (
                  platforms.map((platform) => {
                    const info = PLATFORM_INFO[platform.platform_type];
                    const Icon = info.icon;

                    return (
                      <div
                        key={platform.id}
                        className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-lg ${info.bgColor} flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 ${info.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold">{info.name}</h3>
                              {platform.is_connected ? (
                                <span className="flex items-center gap-1 text-xs text-green-500">
                                  <Check className="w-3 h-3" /> Connected
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <X className="w-3 h-3" /> Not Connected
                                </span>
                              )}
                            </div>
                            {platform.platform_username && (
                              <p className="text-sm text-slate-400">@{platform.platform_username}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs font-mono text-slate-500">
                              <span>{platform.followers_count.toLocaleString()} followers</span>
                              <span>{platform.posts_count} posts</span>
                              {platform.engagement_rate > 0 && (
                                <span>{platform.engagement_rate}% engagement</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!platform.is_connected && (
                            <WeaveButton
                              variant="secondary"
                              className="text-xs px-4 py-2"
                              onClick={() => {}}
                            >
                              Connect
                            </WeaveButton>
                          )}
                          <button
                            onClick={() => handleRemovePlatform(platform.id)}
                            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </GlassPanel>
          </div>

          <div className="space-y-6">
            <GlassPanel className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Network Growth</span>
                  <span className="text-sm font-bold text-green-500">+{analytics?.new_connections || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Content Created</span>
                  <span className="text-sm font-bold">{analytics?.new_posts || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Avg Engagement</span>
                  <span className="text-sm font-bold">
                    {analytics && analytics.total_posts > 0
                      ? Math.round(analytics.total_engagement / analytics.total_posts)
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Active Platforms</span>
                  <span className="text-sm font-bold">{connectedPlatforms}</span>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/dashboard/publish" className="block">
                  <button className="w-full text-left p-3 bg-white/[0.02] border border-white/10 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <div>
                        <div className="text-sm font-semibold">Cross-Post Content</div>
                        <div className="text-xs text-slate-500">Publish to all platforms</div>
                      </div>
                    </div>
                  </button>
                </Link>
                <Link href="/feed" className="block">
                  <button className="w-full text-left p-3 bg-white/[0.02] border border-white/10 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <div>
                        <div className="text-sm font-semibold">View Feed</div>
                        <div className="text-xs text-slate-500">See latest updates</div>
                      </div>
                    </div>
                  </button>
                </Link>
                <Link href="/network" className="block">
                  <button className="w-full text-left p-3 bg-white/[0.02] border border-white/10 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-indigo-500" />
                      <div>
                        <div className="text-sm font-semibold">Grow Network</div>
                        <div className="text-xs text-slate-500">Find connections</div>
                      </div>
                    </div>
                  </button>
                </Link>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
