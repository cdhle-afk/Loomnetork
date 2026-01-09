/*
  # Social Platform Integration & Analytics

  ## Overview
  Database schema for tracking user connections to external social media platforms,
  storing platform credentials, tracking analytics, and enabling cross-platform posting.

  ## New Tables

  ### 1. social_platforms
  Connected social media platforms for each user
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `platform_type` (text) - 'linkedin', 'twitter', 'instagram', 'facebook', 'tiktok'
  - `platform_username` (text) - Username on that platform
  - `is_connected` (boolean) - Whether platform is currently connected
  - `access_token` (text, encrypted) - OAuth token for posting
  - `refresh_token` (text, encrypted) - OAuth refresh token
  - `token_expires_at` (timestamptz) - When the token expires
  - `followers_count` (integer) - Number of followers on that platform
  - `following_count` (integer) - Number following on that platform
  - `posts_count` (integer) - Total posts on that platform
  - `engagement_rate` (numeric) - Average engagement rate
  - `last_synced_at` (timestamptz) - Last time data was synced
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. cross_platform_posts
  Posts that were published to multiple platforms
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `loom_post_id` (uuid, references posts, nullable)
  - `content` (text) - The content of the post
  - `platforms` (text[]) - Array of platforms it was posted to
  - `status` (text) - 'draft', 'scheduled', 'published', 'failed'
  - `scheduled_for` (timestamptz, nullable) - When to publish
  - `published_at` (timestamptz, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. platform_post_results
  Results of posting to individual platforms
  - `id` (uuid, primary key)
  - `cross_platform_post_id` (uuid, references cross_platform_posts)
  - `platform_type` (text)
  - `status` (text) - 'success', 'failed', 'pending'
  - `platform_post_id` (text) - ID from the external platform
  - `platform_post_url` (text) - URL to the post on that platform
  - `error_message` (text, nullable)
  - `likes_count` (integer, default 0)
  - `comments_count` (integer, default 0)
  - `shares_count` (integer, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. network_analytics
  Daily snapshots of network metrics
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `date` (date)
  - `total_connections` (integer) - Total connections on The Loom
  - `new_connections` (integer) - New connections today
  - `total_posts` (integer) - Total posts
  - `new_posts` (integer) - New posts today
  - `total_engagement` (integer) - Total likes + comments
  - `profile_views` (integer)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only view and manage their own platform connections
  - Analytics data is user-specific
  - Access tokens are stored but not exposed through queries

  ## Important Notes
  1. Access tokens should be encrypted at rest
  2. Platform data synced periodically via background jobs
  3. Cross-platform posting requires OAuth setup for each platform
*/

-- Create social_platforms table
CREATE TABLE IF NOT EXISTS social_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform_type text NOT NULL CHECK (platform_type IN ('linkedin', 'twitter', 'instagram', 'facebook', 'tiktok', 'youtube')),
  platform_username text DEFAULT '',
  is_connected boolean DEFAULT true,
  access_token text DEFAULT '',
  refresh_token text DEFAULT '',
  token_expires_at timestamptz,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  posts_count integer DEFAULT 0,
  engagement_rate numeric(5,2) DEFAULT 0,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform_type)
);

ALTER TABLE social_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own platforms"
  ON social_platforms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own platforms"
  ON social_platforms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own platforms"
  ON social_platforms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own platforms"
  ON social_platforms FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create cross_platform_posts table
CREATE TABLE IF NOT EXISTS cross_platform_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  loom_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  content text NOT NULL,
  platforms text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  scheduled_for timestamptz,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cross_platform_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cross-platform posts"
  ON cross_platform_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create cross-platform posts"
  ON cross_platform_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cross-platform posts"
  ON cross_platform_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cross-platform posts"
  ON cross_platform_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create platform_post_results table
CREATE TABLE IF NOT EXISTS platform_post_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cross_platform_post_id uuid NOT NULL REFERENCES cross_platform_posts(id) ON DELETE CASCADE,
  platform_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('success', 'failed', 'pending')),
  platform_post_id text DEFAULT '',
  platform_post_url text DEFAULT '',
  error_message text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE platform_post_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view results for their posts"
  ON platform_post_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cross_platform_posts
      WHERE cross_platform_posts.id = platform_post_results.cross_platform_post_id
      AND cross_platform_posts.user_id = auth.uid()
    )
  );

-- Create network_analytics table
CREATE TABLE IF NOT EXISTS network_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_connections integer DEFAULT 0,
  new_connections integer DEFAULT 0,
  total_posts integer DEFAULT 0,
  new_posts integer DEFAULT 0,
  total_engagement integer DEFAULT 0,
  profile_views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE network_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON network_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON network_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_platforms_user_id ON social_platforms(user_id);
CREATE INDEX IF NOT EXISTS idx_social_platforms_user_connected ON social_platforms(user_id, is_connected);
CREATE INDEX IF NOT EXISTS idx_cross_platform_posts_user_id ON cross_platform_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_cross_platform_posts_status ON cross_platform_posts(status);
CREATE INDEX IF NOT EXISTS idx_platform_post_results_cross_post_id ON platform_post_results(cross_platform_post_id);
CREATE INDEX IF NOT EXISTS idx_network_analytics_user_date ON network_analytics(user_id, date DESC);

-- Function to update network analytics daily
CREATE OR REPLACE FUNCTION update_user_analytics(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_today date := CURRENT_DATE;
  v_total_connections integer;
  v_new_connections integer;
  v_total_posts integer;
  v_new_posts integer;
  v_total_engagement integer;
BEGIN
  -- Count total connections
  SELECT COUNT(*)
  INTO v_total_connections
  FROM connections
  WHERE (user_id = p_user_id OR connected_user_id = p_user_id)
  AND status = 'accepted';

  -- Count new connections today
  SELECT COUNT(*)
  INTO v_new_connections
  FROM connections
  WHERE (user_id = p_user_id OR connected_user_id = p_user_id)
  AND status = 'accepted'
  AND created_at::date = v_today;

  -- Count total posts
  SELECT COUNT(*)
  INTO v_total_posts
  FROM posts
  WHERE user_id = p_user_id;

  -- Count new posts today
  SELECT COUNT(*)
  INTO v_new_posts
  FROM posts
  WHERE user_id = p_user_id
  AND created_at::date = v_today;

  -- Calculate total engagement
  SELECT 
    COALESCE(SUM(like_count), 0) + COALESCE(SUM(comment_count), 0)
  INTO v_total_engagement
  FROM (
    SELECT 
      p.id,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
    FROM posts p
    WHERE p.user_id = p_user_id
  ) engagement_data;

  -- Insert or update analytics
  INSERT INTO network_analytics (
    user_id,
    date,
    total_connections,
    new_connections,
    total_posts,
    new_posts,
    total_engagement,
    profile_views
  ) VALUES (
    p_user_id,
    v_today,
    v_total_connections,
    v_new_connections,
    v_total_posts,
    v_new_posts,
    v_total_engagement,
    0
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_connections = EXCLUDED.total_connections,
    new_connections = EXCLUDED.new_connections,
    total_posts = EXCLUDED.total_posts,
    new_posts = EXCLUDED.new_posts,
    total_engagement = EXCLUDED.total_engagement;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;