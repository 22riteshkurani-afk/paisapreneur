// Recommended jobs curated for the selected profile.
const recommended = [
  { title: "AI Product Analyst", company: "OpenAI", match: "94%" },
  { title: "Frontend Engineer", company: "Linear", match: "91%" },
];

function RecommendedJobs() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recommended Jobs</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">High-probability opportunities tailored to your profile.</p>
      </div>

      <div className="space-y-3">
        {recommended.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.company}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{item.match}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendedJobs;
