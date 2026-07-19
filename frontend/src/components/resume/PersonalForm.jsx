// Personal information form section for the resume builder.
function PersonalForm({ data, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Personal Information</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Full name</span>
          <input value={data.fullName || ""} onChange={(event) => onChange("fullName", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Role</span>
          <input value={data.role || ""} onChange={(event) => onChange("role", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Email</span>
          <input value={data.email || ""} onChange={(event) => onChange("email", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          <span className="mb-1 block">Phone</span>
          <input value={data.phone || ""} onChange={(event) => onChange("phone", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300 md:col-span-2">
          <span className="mb-1 block">LinkedIn</span>
          <input value={data.linkedin || ""} onChange={(event) => onChange("linkedin", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300 md:col-span-2">
          <span className="mb-1 block">Portfolio</span>
          <input value={data.portfolio || ""} onChange={(event) => onChange("portfolio", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
        </label>
      </div>
    </div>
  );
}

export default PersonalForm;
