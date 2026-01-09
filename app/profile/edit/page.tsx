'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { FiberBackground } from '@/components/design-system/FiberBackground';
import { GlassPanel } from '@/components/design-system/GlassPanel';
import { FiberInput } from '@/components/design-system/FiberInput';
import { FiberTextarea } from '@/components/design-system/FiberTextarea';
import { WeaveButton } from '@/components/design-system/WeaveButton';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function EditProfilePage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setHeadline(profile.headline || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setWebsite(profile.website || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        headline,
        bio,
        location,
        website,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (!error) {
      await refreshProfile();
      router.push(`/profile/${user.id}`);
    }
    setSaving(false);
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

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tighter mb-2">Edit Profile</h1>
          <p className="text-slate-400 font-mono text-sm">Update your professional information</p>
        </div>

        <GlassPanel className="p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <FiberInput
              label="Full Name"
              type="text"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <FiberInput
              label="Headline"
              type="text"
              placeholder="e.g. Software Engineer | Tech Lead"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />

            <FiberTextarea
              label="About"
              placeholder="Tell others about yourself and your professional background..."
              rows={6}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <FiberInput
              label="Location"
              type="text"
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <FiberInput
              label="Website"
              type="url"
              placeholder="https://yourwebsite.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />

            <div className="flex gap-4 pt-4">
              <WeaveButton type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </WeaveButton>
              <WeaveButton
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Cancel
              </WeaveButton>
            </div>
          </form>
        </GlassPanel>
      </div>
    </div>
  );
}
