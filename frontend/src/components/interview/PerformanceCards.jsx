// KPI cards for the performance dashboard.
const metrics = [
  { label: "Overall Score", value: "8.4/10" },
  { label: "Communication", value: "8.8/10" },
  { label: "Confidence", value: "8.2/10" },
  { label: "Technical Skills", value: "8.6/10" },
  { label: "Leadership", value: "7.9/10" },
  { label: "Problem Solving", value: "8.7/10" },
];

function PerformanceCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

export default PerformanceCards;
