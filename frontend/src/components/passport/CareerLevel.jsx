// Career level card that summarizes current progression stage.
import { useCareerPassport } from "../../contexts/CareerPassportContext";

function CareerLevel() {
  const { profile } = useCareerPassport();

  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 p-5 text-white shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-100">Career Level</p>
      <h3 className="mt-2 text-2xl font-semibold">{profile.careerLevel}</h3>
      <p className="mt-2 text-sm text-indigo-100">You are building momentum through consistent learning, interviewing, and application activity.</p>
    </div>
  );
}

export default CareerLevel;
