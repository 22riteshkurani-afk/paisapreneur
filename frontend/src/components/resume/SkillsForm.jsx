// Skills form section for the resume builder.
function SkillsForm({ data, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Skills</h3>
      <label className="mb-3 block text-sm text-slate-600 dark:text-slate-300">
        <span className="mb-1 block">Core skills</span>
        <textarea rows={4} value={data.skills || ""} onChange={(event) => onChange("skills", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
      </label>
      <label className="block text-sm text-slate-600 dark:text-slate-300">
        <span className="mb-1 block">Certifications</span>
        <textarea rows={3} value={data.certifications || ""} onChange={(event) => onChange("certifications", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
      </label>
    </div>
  );
}

export default SkillsForm;
