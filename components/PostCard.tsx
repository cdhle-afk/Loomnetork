'use client';

import { useState } from 'react';
import { GlassPanel } from '@/components/design-system/GlassPanel';
import { supabase, Post } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { FiberInput } from './design-system/FiberInput';
import { WeaveButton } from './design-system/WeaveButton';

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [likesCount, setLikesCount] = useState((post.likes as any)?.length || 0);
  const [commentsCount, setCommentsCount] = useState((post.comments as any)?.length || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const profile = post.profiles as any;

  useState(() => {
    checkIfLiked();
  });

  const checkIfLiked = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_id', user.id)
      .maybeSingle();
    setIsLiked(!!data);
  };

  const handleLike = async () => {
    if (!user) return;

    if (isLiked) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id);
      setLikesCount((prev: number) => prev - 1);
      setIsLiked(false);
    } else {
      await supabase
        .from('likes')
        .insert({ post_id: post.id, user_id: user.id });
      setLikesCount((prev: number) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleDelete = async () => {
    if (!user || post.user_id !== user.id) return;
    if (!confirm('Delete this post?')) return;

    await supabase.from('posts').delete().eq('id', post.id);
    onUpdate();
  };

  const loadComments = async () => {
    if (comments.length > 0) return;
    setLoadingComments(true);
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (data) {
      setComments(data);
    }
    setLoadingComments(false);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    await supabase.from('comments').insert({
      post_id: post.id,
      user_id: user.id,
      content: commentText,
    });

    setCommentText('');
    setCommentsCount((prev: number) => prev + 1);
    setComments([]);
    await loadComments();
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      loadComments();
    }
  };

  return (
    <GlassPanel className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Link href={`/profile/${profile?.id}`} className="flex items-center gap-3 group">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-12 h-12 rounded-full border border-white/10"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <span className="text-indigo-400 font-bold text-lg">
                  {profile?.full_name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <div>
              <div className="font-semibold group-hover:text-indigo-400 transition-colors">
                {profile?.full_name || 'Unknown User'}
              </div>
              {profile?.headline && (
                <div className="text-sm text-slate-400">{profile.headline}</div>
              )}
              <div className="text-xs text-slate-500 font-mono">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
          </Link>
          {user?.id === post.user_id && (
            <button
              onClick={handleDelete}
              className="text-slate-500 hover:text-red-400 transition-colors p-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        <div className="flex items-center gap-6 pt-4 border-t border-white/5">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${
              isLiked ? 'text-red-400' : 'text-slate-400 hover:text-red-400'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-mono">{likesCount}</span>
          </button>
          <button
            onClick={toggleComments}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-mono">{commentsCount}</span>
          </button>
        </div>

        {showComments && (
          <div className="pt-4 border-t border-white/5 space-y-4">
            <form onSubmit={handleComment} className="flex gap-3">
              <FiberInput
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1"
              />
              <WeaveButton type="submit" disabled={!commentText.trim()}>
                Comment
              </WeaveButton>
            </form>

            <div className="space-y-3">
              {loadingComments ? (
                <div className="text-sm text-slate-500 font-mono">Loading comments...</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 bg-white/[0.02] p-3 border border-white/5">
                    {(comment.profiles as any)?.avatar_url ? (
                      <img
                        src={(comment.profiles as any).avatar_url}
                        alt={(comment.profiles as any).full_name}
                        className="w-8 h-8 rounded-full border border-white/10"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-400 text-xs">
                          {(comment.profiles as any)?.full_name?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm">
                          {(comment.profiles as any)?.full_name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
