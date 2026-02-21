import { useState } from 'react';

const fitBadgeClass = {
  high: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  low: 'bg-red-100 text-red-600 border border-red-200',
};

const recommendationClass = {
  'Apply Now': 'bg-emerald-600 text-white',
  'Consider': 'bg-yellow-500 text-white',
  'Skip': 'bg-slate-400 text-white',
};

const borderAccent = {
  high: 'border-l-emerald-500',
  medium: 'border-l-yellow-400',
  low: 'border-l-red-400',
};

function getFitLevel(score) {
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = n => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
}

export default function JobCard({ job, analysis }) {
  const [expanded, setExpanded] = useState(false);
  const salary = formatSalary(job.salary_min, job.salary_max);
  const fitLevel = analysis ? getFitLevel(analysis.fitScore) : null;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 ${fitLevel ? `border-l-4 ${borderAccent[fitLevel]}` : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900">{job.title}</h3>
            {analysis && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${fitBadgeClass[fitLevel]}`}>
                {analysis.fitScore}/10 fit
              </span>
            )}
            {analysis?.recommendation && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${recommendationClass[analysis.recommendation]}`}>
                {analysis.recommendation}
              </span>
            )}
          </div>
          <p className="text-slate-600 text-sm mt-0.5">{job.company}</p>
          <div className="flex items-center gap-3 mt-1 text-slate-500 text-xs flex-wrap">
            <span>📍 {job.location}</span>
            {salary && <span>💰 {salary}</span>}
            {job.contract_type && <span>⏱ {job.contract_type}</span>}
            {job.created && <span>{formatDate(job.created)}</span>}
            {job.category && <span className="text-slate-400">{job.category}</span>}
          </div>
        </div>
        <a
          href={job.redirect_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Apply
        </a>
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
          <p className="text-sm text-slate-700">{analysis.summary}</p>
          {analysis.matchingSkills?.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-emerald-600 font-medium">Matches:</span>
              {analysis.matchingSkills.map(s => (
                <span key={s} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">{s}</span>
              ))}
            </div>
          )}
          {analysis.skillGaps?.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-red-500 font-medium">Gaps:</span>
              {analysis.skillGaps.map(s => (
                <span key={s} className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">{s}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {job.description && (
        <div className="mt-3">
          <p className={`text-sm text-slate-600 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {job.description}
          </p>
          {job.description.length > 180 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-indigo-600 hover:text-indigo-800 mt-1"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
