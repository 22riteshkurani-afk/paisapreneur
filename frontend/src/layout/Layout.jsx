// Reusable app shell with a sidebar, header, and main content area for all pages.
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const pageTitles = {
  "/": "Dashboard",
  "/ai-career-coach": "AI Career Coach",
  "/resume-builder": "Resume Builder",
  "/interview-coach": "Interview Coach",
  "/job-finder": "Job Finder",
  "/career-passport": "Career Passport",
  "/business-mentor": "Business Mentor",
  "/settings": "Settings",
};

function Layout({ children }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", color: "#0f172a" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title={title} />
        <main style={{ flex: 1, padding: "24px 32px 32px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
