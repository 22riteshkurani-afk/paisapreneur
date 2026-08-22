// Achievements and career levels displayed as badges.
import { useCareerPassport } from "../../contexts/CareerPassportContext";

function Achievements() {
  const { profile } = useCareerPassport();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Achievements</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Milestones that reflect your growth.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {profile.achievements.map((achievement) => (
          <span key={achievement} className="rounded-full bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{achievement}</span>
        ))}
      </div>
    </div>
  );
}

export default Achievements;
