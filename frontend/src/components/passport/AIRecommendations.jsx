// AI recommendations for upskilling, certificates, and next career moves.
import { useCareerPassport } from "../../contexts/CareerPassportContext";

function AIRecommendations() {
  const { profile } = useCareerPassport();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Recommendations</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Suggested next steps to accelerate your growth.</p>
      </div>

      <div className="space-y-3">
        {profile.recommendations.map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AIRecommendations;
