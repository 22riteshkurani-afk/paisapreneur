// Analytics summary card for core application and interview metrics.
import { useCareerPassport } from "../../contexts/CareerPassportContext";

function Analytics() {
  const { profile } = useCareerPassport();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Career Analytics</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Performance indicators across your search and prep efforts.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["Applications", profile.metrics.applications],
          ["Interviews", profile.metrics.interviews],
          ["Offers", profile.metrics.offers],
          ["Rejections", profile.metrics.rejections],
          ["Response Rate", profile.metrics.responseRate],
          ["Success Rate", profile.metrics.successRate],
          ["Average ATS Score", profile.metrics.averageAtsScore],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Analytics;
