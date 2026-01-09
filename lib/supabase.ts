import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  headline: string;
  bio: string;
  location: string;
  avatar_url: string;
  cover_image_url: string;
  website: string;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  likes?: Like[];
  comments?: Comment[];
  _count?: {
    likes: number;
    comments: number;
  };
};

export type Connection = {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
};

export type Like = {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
};

export type Comment = {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type Experience = {
  id: string;
  user_id: string;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
  description: string;
  created_at: string;
};

export type Education = {
  id: string;
  user_id: string;
  school: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
  description: string;
  created_at: string;
};

export type Skill = {
  id: string;
  user_id: string;
  skill_name: string;
  created_at: string;
};

export type SocialPlatform = {
  id: string;
  user_id: string;
  platform_type: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'youtube';
  platform_username: string;
  is_connected: boolean;
  access_token: string;
  refresh_token: string;
  token_expires_at: string | null;
  followers_count: number;
  following_count: number;
  posts_count: number;
  engagement_rate: number;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CrossPlatformPost = {
  id: string;
  user_id: string;
  loom_post_id: string | null;
  content: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PlatformPostResult = {
  id: string;
  cross_platform_post_id: string;
  platform_type: string;
  status: 'success' | 'failed' | 'pending';
  platform_post_id: string;
  platform_post_url: string;
  error_message: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
};

export type NetworkAnalytics = {
  id: string;
  user_id: string;
  date: string;
  total_connections: number;
  new_connections: number;
  total_posts: number;
  new_posts: number;
  total_engagement: number;
  profile_views: number;
  created_at: string;
};
