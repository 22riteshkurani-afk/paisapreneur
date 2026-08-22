// Founder profile setup card for the Business Mentor module.
function FounderProfile({ profile, onChange }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Founder Profile</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Define your company foundation and goals.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Business Name</span>
          <input value={profile.businessName || ""} onChange={(event) => onChange("businessName", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Industry</span>
          <input value={profile.industry || ""} onChange={(event) => onChange("industry", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Experience</span>
          <input value={profile.experience || ""} onChange={(event) => onChange("experience", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Monthly Revenue</span>
          <input value={profile.revenue || ""} onChange={(event) => onChange("revenue", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Investment Capacity</span>
          <input value={profile.investment || ""} onChange={(event) => onChange("investment", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Business Stage</span>
          <input value={profile.stage || ""} onChange={(event) => onChange("stage", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300 md:col-span-2">
          <span className="mb-1 block">Target Audience</span>
          <input value={profile.audience || ""} onChange={(event) => onChange("audience", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300 md:col-span-2">
          <span className="mb-1 block">Business Goals</span>
          <textarea rows={3} value={profile.goals || ""} onChange={(event) => onChange("goals", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
        </label>
      </div>
    </div>
  );
}

export default FounderProfile;
