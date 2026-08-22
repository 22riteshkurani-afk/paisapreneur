// Premium founder dashboard with KPI tracking, quick actions, activity, focus, and AI chat.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquareText,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { askAI } from "../services/api";

const kpiCards = [
  { label: "Resume Score", value: "91/100", subtitle: "Strong positioning", icon: BadgeCheck, accent: "#16a34a" },
  { label: "Interviews Ready", value: "12", subtitle: "Mock sessions prepared", icon: MessageSquareText, accent: "#8b5cf6" },
  { label: "Jobs Applied", value: "48", subtitle: "3 this week", icon: Search, accent: "#2563eb" },
  { label: "AI Chats", value: "128", subtitle: "Growth conversations", icon: Bot, accent: "#0f766e" },
  { label: "Revenue Goal", value: "$24.8k", subtitle: "On pace this month", icon: TrendingUp, accent: "#ea580c" },
  { label: "Daily Streak", value: "19 days", subtitle: "Consistency unlocked", icon: Zap, accent: "#db2777" },
];

const quickActions = [
  { label: "AI Career Coach", to: "/ai-career-coach", icon: Bot },
  { label: "Resume Builder", to: "/resume-builder", icon: FileText },
  { label: "Interview Coach", to: "/interview-coach", icon: MessageSquareText },
  { label: "Job Finder", to: "/job-finder", icon: Search },
  { label: "Business Mentor", to: "/business-mentor", icon: BriefcaseBusiness },
  { label: "Career Passport", to: "/career-passport", icon: BadgeCheck },
];

const recentActivity = [
  { title: "Resume analyzed", detail: "Your latest resume is now optimized for startup roles.", time: "12 min ago" },
  { title: "Interview practice completed", detail: "Leadership storytelling drill finished with strong feedback.", time: "1 hr ago" },
  { title: "Business plan generated", detail: "A new growth strategy outline is ready for review.", time: "3 hrs ago" },
  { title: "Career passport updated", detail: "Your milestones and achievements were synced successfully.", time: "Yesterday" },
];

const focusChecklist = ["Learn AI", "Apply to 5 jobs", "Improve Resume", "Practice Interview"];

function MetricCard({ label, value, subtitle, icon: Icon, accent, theme }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: "18px",
        padding: "18px",
        boxShadow: hovered ? "0 16px 36px rgba(15, 23, 42, 0.12)" : "0 10px 24px rgba(15, 23, 42, 0.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 180ms ease, box-shadow 180ms ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", display: "grid", placeItems: "center", background: `${accent}16`, color: accent }}>
          <Icon size={18} />
        </div>
        <BarChart3 size={16} color={theme.muted} />
      </div>
      <p style={{ margin: 0, color: theme.muted, fontSize: "0.9rem" }}>{label}</p>
      <h3 style={{ margin: "8px 0 4px", fontSize: "1.35rem", color: theme.text }}>{value}</h3>
      <p style={{ margin: 0, color: theme.muted, fontSize: "0.86rem" }}>{subtitle}</p>
    </div>
  );
}

