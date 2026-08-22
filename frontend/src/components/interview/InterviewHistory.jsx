// Recent interview history panel with scores and company details.
const history = [
  { company: "Microsoft", score: "9.1/10", date: "Jul 18" },
  { company: "Amazon", score: "8.4/10", date: "Jul 12" },
  { company: "Startup", score: "8.8/10", date: "Jul 08" },
];

function InterviewHistory() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Interview History</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Recent prep sessions and outcome scores.</p>
      </div>

      <div className="space-y-3">
        {history.map((entry) => (
          <div key={entry.company + entry.date} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{entry.company}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{entry.date}</p>
            </div>
            <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{entry.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InterviewHistory;
