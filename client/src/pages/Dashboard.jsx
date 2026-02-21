import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ProfileCard({ profile }) {
  const initial = profile.name?.charAt(0)?.toUpperCase() || '?';
  const hasSetup = profile.skills?.length > 0 || profile.resumeText || profile.title;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-slate-900 truncate">{profile.name}</h2>
          <p className="text-slate-500 text-sm">{profile.title || 'No title set'}</p>
        </div>
      </div>

      {profile.skills?.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.skills.slice(0, 6).map(skill => (
            <span key={skill} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full">
              {skill}
            </span>
          ))}
          {profile.skills.length > 6 && (
            <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">
              +{profile.skills.length - 6} more
            </span>
          )}
        </div>
      ) : (
        <p className="text-slate-400 text-sm italic">No skills added yet</p>
      )}

      <div className="text-sm text-slate-500 space-y-1">
        {profile.jobPreferences?.location && (
          <p>📍 {profile.jobPreferences.location}{profile.jobPreferences.remote && ' · Open to remote'}</p>
        )}
        {profile.jobPreferences?.titles?.length > 0 && (
          <p>🎯 {profile.jobPreferences.titles.join(', ')}</p>
        )}
        {profile.linkedinUrl && (
          <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 block">
            LinkedIn →
          </a>
        )}
      </div>

      {!hasSetup && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
          Set up this profile to get better AI recommendations.
        </div>
      )}

      <div className="flex gap-3 mt-auto">
        <Link
          to={`/jobs/${profile.id}`}
          className="flex-1 text-center bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Search Jobs
        </Link>
        <Link
          to={`/profile/${profile.id}`}
          className="flex-1 text-center bg-white text-slate-700 py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/profiles')
      .then(res => setProfiles(res.data))
      .catch(err => console.error('Failed to load profiles:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">AI-powered job search for your whole family</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map(profile => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        <strong>Getting started:</strong> Edit each profile with your skills and resume, then search for jobs.
        Use <em>Get AI Recommendations</em> on the jobs page to have Claude rank listings by fit.
      </div>
    </div>
  );
}
