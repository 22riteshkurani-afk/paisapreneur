// AI-powered job discovery experience with filters, matching insights, tracking, and an assistant.
import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import JobFilters from "../components/jobs/JobFilters";
import JobCard from "../components/jobs/JobCard";
import MatchScore from "../components/jobs/MatchScore";
import ResumeAnalyzer from "../components/jobs/ResumeAnalyzer";
import ApplicationTracker from "../components/jobs/ApplicationTracker";
import SavedJobs from "../components/jobs/SavedJobs";
import RecommendedJobs from "../components/jobs/RecommendedJobs";
import AIJobAssistant from "../components/jobs/AIJobAssistant";
import { jobsApi } from "../services/apiService";

const seedJobs = [
  {
    company: "Microsoft",
    role: "Senior Product Designer",
    salary: "$160k - $190k",
    location: "Remote, US",
    experience: "Senior",
    posted: "2 days ago",
    description: "Build compelling product experiences for AI services across the Microsoft ecosystem.",
    skills: ["Figma", "UX Research", "AI", "Design Systems"],
    match: 92,
    missingSkills: "Advanced prototyping, analytics instrumentation",
    type: "Full-time",
  },
  {
    company: "Stripe",
    role: "Senior Frontend Engineer",
    salary: "$180k - $220k",
    location: "Hybrid, New York",
    experience: "Senior",
    posted: "4 days ago",
    description: "Create polished, high-performance interfaces for a fast-growing financial platform.",
    skills: ["React", "TypeScript", "Performance", "Accessibility"],
    match: 88,
    missingSkills: "System design, distributed frontend architecture",
    type: "Full-time",
  },
  {
    company: "Notion",
    role: "Customer Success Manager",
    salary: "$110k - $140k",
    location: "Remote, Europe",
    experience: "Mid-Level",
    posted: "1 week ago",
    description: "Support enterprise customers adopting AI-powered collaboration workflows.",
    skills: ["Customer Success", "SaaS", "Communication", "Strategy"],
    match: 85,
    missingSkills: "Enterprise SaaS analytics, product-led growth",
    type: "Full-time",
  },
];

const resumeProfile = {
  strengths: "Strong storytelling, user-centered product thinking, and clear communication.",
  weaknesses: "Needs more quantified outcomes and deeper technical examples.",
  missingKeywords: "Accessibility, analytics instrumentation, AI product strategy",
  ats: "High compatibility with modern ATS systems and keyword alignment.",
};

function JobFinder() {
  const [filters, setFilters] = useState({ title: "", skills: "", location: "Remote", experience: "Mid-Level", salary: "", company: "", type: "Full-time", industry: "" });
  const [jobs, setJobs] = useState(seedJobs);

  const quickFilters = ["Customer Support", "Sales", "Marketing", "Finance", "Software Engineer", "React Developer", "Data Analyst", "Business Analyst", "HR", "AI Engineer"];

  const filteredJobs = useMemo(() => {
    const term = filters.title.toLowerCase();
    return jobs.filter((job) => {
      const matchesTitle = !term || job.role.toLowerCase().includes(term);
      const matchesSkills = !filters.skills || job.skills.some((skill) => skill.toLowerCase().includes(filters.skills.toLowerCase()));
      const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
      return matchesTitle && matchesSkills && matchesLocation;
    });
  }, [filters, jobs]);

  function handleFilterChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSearch() {
    try {
      const response = await jobsApi.search({ title: filters.title, location: filters.location, experience: filters.experience });
      setJobs(response.data?.jobs || []);
    } catch (err) {
      setJobs(seedJobs);
    }
  }

  function handleQuickFilter(value) {
    setFilters((prev) => ({ ...prev, title: value }));
  }

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-600 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-200">
              <Search size={16} />
              AI Job Finder
            </div>
            <h2 className="text-2xl font-semibold">Discover your next role with AI-guided matching.</h2>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">Search, compare, apply, and track opportunities from one premium workspace.</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-sm text-indigo-100">Remote-ready</p>
            <p className="text-lg font-semibold">New opportunities daily</p>
          </div>
        </div>
      </div>

      <JobFilters filters={filters} onChange={handleFilterChange} onSearch={handleSearch} />

      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <button key={filter} onClick={() => handleQuickFilter(filter)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {filter}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            <Sparkles size={18} className="text-indigo-600" />
            Job Results
          </div>
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <JobCard key={job.company + job.role} job={job} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <MatchScore job={filteredJobs[0] || seedJobs[0]} />
          <ResumeAnalyzer resume={resumeProfile} />
          <ApplicationTracker />
          <SavedJobs />
          <RecommendedJobs />
          <AIJobAssistant />
        </div>
      </div>
    </div>
  );
}

export default JobFinder;
