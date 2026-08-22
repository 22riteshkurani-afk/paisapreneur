// Progress bars for the skill graph and readiness indicators.
import { useCareerPassport } from "../../contexts/CareerPassportContext";

const skillLabels = [
  { key: "communication", label: "Communication" },
  { key: "leadership", label: "Leadership" },
  { key: "technicalSkills", label: "Technical Skills" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "criticalThinking", label: "Critical Thinking" },
  { key: "aiLiteracy", label: "AI Literacy" },
  { key: "interviewReadiness", label: "Interview Readiness" },
  { key: "resumeScore", label: "Resume Score" },
  { key: "atsReadiness", label: "ATS Readiness" },
];

function SkillGraph() {
  const { profile } = useCareerPassport();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Skill Graph</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track growth across key professional capabilities.</p>
      </div>

      <div className="space-y-3">
        {skillLabels.map((skill) => (
          <div key={skill.key}>
            <div className="mb-1 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>{skill.label}</span>
              <span>{profile.skillsGraph[skill.key]}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${profile.skillsGraph[skill.key]}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkillGraph;
