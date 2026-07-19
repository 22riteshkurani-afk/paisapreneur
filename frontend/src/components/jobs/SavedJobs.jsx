// Saved and recently viewed jobs panel.
const saved = [
  { title: "Senior Product Designer", note: "Saved for later" },
  { title: "Growth Analyst", note: "Recently viewed" },
];

function SavedJobs() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Saved Jobs</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Bookmarked roles and recently viewed opportunities.</p>
      </div>

      <div className="space-y-3">
        {saved.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedJobs;
