'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { FiberBackground } from '@/components/design-system/FiberBackground';
import { GlassPanel } from '@/components/design-system/GlassPanel';
import { FiberTextarea } from '@/components/design-system/FiberTextarea';
import { WeaveButton } from '@/components/design-system/WeaveButton';
import { supabase, Post } from '@/lib/supabase';
import { PostCard } from '@/components/PostCard';
import { Loader2 } from 'lucide-react';

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          id,
          full_name,
          headline,
          avatar_url
        ),
        likes (count),
        comments (count)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data as any);
    }
    setLoading(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user) return;

    setPosting(true);
    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: newPostContent,
      });

    if (!error) {
      setNewPostContent('');
      await fetchPosts();
    }
    setPosting(false);
  };

  if (authLoading || !user) {
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

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tighter mb-2">Feed</h1>
          <p className="text-slate-400 font-mono text-sm">Latest updates from your network</p>
        </div>

        <GlassPanel className="p-8 mb-8">
          <form onSubmit={handleCreatePost} className="space-y-6">
            <FiberTextarea
              label="Share an update"
              placeholder="What's on your mind? Share your professional insights..."
              rows={4}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              disabled={posting}
            />
            <div className="flex justify-end">
              <WeaveButton type="submit" disabled={posting || !newPostContent.trim()}>
                {posting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                    Publishing...
                  </>
                ) : (
                  'Post'
                )}
              </WeaveButton>
            </div>
          </form>
        </GlassPanel>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 font-mono text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">No posts yet. Be the first to share!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
