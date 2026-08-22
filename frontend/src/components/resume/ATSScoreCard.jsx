// ATS score summary card displaying a score and optimization hints.
function ATSScoreCard({ score, label }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-indigo-50 p-4 shadow-sm dark:border-slate-700 dark:bg-indigo-950">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">ATS Score</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
        <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{score}</div>
      </div>
    </div>
  );
}

export default ATSScoreCard;
