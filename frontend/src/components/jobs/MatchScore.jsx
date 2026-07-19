// AI match score panel with explanation and recommendations.
function MatchScore({ job }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Match Score</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Why this role fits your profile.</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-2xl font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{job.match}%</div>
      </div>

      <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
        <div><span className="font-semibold">Why it matches:</span> Strong overlap with your experience in {job.skills.slice(0, 2).join(" and ")}.</div>
        <div><span className="font-semibold">Missing skills:</span> {job.missingSkills}</div>
        <div><span className="font-semibold">Resume changes:</span> Add more measurable impact and highlight collaborative delivery.</div>
        <div><span className="font-semibold">Interview tips:</span> Prepare a story around ownership, growth, and cross-functional execution.</div>
      </div>
    </div>
  );
}

export default MatchScore;
