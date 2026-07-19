// Summary cards for revenue and growth projections.
function RevenueDashboard({ metrics }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Revenue Dashboard</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track your early traction and expected revenue runway.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {metrics.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RevenueDashboard;
