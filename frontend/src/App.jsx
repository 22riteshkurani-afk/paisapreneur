// App entry point that now renders the new scalable layout and routes.
import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import AICareerCoach from "./pages/AICareerCoach";
import ResumeBuilder from "./pages/ResumeBuilder";
import InterviewCoach from "./pages/InterviewCoach";
import JobFinder from "./pages/JobFinder";
import CareerPassport from "./pages/CareerPassport";
import BusinessMentor from "./pages/BusinessMentor";
import Settings from "./pages/Settings";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ai-career-coach" element={<AICareerCoach />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/interview-coach" element={<InterviewCoach />} />
        <Route path="/job-finder" element={<JobFinder />} />
        <Route path="/career-passport" element={<CareerPassport />} />
        <Route path="/business-mentor" element={<BusinessMentor />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default App;