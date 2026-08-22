// Marketing planning experience for launch messaging and growth loops.
function MarketingPlanner({ marketing }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Marketing Planner</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Plan your channels, messaging, and lead capture motion.</p>
      </div>

      <div className="space-y-3">
        {marketing.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarketingPlanner;
