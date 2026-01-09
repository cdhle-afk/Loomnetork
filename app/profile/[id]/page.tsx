'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { FiberBackground } from '@/components/design-system/FiberBackground';
import { GlassPanel } from '@/components/design-system/GlassPanel';
import { WeaveButton } from '@/components/design-system/WeaveButton';
import { supabase, Profile, Experience, Education, Skill, Connection } from '@/lib/supabase';
import { MapPin, Globe, Briefcase, GraduationCap, Award, Edit, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.id === profileId;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && profileId) {
      fetchProfile();
      fetchExperiences();
      fetchEducation();
      fetchSkills();
      if (!isOwnProfile) {
        checkConnectionStatus();
      }
    }
  }, [user, profileId]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .maybeSingle();
    if (data) setProfile(data);
    setLoading(false);
  };

  const fetchExperiences = async () => {
    const { data } = await supabase
      .from('experiences')
      .select('*')
      .eq('user_id', profileId)
      .order('start_date', { ascending: false });
    if (data) setExperiences(data);
  };

  const fetchEducation = async () => {
    const { data } = await supabase
      .from('education')
      .select('*')
      .eq('user_id', profileId)
      .order('start_date', { ascending: false });
    if (data) setEducation(data);
  };

  const fetchSkills = async () => {
    const { data } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', profileId);
    if (data) setSkills(data);
  };

  const checkConnectionStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('connections')
      .select('status')
      .or(`and(user_id.eq.${user.id},connected_user_id.eq.${profileId}),and(user_id.eq.${profileId},connected_user_id.eq.${user.id})`)
      .maybeSingle();

    if (data) {
      setConnectionStatus(data.status === 'accepted' ? 'connected' : 'pending');
    }
  };

  const handleConnect = async () => {
    if (!user) return;

    if (connectionStatus === 'none') {
      await supabase.from('connections').insert({
        user_id: user.id,
        connected_user_id: profileId,
        status: 'accepted',
      });
      setConnectionStatus('connected');
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiberBackground />
        <div className="font-mono text-indigo-400 animate-pulse">LOADING_SYSTEM...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiberBackground />
        <div className="text-slate-400">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <FiberBackground />
      <Navigation />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-12">
        <GlassPanel className="mb-8">
          {profile.cover_image_url && (
            <div className="h-48 overflow-hidden">
              <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-6">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-24 h-24 rounded-full border-4 border-[#0a0c10]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-indigo-500/20 border-4 border-[#0a0c10] flex items-center justify-center">
                    <span className="text-indigo-400 font-bold text-3xl">
                      {profile.full_name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tighter mb-2">
                    {profile.full_name}
                  </h1>
                  {profile.headline && (
                    <p className="text-xl text-slate-300 mb-3">{profile.headline}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profile.location}
                      </div>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div>
                {isOwnProfile ? (
                  <Link href="/profile/edit">
                    <WeaveButton variant="secondary">
                      <Edit className="w-4 h-4 mr-2 inline" />
                      Edit Profile
                    </WeaveButton>
                  </Link>
                ) : (
                  <WeaveButton
                    onClick={handleConnect}
                    disabled={connectionStatus !== 'none'}
                    variant={connectionStatus === 'connected' ? 'secondary' : 'primary'}
                  >
                    {connectionStatus === 'connected' ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-2 inline" />
                        Connected
                      </>
                    ) : connectionStatus === 'pending' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                        Pending
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2 inline" />
                        Connect
                      </>
                    )}
                  </WeaveButton>
                )}
              </div>
            </div>

            {profile.bio && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <h3 className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-3">
                  About
                </h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>
        </GlassPanel>

        {experiences.length > 0 && (
          <GlassPanel className="p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              <h2 className="text-2xl font-bold">Experience</h2>
            </div>
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{exp.title}</h3>
                    <p className="text-slate-300">{exp.company}</p>
                    <p className="text-sm text-slate-400 font-mono mt-1">
                      {format(new Date(exp.start_date), 'MMM yyyy')} -{' '}
                      {exp.current ? 'Present' : exp.end_date ? format(new Date(exp.end_date), 'MMM yyyy') : 'Present'}
                      {exp.location && ` • ${exp.location}`}
                    </p>
                    {exp.description && (
                      <p className="text-slate-400 mt-2 leading-relaxed whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        )}

        {education.length > 0 && (
          <GlassPanel className="p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              <h2 className="text-2xl font-bold">Education</h2>
            </div>
            <div className="space-y-6">
              {education.map((edu) => (
                <div key={edu.id} className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{edu.school}</h3>
                    <p className="text-slate-300">
                      {edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}
                    </p>
                    <p className="text-sm text-slate-400 font-mono mt-1">
                      {format(new Date(edu.start_date), 'MMM yyyy')} -{' '}
                      {edu.end_date ? format(new Date(edu.end_date), 'MMM yyyy') : 'Present'}
                    </p>
                    {edu.description && (
                      <p className="text-slate-400 mt-2 leading-relaxed whitespace-pre-wrap">
                        {edu.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        )}

        {skills.length > 0 && (
          <GlassPanel className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-5 h-5 text-indigo-500" />
              <h2 className="text-2xl font-bold">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-sm"
                >
                  {skill.skill_name}
                </div>
              ))}
            </div>
          </GlassPanel>
        )}
      </div>
    </div>
  );
}
