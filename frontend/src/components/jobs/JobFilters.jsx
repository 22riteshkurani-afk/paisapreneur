// Search filter controls for discovering remote and hybrid roles.
function JobFilters({ filters, onChange, onSearch }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Search Filters</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Find the right role faster with targeted filters.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Job Title</span>
          <input value={filters.title || ""} onChange={(event) => onChange("title", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" placeholder="Product Designer" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Skills</span>
          <input value={filters.skills || ""} onChange={(event) => onChange("skills", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" placeholder="React, AI" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Location</span>
          <input value={filters.location || ""} onChange={(event) => onChange("location", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" placeholder="Remote" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Experience</span>
          <select value={filters.experience || "Mid-Level"} onChange={(event) => onChange("experience", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800">
            <option>Entry-Level</option>
            <option>Mid-Level</option>
            <option>Senior</option>
          </select>
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Salary Range</span>
          <input value={filters.salary || ""} onChange={(event) => onChange("salary", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" placeholder="$100k+" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Company</span>
          <input value={filters.company || ""} onChange={(event) => onChange("company", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" placeholder="Microsoft" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Employment Type</span>
          <select value={filters.type || "Full-time"} onChange={(event) => onChange("type", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800">
            <option>Full-time</option>
            <option>Contract</option>
            <option>Part-time</option>
          </select>
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Industry</span>
          <input value={filters.industry || ""} onChange={(event) => onChange("industry", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" placeholder="SaaS" />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button onClick={onSearch} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">Search</button>
        <span className="text-sm text-slate-500 dark:text-slate-400">Remote • Hybrid • On-site options available</span>
      </div>
    </div>
  );
}

export default JobFilters;
