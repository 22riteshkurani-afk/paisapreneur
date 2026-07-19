// Timeline of major career milestones and progress points.
import { useCareerPassport } from "../../contexts/CareerPassportContext";

function CareerTimeline() {
  const { profile } = useCareerPassport();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Career Timeline</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">A snapshot of your momentum and key milestones.</p>
      </div>

      <div className="space-y-3">
        {profile.timeline.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CareerTimeline;
