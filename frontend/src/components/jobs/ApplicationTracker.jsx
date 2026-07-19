// Application tracker for statuses, dates, and notes.
const trackerRows = [
  { role: "Product Designer", status: "Applied", date: "Jul 15", notes: "Follow-up scheduled" },
  { role: "Operations Analyst", status: "Interview", date: "Jul 10", notes: "Case study prepared" },
  { role: "Growth Specialist", status: "Wishlist", date: "Jun 30", notes: "Strong match" },
];

function ApplicationTracker() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Application Tracker</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Stay on top of your outreach pipeline.</p>
      </div>

      <div className="space-y-3">
        {trackerRows.map((entry) => (
          <div key={entry.role + entry.date} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{entry.role}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{entry.date}</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{entry.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{entry.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApplicationTracker;