function Dashboard() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => setIsDark(mediaQuery.matches);

    updateTheme();
    mediaQuery.addEventListener?.("change", updateTheme);

    return () => mediaQuery.removeEventListener?.("change", updateTheme);
  }, []);

  const theme = isDark
    ? {
        page: "#020617",
        surface: "#0f172a",
        surfaceAlt: "#111827",
        border: "#334155",
        text: "#f8fafc",
        muted: "#94a3b8",
        accent: "#818cf8",
        accentSoft: "#312e81",
      }
    : {
        page: "#f8fafc",
        surface: "#ffffff",
        surfaceAlt: "#f8fafc",
        border: "#e2e8f0",
        text: "#0f172a",
        muted: "#64748b",
        accent: "#4f46e5",
        accentSoft: "#eef2ff",
      };

  async function handleAskAI() {
    if (!prompt.trim()) {
      return;
    }

    setLoading(true);
    try {
      const result = await askAI(prompt);
      setResponse(result);
    } catch (error) {
      setResponse(error.message || "The AI service could not be reached.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", display: "grid", gap: "24px", color: theme.text }}>
      <section
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 45%, #0ea5e9 100%)",
          borderRadius: "24px",
          padding: "28px",
          color: "#ffffff",
          boxShadow: "0 18px 40px rgba(79, 70, 229, 0.22)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ maxWidth: "680px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.16)", marginBottom: "12px" }}>
              <Sparkles size={16} />
              <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>Founder workspace</span>
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: "clamp(1.6rem, 2.4vw, 2.3rem)" }}>Welcome back, Founder.</h2>
            <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.6, opacity: 0.95 }}>
              Build. Learn. Earn with AI.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.14)" }}>
            <Target size={16} />
            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Momentum mode</span>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        {kpiCards.map((card) => (
          <MetricCard key={card.label} {...card} theme={theme} />
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", alignItems: "start" }}>
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "20px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0 }}>Quick Actions</h3>
              <p style={{ margin: "4px 0 0", color: theme.muted, fontSize: "0.9rem" }}>Move faster with one tap.</p>
            </div>
            <div style={{ color: theme.accent, fontSize: "0.9rem", fontWeight: 600 }}>Ready</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    padding: "12px 14px",
                    borderRadius: "14px",
                    background: theme.surfaceAlt,
                    color: theme.text,
                    textDecoration: "none",
                    border: `1px solid ${theme.border}`,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Icon size={16} color={theme.accent} />
                    {action.label}
                  </span>
                  <ArrowRight size={16} />
                </Link>
              );
            })}
          </div>
        </div>

        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "20px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Sparkles size={18} color={theme.accent} />
            <h3 style={{ margin: 0 }}>AI Insight</h3>
          </div>
          <p style={{ margin: "0 0 10px", lineHeight: 1.7, color: theme.muted }}>
            Consistency compounds.
          </p>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            Complete today&apos;s focus to move closer to your career goals.
          </p>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 0.9fr", gap: "24px" }}>
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "20px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0 }}>Recent Activity</h3>
              <p style={{ margin: "4px 0 0", color: theme.muted, fontSize: "0.9rem" }}>Momentum from your latest wins.</p>
            </div>
            <div style={{ color: theme.accent, fontWeight: 600, fontSize: "0.9rem" }}>Live</div>
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            {recentActivity.map((item) => (
              <div key={item.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", padding: "12px 0", borderBottom: `1px solid ${theme.border}` }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{item.title}</p>
                  <p style={{ margin: "4px 0 0", color: theme.muted, fontSize: "0.9rem" }}>{item.detail}</p>
                </div>
                <span style={{ color: theme.muted, fontSize: "0.82rem", whiteSpace: "nowrap" }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "20px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Clock3 size={18} color={theme.accent} />
            <h3 style={{ margin: 0 }}>Today&apos;s Focus</h3>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            {focusChecklist.map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "12px", background: theme.surfaceAlt, border: `1px solid ${theme.border}` }}>
                <CheckCircle2 size={16} color={theme.accent} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "20px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
          <div>
            <h3 style={{ margin: 0 }}>Ask your AI coach</h3>
            <p style={{ margin: "4px 0 0", color: theme.muted, fontSize: "0.9rem" }}>The existing chat experience remains active here.</p>
          </div>
          <span style={{ color: theme.accent, fontWeight: 600 }}>Always on</span>
        </div>

        <textarea
          rows={5}
          style={{ width: "100%", border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "12px", fontSize: "1rem", background: theme.surfaceAlt, color: theme.text }}
          placeholder="Ask anything..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
          <span style={{ color: theme.muted, fontSize: "0.92rem" }}>Use it for career insights, interview prep, or business planning.</span>
          <button
            onClick={handleAskAI}
            disabled={loading}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: "999px",
              background: loading ? theme.muted : theme.accent,
              color: "#ffffff",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {loading ? "Thinking..." : "Ask AI"}
          </button>
        </div>

        <pre style={{ whiteSpace: "pre-wrap", marginTop: "16px", padding: "14px", borderRadius: "12px", background: theme.surfaceAlt, color: theme.text, border: `1px solid ${theme.border}` }}>
          {response || "Your answer will appear here."}
        </pre>
      </section>
    </div>
  );
}

export default Dashboard;
