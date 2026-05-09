/* ═══════════════════════════════════════════════════════════════════════════
   Paisapreneur AI v2 — Business Blueprint Engine
   ═══════════════════════════════════════════════════════════════════════════ */

const $ = (sel) => document.querySelector(sel);
const industryInput = $("#industry-input");
const generateBtn = $("#generate-btn");
const loadingEl = $("#loading");
const blueprintEl = $("#blueprint");

let currentBlueprint = null;

// ── Toast System ───────────────────────────────────────────────────────────
function showToast(message, type = "info") {
  const container = document.querySelector(".toast-container") || createToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("removing");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function createToastContainer() {
  const c = document.createElement("div");
  c.className = "toast-container";
  document.body.appendChild(c);
  return c;
}

// ── Tag Click ──────────────────────────────────────────────────────────────
document.querySelectorAll(".tag").forEach((tag) => {
  tag.addEventListener("click", () => {
    industryInput.value = tag.dataset.value || tag.textContent.replace(/^[^\w]+/, '').trim();
    industryInput.focus();
  });
});

// ── Generate Blueprint ─────────────────────────────────────────────────────
async function generateBlueprint() {
  const industry = industryInput.value.trim();

  if (!industry) {
    showToast("Please enter a niche or interest!", "error");
    industryInput.focus();
    return;
  }

  if (industry.length < 2) {
    showToast("Must be at least 2 characters.", "error");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span class="spinner"></span> Building Blueprint...';
  loadingEl.classList.add("active");
  blueprintEl.classList.remove("visible");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(`/generate?industry=${encodeURIComponent(industry)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || `Request failed (${res.status})`);
    }

    const data = await res.json();
    currentBlueprint = data;
    renderBlueprint(data);
    showToast("Blueprint generated!", "success");

  } catch (err) {
    if (err.name === "AbortError") {
      showToast("Request timed out. Try again.", "error");
    } else {
      showToast(err.message || "Something went wrong.", "error");
    }
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = "⚡ Generate Blueprint";
    loadingEl.classList.remove("active");
  }
}

// ── Render Blueprint ───────────────────────────────────────────────────────
function renderBlueprint(d) {
  // Header
  $("#bp-name").textContent = d.business_name;
  $("#bp-tagline").textContent = d.tagline;

  // Business Model
  $("#bp-model").textContent = d.business_model;
  $("#bp-value").textContent = d.value_proposition;
  $("#bp-audience").textContent = d.target_audience;
  $("#bp-problem").textContent = d.problem_solved;
  $("#bp-solution").textContent = d.solution;

  // Revenue
  const tbody = $("#revenue-body");
  tbody.innerHTML = "";
  (d.revenue_streams || []).forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.source}</td>
      <td>${s.model}</td>
      <td class="revenue-amount">${s.expected_monthly}</td>
    `;
    tbody.appendChild(tr);
  });
  $("#bp-pricing").textContent = d.pricing_strategy;
  $("#bp-breakeven").textContent = d.break_even_estimate;

  // Acquisition
  const channels = $("#bp-channels");
  channels.innerHTML = "";
  (d.acquisition_channels || []).forEach((ch, i) => {
    const div = document.createElement("div");
    div.className = "channel-pill";
    div.innerHTML = `<span class="channel-pill__num">${i + 1}</span><span>${ch}</span>`;
    channels.appendChild(div);
  });
  $("#bp-first100").textContent = d.first_100_customers;
  $("#bp-hack").textContent = d.growth_hack;

  // Timeline
  const timeline = $("#bp-timeline");
  timeline.innerHTML = "";
  (d.timeline || []).forEach((week) => {
    const div = document.createElement("div");
    div.className = "timeline-week";
    div.innerHTML = `
      <div class="timeline-week__content">
        <div class="timeline-week__label">${week.week}</div>
        <ul class="timeline-week__tasks">
          ${(week.tasks || []).map((t) => `<li class="timeline-week__task">${t}</li>`).join("")}
        </ul>
      </div>
    `;
    timeline.appendChild(div);
  });

  // Tools
  const tools = $("#bp-tools");
  tools.innerHTML = "";
  Object.entries(d.tools || {}).forEach(([cat, tool]) => {
    const div = document.createElement("div");
    div.className = "tool-item";
    div.innerHTML = `
      <div class="tool-item__category">${cat}</div>
      <div class="tool-item__name">${tool}</div>
    `;
    tools.appendChild(div);
  });

  // Cost & Risk
  $("#bp-cost").textContent = d.estimated_startup_cost;
  $("#bp-risk").textContent = d.key_risk;
  $("#bp-mitigation").textContent = d.mitigation;

  blueprintEl.classList.add("visible");

  // Scroll to result
  setTimeout(() => {
    blueprintEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 200);
}

// ── Download JSON ──────────────────────────────────────────────────────────
function downloadJSON() {
  if (!currentBlueprint) return;
  const blob = new Blob([JSON.stringify(currentBlueprint, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${currentBlueprint.business_name || "blueprint"}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Blueprint downloaded!", "success");
}

// ── Copy ───────────────────────────────────────────────────────────────────
function copyBlueprint() {
  if (!currentBlueprint) return;
  const d = currentBlueprint;
  const text = `🚀 ${d.business_name} — ${d.tagline}

📋 BUSINESS MODEL
${d.business_model}

💡 VALUE PROPOSITION
${d.value_proposition}

🎯 TARGET AUDIENCE: ${d.target_audience}
❌ PROBLEM: ${d.problem_solved}
✅ SOLUTION: ${d.solution}

💰 REVENUE STREAMS
${(d.revenue_streams || []).map((s) => `• ${s.source}: ${s.model} (${s.expected_monthly}/mo)`).join("\n")}
Pricing: ${d.pricing_strategy}
Break-even: ${d.break_even_estimate}

📢 ACQUISITION
${(d.acquisition_channels || []).map((c, i) => `${i + 1}. ${c}`).join("\n")}
First 100: ${d.first_100_customers}
Growth Hack: ${d.growth_hack}

📅 30-DAY TIMELINE
${(d.timeline || []).map((w) => `${w.week}:\n${(w.tasks || []).map((t) => `  ▸ ${t}`).join("\n")}`).join("\n\n")}

🛠️ TOOLS
${Object.entries(d.tools || {}).map(([k, v]) => `• ${k}: ${v}`).join("\n")}

💸 Startup Cost: ${d.estimated_startup_cost}
⚠️ Key Risk: ${d.key_risk}
🛡️ Mitigation: ${d.mitigation}

Built with Paisapreneur AI ⚡`;

  navigator.clipboard.writeText(text)
    .then(() => showToast("Copied to clipboard!", "success"))
    .catch(() => showToast("Failed to copy.", "error"));
}

// ── Share ───────────────────────────────────────────────────────────────────
function shareBlueprint() {
  if (!currentBlueprint) return;
  const d = currentBlueprint;
  const text = `🚀 ${d.business_name} — ${d.tagline}

📋 ${d.business_model}
🎯 ${d.target_audience}
💰 ${(d.revenue_streams || []).map((s) => s.expected_monthly).join(" + ")}/mo potential

Built with Paisapreneur AI ⚡`;

  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

function payNow() {
  showToast("Premium features coming soon! 🚀", "info");
}

// ── Keyboard ───────────────────────────────────────────────────────────────
industryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateBlueprint();
});
