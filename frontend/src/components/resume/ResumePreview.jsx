// Live ATS-style resume preview shown on the right side of the builder.
function ResumePreview({ data }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5 border-b border-slate-200 pb-4 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{data.fullName || "Your Name"}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{data.role || "Your Professional Role"}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span>{data.email || "email@example.com"}</span>
          <span>{data.phone || "Phone"}</span>
          <span>{data.linkedin || "linkedin.com/in/yourname"}</span>
        </div>
      </div>

      <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
        <section>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">Summary</h4>
          <p>{data.summary || "Add a polished summary to highlight your impact and specialization."}</p>
        </section>

        <section>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">Experience</h4>
          <p className="whitespace-pre-wrap">{data.experience || "Describe your recent work experience and accomplishments."}</p>
        </section>

        <section>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">Skills</h4>
          <p className="whitespace-pre-wrap">{data.skills || "List your core skills and technical strengths."}</p>
        </section>

        <section>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">Certifications</h4>
          <p className="whitespace-pre-wrap">{data.certifications || "Include industry certifications and credentials."}</p>
        </section>
      </div>
    </div>
  );
}

export default ResumePreview;
