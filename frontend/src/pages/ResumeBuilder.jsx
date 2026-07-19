// AI-powered resume builder with live ATS preview, AI actions, and responsive form layout.
import { useMemo, useState } from "react";
import { Download, FileText, BrainCircuit } from "lucide-react";
import { resumeApi } from "../services/apiService";
import PersonalForm from "../components/resume/PersonalForm";
import ExperienceForm from "../components/resume/ExperienceForm";
import SkillsForm from "../components/resume/SkillsForm";
import ResumePreview from "../components/resume/ResumePreview";
import ATSScoreCard from "../components/resume/ATSScoreCard";
import { askAI } from "../services/api";

const initialData = {
  fullName: "Ava Carter",
  role: "Product Designer",
  email: "ava@example.com",
  phone: "+1 555 0100",
  linkedin: "linkedin.com/in/avacarter",
  portfolio: "avacarter.design",
  summary: "Design-focused product leader with experience building intuitive, data-informed experiences for ambitious teams.",
  experience: "Senior Product Designer, Northstar Labs\n• Led end-to-end design for a B2B analytics platform\n• Improved onboarding activation by 28%",
  achievements: "• Increased user retention by 18%\n• Spearheaded design ops improvements across three squads",
  skills: "UX Strategy, Wireframing, Figma, Design Systems, User Research, Product Thinking",
  certifications: "Google UX Design Certificate, Lean Product Management",
};

function ResumeBuilder() {
  const [formData, setFormData] = useState(initialData);
  const [loadingAction, setLoadingAction] = useState("");
  const [statusMessage, setStatusMessage] = useState("Your resume updates in real time as you edit.");
  const [error, setError] = useState("");

  const atsScore = useMemo(() => {
    const keywords = ["product", "design", "ux", "strategy", "figma", "research", "analytics"];
    const matched = keywords.filter((keyword) => `${formData.summary} ${formData.skills} ${formData.experience}`.toLowerCase().includes(keyword));
    return Math.min(98, 70 + matched.length * 4);
  }, [formData]);

  function handleFieldChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAIAction(actionLabel, prompt) {
    setLoadingAction(actionLabel);
    setError("");
    setStatusMessage(`Generating ${actionLabel.toLowerCase()}...`);

    try {
      const response = await resumeApi.generate({ action: actionLabel, prompt, data: formData });
      const text = response.data?.content || response.data?.summary || response.data?.message || "";
      handleFieldChange(actionLabel === "Generate Summary" ? "summary" : actionLabel === "Generate Experience" ? "experience" : "skills", text);
      setStatusMessage(`${actionLabel} completed.`);
    } catch (err) {
      setError(err.message || "The AI service could not be reached.");
      setStatusMessage("AI generation failed. Please try again.");
    } finally {
      setLoadingAction("");
    }
  }

  async function handleDownload(format) {
    try {
      if (format === "pdf") {
        const response = await resumeApi.exportPdf(1);
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "resume.pdf";
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        const response = await resumeApi.exportDocx(1);
        const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "resume.docx";
        link.click();
        window.URL.revokeObjectURL(url);
      }
      setStatusMessage(`${format.toUpperCase()} download completed.`);
    } catch (err) {
      setError(err.message || "Export failed.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-100">AI Resume Builder</p>
            <h2 className="text-2xl font-semibold">Create a polished, ATS-friendly resume in minutes.</h2>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">Build from your experience, refine with AI, and preview your resume in real time.</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-sm text-indigo-100">Live preview</p>
            <p className="text-lg font-semibold">Auto-updating</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: "Improve with AI", prompt: `Rewrite this resume summary to sound professional, modern, and tailored for top-tier product and design roles. Current content: ${formData.summary}` },
          { label: "Generate Summary", prompt: `Generate a compelling professional summary for a ${formData.role || "professional"} based on these details: ${formData.experience}.` },
          { label: "Generate Experience", prompt: `Turn this resume experience into strong bullet points for a modern professional resume: ${formData.experience}` },
          { label: "Optimize Skills", prompt: `Suggest a concise set of ATS-friendly skills for a ${formData.role || "professional"} using this background: ${formData.skills}` },
          { label: "ATS Score", prompt: `Assess the ATS readiness of this resume and provide a short improvement note.` },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => action.label === "ATS Score" ? setStatusMessage("ATS score is based on keyword alignment and structure.") : handleAIAction(action.label, action.prompt)}
            disabled={loadingAction !== ""}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {loadingAction === action.label ? "Working..." : action.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <PersonalForm data={formData} onChange={handleFieldChange} />
          <ExperienceForm data={formData} onChange={handleFieldChange} />
          <SkillsForm data={formData} onChange={handleFieldChange} />
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Live ATS Resume Preview</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Professional formatting with automatic updates.</p>
              </div>
              <div className="rounded-full bg-indigo-50 p-2 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                <FileText size={18} />
              </div>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <button onClick={() => handleDownload("pdf")} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
                <span className="flex items-center gap-2"><Download size={16} /> Download PDF</span>
              </button>
              <button onClick={() => handleDownload("docx")} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-2"><Download size={16} /> Download DOCX</span>
              </button>
            </div>
            <ResumePreview data={formData} />
          </div>

          <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
            <ATSScoreCard score={`${atsScore}/100`} label="Keyword alignment and structure" />
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <BrainCircuit size={16} className="text-indigo-600" />
                AI Assistant
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{statusMessage}</p>
              {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
