import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // '' | 'saved' | 'error'
  const [skillInput, setSkillInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [uploadStatus, setUploadStatus] = useState(''); // '' | 'uploading' | 'success' | 'error'
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    axios.get('/api/profiles')
      .then(res => {
        const p = res.data.find(p => p.id === id);
        if (p) setProfile(p);
        else navigate('/');
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChange = (field, value) => setProfile(prev => ({ ...prev, [field]: value }));

  const handlePrefChange = (field, value) =>
    setProfile(prev => ({ ...prev, jobPreferences: { ...prev.jobPreferences, [field]: value } }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !profile.skills.includes(s)) {
      handleChange('skills', [...profile.skills, s]);
      setSkillInput('');
    }
  };

  const removeSkill = skill => handleChange('skills', profile.skills.filter(s => s !== skill));

  const addTitle = () => {
    const t = titleInput.trim();
    if (t) {
      handlePrefChange('titles', [...(profile.jobPreferences?.titles || []), t]);
      setTitleInput('');
    }
  };

  const removeTitle = title =>
    handlePrefChange('titles', profile.jobPreferences.titles.filter(t => t !== title));

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('');
    try {
      await axios.put(`/api/profiles/${id}`, profile);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeFile = async (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowed.includes(file.type)) {
      setUploadError('Please upload a PDF or Word document (.pdf, .docx, .doc)');
      setUploadStatus('error');
      return;
    }
    setUploadStatus('uploading');
    setUploadError('');
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await axios.post(`/api/profiles/${id}/resume/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      handleChange('resumeText', res.data.resumeText);
      setUploadStatus('success');
      setTimeout(() => setUploadStatus(''), 4000);
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Upload failed. Please try again.');
      setUploadStatus('error');
    }
  };

  const handleFileInputChange = (e) => handleResumeFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleResumeFile(e.dataTransfer.files[0]);
  };

  if (loading || !profile) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-700 text-sm">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-7">
        {/* Basic Info */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">Basic Info</h2>
          <Field label="Name">
            <input type="text" value={profile.name} onChange={e => handleChange('name', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Current Title">
            <input type="text" value={profile.title || ''} onChange={e => handleChange('title', e.target.value)} placeholder="e.g. Software Engineer" className={inputCls} />
          </Field>
          <Field label="LinkedIn URL">
            <input type="url" value={profile.linkedinUrl || ''} onChange={e => handleChange('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/yourprofile" className={inputCls} />
          </Field>
        </section>

        {/* Skills */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">Skills</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSkill()}
              placeholder="Type a skill and press Enter"
              className={`${inputCls} flex-1`}
            />
            <button onClick={addSkill} className={btnPrimary}>Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills?.map(skill => (
              <span key={skill} className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full">
                {skill}
                <button onClick={() => removeSkill(skill)} className="text-indigo-300 hover:text-indigo-600 ml-0.5">×</button>
              </span>
            ))}
            {profile.skills?.length === 0 && <p className="text-slate-400 text-sm italic">No skills added</p>}
          </div>
        </section>

        {/* Resume */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">Resume / Summary</h2>

          {/* Upload drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg px-4 py-6 cursor-pointer transition-colors ${
              dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileInputChange}
              className="hidden"
            />
            {uploadStatus === 'uploading' ? (
              <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Parsing resume…
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Resume imported successfully!
              </div>
            ) : (
              <>
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5M16.5 12l-4.5-4.5m0 0L7.5 12m4.5-4.5V18" />
                </svg>
                <p className="text-sm text-slate-600 font-medium">Drop your resume here or <span className="text-indigo-600">browse</span></p>
                <p className="text-xs text-slate-400">PDF or Word document · max 10 MB</p>
              </>
            )}
          </div>

          {uploadStatus === 'error' && (
            <p className="text-sm text-red-600">{uploadError}</p>
          )}

          {/* Editable text area – populated automatically after upload */}
          <textarea
            value={profile.resumeText || ''}
            onChange={e => handleChange('resumeText', e.target.value)}
            placeholder="Or paste your resume text here. The more detail, the better Claude's job recommendations will be."
            rows={8}
            className={`${inputCls} resize-y`}
          />
        </section>

        {/* Job Preferences */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">Job Preferences</h2>
          <Field label="Location">
            <input type="text" value={profile.jobPreferences?.location || ''} onChange={e => handlePrefChange('location', e.target.value)} placeholder="e.g. Denver, CO" className={inputCls} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.jobPreferences?.remote || false}
              onChange={e => handlePrefChange('remote', e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            Open to remote work
          </label>
          <Field label="Target Job Titles">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTitle()}
                placeholder="e.g. Product Manager"
                className={`${inputCls} flex-1`}
              />
              <button onClick={addTitle} className={btnPrimary}>Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.jobPreferences?.titles?.map(title => (
                <span key={title} className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full">
                  {title}
                  <button onClick={() => removeTitle(title)} className="text-emerald-300 hover:text-emerald-600 ml-0.5">×</button>
                </span>
              ))}
            </div>
          </Field>
        </section>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
              saveStatus === 'saved' ? 'bg-emerald-600 text-white' :
              saveStatus === 'error' ? 'bg-red-600 text-white' :
              'bg-indigo-600 text-white hover:bg-indigo-700'
            } disabled:opacity-50`}
          >
            {saving ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error – try again' : 'Save Profile'}
          </button>
          <button
            onClick={() => navigate(`/jobs/${id}`)}
            className="flex-1 py-2.5 px-4 rounded-lg font-medium text-sm bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Search Jobs
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const btnPrimary = 'bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0';
