// Central career passport profile that aggregates profile data, skill graph, timeline, analytics, and recommendations.
import { useEffect, useState } from "react";
import { BriefcaseBusiness, Sparkles } from "lucide-react";
import ProfileCard from "../components/passport/ProfileCard";
import SkillGraph from "../components/passport/SkillGraph";
import CareerTimeline from "../components/passport/CareerTimeline";
import Achievements from "../components/passport/Achievements";
import Analytics from "../components/passport/Analytics";
import AIRecommendations from "../components/passport/AIRecommendations";
import CareerLevel from "../components/passport/CareerLevel";
import { passportApi } from "../services/apiService";

function CareerPassport() {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await passportApi.getProfile();
        if (response.data?.profile) {
          setSaved(true);
        }
      } catch (err) {
        console.error("Passport load failed", err);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      await passportApi.saveProfile({ profile: "default" });
      setSaved(true);
    } catch (err) {
      console.error("Passport save failed", err);
    }
  };
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-600 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-200">
              <BriefcaseBusiness size={16} />
              Career Passport
            </div>
            <h2 className="text-2xl font-semibold">Your professional story, unified and growth-focused.</h2>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">The central profile connecting your resume, interview prep, job discovery, and growth plan.</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-sm text-indigo-100">Connected modules</p>
            <p className="text-lg font-semibold">Always in sync</p>
            <button onClick={handleSave} className="mt-2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">{saved ? "Saved" : "Save profile"}</button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <ProfileCard />
          <SkillGraph />
          <CareerTimeline />
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            <Sparkles size={18} className="text-indigo-600" />
            Growth Snapshot
          </div>
          <CareerLevel />
          <Achievements />
          <Analytics />
          <AIRecommendations />
        </div>
      </div>
    </div>
  );
}

export default CareerPassport;
