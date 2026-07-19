// Quick-start interview mode chips for common companies and roles.
const modes = ["Amazon", "Google", "Microsoft", "Meta", "Startup", "Customer Support", "Sales", "Business Analyst", "Software Engineer", "React Developer"];

function QuickInterviewModes({ onSelect }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Quick Interview Modes</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Jump straight into a standard prep flow for common roles.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {modes.map((mode) => (
          <button key={mode} onClick={() => onSelect(mode)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickInterviewModes;
