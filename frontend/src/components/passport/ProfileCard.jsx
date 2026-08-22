// Profile overview card with personal information and profile summary.
import { useCareerPassport } from "../../contexts/CareerPassportContext";

function ProfileCard() {
  const { profile } = useCareerPassport();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-semibold text-white">AC</div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{profile.fullName}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile.headline}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile.location} · {profile.experience}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
        <div><span className="font-semibold">Education:</span> {profile.education}</div>
        <div><span className="font-semibold">Skills:</span> {profile.skills.join(", ")}</div>
        <div><span className="font-semibold">Certificates:</span> {profile.certificates.join(", ")}</div>
        <div><span className="font-semibold">Languages:</span> {profile.languages.join(", ")}</div>
      </div>
    </div>
  );
}

export default ProfileCard;
