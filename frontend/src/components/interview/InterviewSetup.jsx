// Interview setup form for selecting role, company, experience level, and interview type.
function InterviewSetup({ setup, onChange }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Interview Setup</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Customize your prep experience for the role you want.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Job Role</span>
          <input value={setup.role || ""} onChange={(event) => onChange("role", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" placeholder="Software Engineer" />
        </label>

        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Company</span>
          <input value={setup.company || ""} onChange={(event) => onChange("company", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" placeholder="Microsoft" />
        </label>

        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Experience Level</span>
          <select value={setup.level || "Mid-Level"} onChange={(event) => onChange("level", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800">
            <option>Entry-Level</option>
            <option>Mid-Level</option>
            <option>Senior</option>
            <option>Lead</option>
          </select>
        </label>

        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Interview Type</span>
          <select value={setup.type || "Behavioral"} onChange={(event) => onChange("type", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800">
            <option>HR</option>
            <option>Technical</option>
            <option>Behavioral</option>
            <option>Managerial</option>
          </select>
        </label>
      </div>
    </div>
  );
}

export default InterviewSetup;
