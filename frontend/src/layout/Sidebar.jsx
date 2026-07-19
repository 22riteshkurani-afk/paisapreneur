// Left navigation panel for the SaaS-style app experience.
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  FileText,
  MessagesSquare,
  Search,
  BadgeCheck,
  BriefcaseBusiness,
  Settings,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "AI Career Coach", path: "/ai-career-coach", icon: Bot },
  { label: "Resume Builder", path: "/resume-builder", icon: FileText },
  { label: "Interview Coach", path: "/interview-coach", icon: MessagesSquare },
  { label: "Job Finder", path: "/job-finder", icon: Search },
  { label: "Career Passport", path: "/career-passport", icon: BadgeCheck },
  { label: "Business Mentor", path: "/business-mentor", icon: BriefcaseBusiness },
  { label: "Settings", path: "/settings", icon: Settings },
];

function Sidebar() {
  return (
    <aside
      style={{
        width: "280px",
        padding: "24px 18px",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Paisapreneur</h2>
        <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
          Your AI career operating system
        </p>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "10px",
                textDecoration: "none",
                color: isActive ? "#ffffff" : "#cbd5e1",
                backgroundColor: isActive ? "#1e293b" : "transparent",
                fontWeight: 600,
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
