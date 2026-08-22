// Business plan module showing core startup planning sections.
function BusinessPlan({ plan }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Business Plan Generator</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Turn the idea into a viable operating plan.</p>
      </div>

      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
        {plan.map((section) => (
          <div key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="font-semibold">{section.title}</p>
            <p className="mt-1">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BusinessPlan;
