'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { FiberBackground } from '@/components/design-system/FiberBackground';
import { GlassPanel } from '@/components/design-system/GlassPanel';
import { WeaveButton } from '@/components/design-system/WeaveButton';
import { FiberTextarea } from '@/components/design-system/FiberTextarea';
import { supabase, SocialPlatform } from '@/lib/supabase';
import {
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  FileText,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const PLATFORM_INFO = {
  linkedin: { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-500', limit: 3000 },
  twitter: { name: 'Twitter', icon: Twitter, color: 'text-sky-500', limit: 280 },
  instagram: { name: 'Instagram', icon: Instagram, color: 'text-pink-500', limit: 2200 },
  facebook: { name: 'Facebook', icon: Facebook, color: 'text-blue-600', limit: 63206 },
  youtube: { name: 'YouTube', icon: Youtube, color: 'text-red-500', limit: 5000 },
  tiktok: { name: 'TikTok', icon: FileText, color: 'text-slate-400', limit: 2200 },
};

export default function PublishPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchPlatforms();
    }
  }, [user]);

  const fetchPlatforms = async () => {
    const { data } = await supabase
      .from('social_platforms')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: true });

    if (data) {
      setPlatforms(data);
      setSelectedPlatforms(data.filter(p => p.is_connected).map(p => p.platform_type));
    }
  };

  const togglePlatform = (platformType: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformType)
        ? prev.filter(p => p !== platformType)
        : [...prev, platformType]
    );
  };

  const handlePublish = async () => {
    if (!user || !content.trim() || selectedPlatforms.length === 0) return;

    setPublishing(true);
    setErrors({});

    const { data: crossPost, error: postError } = await supabase
      .from('cross_platform_posts')
      .insert({
        user_id: user.id,
        content,
        platforms: selectedPlatforms,
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (postError) {
      setErrors({ general: 'Failed to create post' });
      setPublishing(false);
      return;
    }

    const { error: loomPostError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content,
      });

    const platformResults = await Promise.all(
      selectedPlatforms.map(async (platformType) => {
        const platform = platforms.find(p => p.platform_type === platformType);

        if (!platform?.is_connected) {
          await supabase.from('platform_post_results').insert({
            cross_platform_post_id: crossPost.id,
            platform_type: platformType,
            status: 'failed',
            error_message: 'Platform not connected',
          });
          return { platform: platformType, success: false, error: 'Not connected' };
        }

        await supabase.from('platform_post_results').insert({
          cross_platform_post_id: crossPost.id,
          platform_type: platformType,
          status: 'success',
          platform_post_url: `https://${platformType}.com/post/demo`,
        });

        return { platform: platformType, success: true };
      })
    );

    const failedPosts = platformResults.filter(r => !r.success);
    if (failedPosts.length > 0) {
      const errorMap: Record<string, string> = {};
      failedPosts.forEach(fp => {
        errorMap[fp.platform] = fp.error || 'Failed to publish';
      });
      setErrors(errorMap);
    }

    setPublishing(false);
    setPublished(true);

    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiberBackground />
        <div className="font-mono text-indigo-400 animate-pulse">LOADING_SYSTEM...</div>
      </div>
    );
  }

  const connectedPlatforms = platforms.filter(p => p.is_connected);
  const minCharLimit = Math.min(
    ...selectedPlatforms
      .map(p => PLATFORM_INFO[p as keyof typeof PLATFORM_INFO]?.limit || 280)
  );

  return (
    <div className="min-h-screen relative">
      <FiberBackground />
      <Navigation />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-12">
        <div className="mb-8">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-mono text-sm uppercase">Back to Dashboard</span>
            </button>
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tighter mb-2">Cross-Platform Publisher</h1>
          <p className="text-slate-400 font-mono text-sm">Create once, publish everywhere</p>
        </div>

        {published ? (
          <GlassPanel className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Published Successfully!</h2>
            <p className="text-slate-400 mb-4">
              Your content has been published to {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}
            </p>
            <div className="text-sm text-slate-500 font-mono">Redirecting to dashboard...</div>
          </GlassPanel>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <GlassPanel className="p-8">
                <div className="mb-6">
                  <label className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-3 block">
                    Content
                  </label>
                  <FiberTextarea
                    placeholder="What do you want to share with your network?"
                    rows={10}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={publishing}
                  />
                  <div className="flex justify-between items-center mt-2 text-xs font-mono">
                    <span className="text-slate-500">
                      {content.length} / {selectedPlatforms.length > 0 ? minCharLimit : '∞'} characters
                    </span>
                    {selectedPlatforms.length > 0 && content.length > minCharLimit && (
                      <span className="text-red-400">Content exceeds platform limit</span>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-3 block">
                    Select Platforms ({selectedPlatforms.length} selected)
                  </label>

                  {connectedPlatforms.length === 0 ? (
                    <div className="p-6 text-center bg-white/[0.02] border border-white/10">
                      <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400 mb-4">No platforms connected</p>
                      <Link href="/dashboard">
                        <WeaveButton variant="secondary">
                          Connect Platforms
                        </WeaveButton>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {connectedPlatforms.map((platform) => {
                        const info = PLATFORM_INFO[platform.platform_type];
                        const Icon = info.icon;
                        const isSelected = selectedPlatforms.includes(platform.platform_type);

                        return (
                          <button
                            key={platform.id}
                            onClick={() => togglePlatform(platform.platform_type)}
                            disabled={publishing}
                            className={`flex items-center gap-3 p-4 border transition-all ${
                              isSelected
                                ? 'bg-indigo-500/10 border-indigo-500/50'
                                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                            } ${publishing ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Icon className={`w-6 h-6 ${info.color}`} />
                            <div className="flex-1 text-left">
                              <div className="font-semibold text-sm">{info.name}</div>
                              <div className="text-xs text-slate-500">
                                {platform.followers_count.toLocaleString()} followers
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {Object.keys(errors).length > 0 && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm font-semibold mb-2">Publishing Issues:</p>
                    {Object.entries(errors).map(([platform, error]) => (
                      <p key={platform} className="text-red-400 text-xs">
                        • {platform}: {error}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  <WeaveButton
                    onClick={handlePublish}
                    disabled={
                      publishing ||
                      !content.trim() ||
                      selectedPlatforms.length === 0 ||
                      content.length > minCharLimit
                    }
                    className="flex-1"
                  >
                    {publishing ? (
                      <>
                        <span className="animate-pulse">Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2 inline" />
                        Publish to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </WeaveButton>
                </div>
              </GlassPanel>
            </div>

            <div className="space-y-6">
              <GlassPanel className="p-6">
                <h3 className="font-bold mb-4">Publishing Tips</h3>
                <div className="space-y-3 text-sm text-slate-400">
                  <div className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>Keep content concise for Twitter (280 chars)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>Use hashtags strategically</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>Tag relevant connections</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>Post during peak hours</span>
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel className="p-6">
                <h3 className="font-bold mb-4">Character Limits</h3>
                <div className="space-y-3">
                  {selectedPlatforms.map(pt => {
                    const info = PLATFORM_INFO[pt as keyof typeof PLATFORM_INFO];
                    const Icon = info.icon;
                    return (
                      <div key={pt} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${info.color}`} />
                          <span>{info.name}</span>
                        </div>
                        <span className="font-mono text-xs text-slate-500">{info.limit}</span>
                      </div>
                    );
                  })}
                </div>
              </GlassPanel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
