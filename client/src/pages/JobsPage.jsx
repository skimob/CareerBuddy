import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import JobCard from '../components/JobCard';

export default function JobsPage() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Denver, CO');
  const [remote, setRemote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    axios.get('/api/profiles').then(res => {
      const p = res.data.find(p => p.id === profileId);
      if (!p) { navigate('/'); return; }
      setProfile(p);
      setLocation(p.jobPreferences?.location || 'Denver, CO');
      setRemote(p.jobPreferences?.remote || false);
      if (p.jobPreferences?.titles?.length > 0) {
        setSearchQuery(p.jobPreferences.titles[0]);
      }
    });
  }, [profileId, navigate]);

  const searchJobs = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    setJobs([]);
    setAnalyses({});
    setSearched(true);
    try {
      const res = await axios.get('/api/jobs/search', {
        params: { q: searchQuery, where: location, remote, results_per_page: 20 },
      });
      setJobs(res.data.jobs);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search jobs. Check your Adzuna API keys in .env');
    } finally {
      setLoading(false);
    }
  };

  const analyzeJobs = async () => {
    if (!jobs.length || !profile) return;
    setAnalyzing(true);
    setError('');
    try {
      const res = await axios.post('/api/ai/analyze', { profile, jobs });
      const map = {};
      res.data.forEach(a => { map[a.jobId] = a; });
      setAnalyses(map);
    } catch (err) {
      setError(err.response?.data?.error || 'AI analysis failed. Check your ANTHROPIC_API_KEY in .env');
    } finally {
      setAnalyzing(false);
    }
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    const sa = analyses[a.id]?.fitScore ?? 0;
    const sb = analyses[b.id]?.fitScore ?? 0;
    return sb - sa;
  });

  const hasAnalyses = Object.keys(analyses).length > 0;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-700 text-sm">
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Search</h1>
          {profile && (
            <p className="text-slate-500 text-sm">
              For <span className="font-medium text-indigo-600">{profile.name}</span>
            </p>
          )}
        </div>
        {profile && (
          <Link to={`/profile/${profileId}`} className="ml-auto text-sm text-indigo-600 hover:text-indigo-800">
            Edit Profile →
          </Link>
        )}
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchJobs()}
            placeholder="Job title, keywords..."
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchJobs()}
            placeholder="Location"
            className="sm:w-48 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={searchJobs}
            disabled={loading || !searchQuery.trim()}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 shrink-0"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="mt-3 flex items-center flex-wrap gap-3">
          <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={remote}
              onChange={e => setRemote(e.target.checked)}
              className="rounded text-indigo-600"
            />
            Remote friendly
          </label>

          {profile?.jobPreferences?.titles?.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 text-xs">Quick search:</span>
              {profile.jobPreferences.titles.map(t => (
                <button
                  key={t}
                  onClick={() => setSearchQuery(t)}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                    searchQuery === t
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'text-indigo-600 border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Results toolbar */}
      {searched && !loading && jobs.length > 0 && (
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-slate-500 text-sm">
            {jobs.length} of {total.toLocaleString()} results
            {hasAnalyses && ' · Sorted by AI fit score'}
          </p>
          <button
            onClick={analyzeJobs}
            disabled={analyzing}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Analyzing with Claude...
              </>
            ) : hasAnalyses ? 'Re-analyze with AI' : 'Get AI Recommendations'}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48 text-slate-500">
          Searching jobs...
        </div>
      )}

      {/* Empty state */}
      {!loading && searched && jobs.length === 0 && !error && (
        <div className="text-center py-16 text-slate-500">
          No jobs found. Try different keywords or a broader location.
        </div>
      )}

      {/* Job cards */}
      <div className="space-y-4">
        {sortedJobs.map(job => (
          <JobCard key={job.id} job={job} analysis={analyses[job.id]} />
        ))}
      </div>
    </div>
  );
}
