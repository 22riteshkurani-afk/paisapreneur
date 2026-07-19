// A polished job result card showing key details and actions.
function JobCard({ job }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {job.company?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{job.company}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{job.role}</p>
            </div>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{job.type}</span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
        <div><span className="font-medium">Salary:</span> {job.salary}</div>
        <div><span className="font-medium">Location:</span> {job.location}</div>
        <div><span className="font-medium">Experience:</span> {job.experience}</div>
        <div><span className="font-medium">Posted:</span> {job.posted}</div>
      </div>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{job.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.skills.map((skill) => (
          <span key={skill} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{skill}</span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button className="rounded-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">Apply Now</button>
        <button className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">Save Job</button>
        <button className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">Share</button>
      </div>
    </div>
  );
}

export default JobCard;
