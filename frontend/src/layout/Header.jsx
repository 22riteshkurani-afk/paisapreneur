// Top header used across the main app shell to display the current section title.
import { Sparkles } from "lucide-react";

function Header({ title }) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 32px",
        borderBottom: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Paisapreneur workspace</p>
        <h1 style={{ margin: "4px 0 0", fontSize: "1.35rem" }}>{title}</h1>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          borderRadius: "999px",
          backgroundColor: "#eef2ff",
          color: "#4338ca",
          fontWeight: 600,
        }}
      >
        <Sparkles size={18} />
        <span>AI-powered growth</span>
      </div>
    </header>
  );
}

export default Header;
