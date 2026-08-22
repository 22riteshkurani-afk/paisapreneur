// Global context for the career passport so modules can share and update profile state.
import { createContext, useContext, useMemo, useState } from "react";

const CareerPassportContext = createContext(null);

export function CareerPassportProvider({ children }) {
  const [profile, setProfile] = useState({
    fullName: "Ava Carter",
    headline: "Product Designer & AI Builder",
    location: "Remote · US",
    experience: "5+ years",
    education: "B.S. Human-Computer Interaction",
    skills: ["Product Design", "UX Research", "AI Strategy", "React"],
    certificates: ["Google UX Design", "Lean Product Management"],
    languages: ["English", "Spanish"],
    linkedin: "linkedin.com/in/avacarter",
    github: "github.com/ava",
    portfolio: "avacarter.design",
    resumeScore: 91,
    atsReadiness: 88,
    metrics: {
      applications: 48,
      interviews: 12,
      offers: 3,
      rejections: 5,
      responseRate: "82%",
      successRate: "18%",
      averageAtsScore: 87,
    },
    skillsGraph: {
      communication: 92,
      leadership: 84,
      technicalSkills: 89,
      problemSolving: 90,
      criticalThinking: 88,
      aiLiteracy: 86,
      interviewReadiness: 91,
      resumeScore: 91,
      atsReadiness: 88,
    },
    timeline: [
      { label: "Resume Generated", date: "Jul 18" },
      { label: "Interview Completed", date: "Jul 12" },
      { label: "Jobs Applied", date: "Jul 10" },
      { label: "Certificates Added", date: "Jun 30" },
      { label: "Achievements", date: "Jun 22" },
      { label: "Learning Progress", date: "Jun 15" },
    ],
    achievements: ["Resume Master", "Interview Expert", "100 Job Applications", "AI Explorer", "Consistency Streak"],
    careerLevel: "Growth Stage",
    recommendations: [
      "Learn prompt engineering",
      "Earn a product analytics certificate",
      "Refine your resume for AI-product roles",
      "Take a leadership workshop",
    ],
  });

  const value = useMemo(() => ({ profile, setProfile }), [profile]);

  return <CareerPassportContext.Provider value={value}>{children}</CareerPassportContext.Provider>;
}

export function useCareerPassport() {
  const context = useContext(CareerPassportContext);
  if (!context) {
    throw new Error("useCareerPassport must be used within a CareerPassportProvider");
  }
  return context;
}
