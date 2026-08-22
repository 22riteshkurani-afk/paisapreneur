// Monetization planner for revenue models and income projections.
function MonetizationPlanner({ revenueStreams }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Monetization Planner</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Choose the best path to monetize your expertise and audience.</p>
      </div>

      <div className="space-y-3">
        {revenueStreams.map((stream) => (
          <div key={stream.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{stream.title}</p>
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{stream.value}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{stream.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MonetizationPlanner;
