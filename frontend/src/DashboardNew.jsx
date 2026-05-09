import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RefreshCcw,
  BookOpen,
  Trophy,
  Rocket,
  Calendar,
  Check,
  CheckCircle,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const DashboardNew = ({ data, onRestart }) => {
  const [dashboard, setDashboard] = useState(data);
  const [journalDraft, setJournalDraft] = useState("");
  const [journalMood, setJournalMood] = useState("");
  const [journalLessons, setJournalLessons] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);
  const [journalSaving, setJournalSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    setDashboard(data);
  }, [data]);

  const toggleTask = async (taskId) => {
    if (!dashboard?.profile?.email) return;
    setTaskLoading(true);
    setActionMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/founder/task/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: dashboard.profile.email, taskId }),
      });

      if (!response.ok) throw new Error("Unable to update task status.");
      const result = await response.json();
      setDashboard((prev) => ({ ...prev, tasks: result.tasks }));
      setActionMessage("Nice. Your task progress is updated.");
    } catch (error) {
      console.error(error);
      setActionMessage("Unable to update the task right now.");
    } finally {
      setTaskLoading(false);
    }
  };

  const saveJournalEntry = async () => {
    if (!dashboard?.profile?.email || !journalDraft.trim()) return;
    setJournalSaving(true);
    setActionMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/founder/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: dashboard.profile.email,
          entry: journalDraft.trim(),
          mood: journalMood,
          lessons: journalLessons,
        }),
      });

      if (!response.ok) throw new Error("Unable to save journal entry.");
      const result = await response.json();
      setDashboard((prev) => ({ ...prev, journal: result.journal }));
      setJournalDraft("");
      setJournalMood("");
      setJournalLessons("");
      setActionMessage("Journal entry saved.");
    } catch (error) {
      console.error(error);
      setActionMessage("Unable to save your journal entry.");
    } finally {
      setJournalSaving(false);
    }
  };

  const score = dashboard?.progress?.executionScore ?? dashboard?.founderScore ?? 72;
  const readiness = dashboard?.progress?.launchReadiness ?? dashboard?.readinessScore ?? 58;
  const streak = dashboard?.progress?.founderStreak ?? dashboard?.progress?.currentStreak ?? 2;
  const stage = dashboard?.progress?.maturityStage ?? dashboard?.progress?.businessMaturityStage ?? "Emerging";
  const totalTasks = dashboard?.tasks?.length ?? 0;
  const completedTasks = dashboard?.tasks?.filter((task) => task.completed).length ?? 0;
  const taskCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const topTasks = dashboard?.tasks?.filter((task) => !task.completed).slice(0, 3) ?? [];
  const nextMilestone = dashboard?.milestones?.find((milestone) => !milestone.completed);

  const coachingLines = [
    `You are building momentum in a ${stage} venture. Keep the next milestone visible.`,
    topTasks.length
      ? `Focus on ${topTasks.length} priority task${topTasks.length > 1 ? "s" : ""} to keep your streak moving.`
      : "All core tasks are complete — plan the next launch step.",
    readiness < 70
      ? "Strengthen your launch readiness before investing more energy in new ideas."
      : "Your launch readiness is strong enough to move confidently toward execution.",
  ];

  const progressCards = [
    {
      title: "Execution Score",
      value: `${score}%`,
      description: "How closely you are following your founder rhythm.",
      icon: Trophy,
      color: "text-cyan-400",
    },
    {
      title: "Launch Readiness",
      value: `${readiness}%`,
      description: "How prepared your venture is for the next step.",
      icon: Rocket,
      color: "text-emerald-400",
    },
    {
      title: "Founder Streak",
      value: `${streak} days`,
      description: "Consistent progress turns ideas into traction.",
      icon: Calendar,
      color: "text-violet-400",
    },
    {
      title: "Task Completion",
      value: `${taskCompletionRate}%`,
      description: "Your weekly execution rate for core tasks.",
      icon: CheckCircle,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_25%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(124,58,237,0.12),_transparent_20%)]" />

      <header className="relative z-10 border-b border-slate-800/70 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400/80">Founder OS</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2">Welcome back, {dashboard?.profile?.name || "Founder"}</h1>
            <p className="mt-2 text-slate-400 max-w-2xl">
              Your founder operating system keeps your venture, tasks, journal, and progress aligned in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onRestart}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/85 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition"
            >
              <RefreshCcw className="w-4 h-4" /> Restart onboarding
            </button>
            <div className="rounded-full bg-slate-900/90 px-4 py-2 text-sm text-slate-300 border border-slate-700/50">
              {dashboard?.profile?.email}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <motion.div className="rounded-3xl border border-slate-800/70 bg-slate-900/85 p-8 shadow-2xl" {...fadeInUp}>
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <p className="uppercase tracking-[0.3em] text-slate-400 text-xs">Momentum</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">Keep execution moving forward.</h2>
                  <p className="mt-3 text-slate-400 max-w-2xl">
                    Focus on the next three highest-impact tasks and use the founder journal to turn activity into clarity.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950/90 border border-slate-800/70 px-5 py-4 text-sm text-slate-300">
                  <div className="font-semibold text-white">Active ventures</div>
                  <div className="mt-1 text-lg text-cyan-300">{dashboard?.ventures?.length || 0}</div>
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {progressCards.map((card) => (
                  <div key={card.title} className="rounded-3xl border border-slate-800/70 bg-slate-950/70 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-400">{card.title}</p>
                        <p className={`mt-3 text-3xl font-semibold ${card.color}`}>{card.value}</p>
                      </div>
                      <card.icon className={`w-8 h-8 ${card.color}`} />
                    </div>
                    <p className="mt-4 text-sm text-slate-500">{card.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
              <motion.section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-8 shadow-2xl" {...fadeInUp}>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="uppercase tracking-[0.3em] text-slate-400 text-xs">Today</p>
                    <h3 className="text-2xl font-semibold text-white">Priority actions</h3>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-950/85 px-4 py-2 text-xs font-semibold text-slate-200">
                    {completedTasks}/{totalTasks} complete
                  </span>
                </div>
                <div className="space-y-4">
                  {topTasks.length ? (
                    topTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        disabled={taskLoading}
                        className={`w-full text-left rounded-3xl border p-5 transition ${
                          task.completed
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : "border-slate-800/70 bg-slate-950/80 hover:border-cyan-500/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-white">{task.title}</p>
                            <p className="mt-2 text-sm text-slate-400">{task.description}</p>
                          </div>
                          <div className={`flex items-center gap-2 text-xs uppercase tracking-[0.24em] font-semibold ${task.completed ? "text-emerald-300" : "text-slate-400"}`}>
                            {task.completed ? "Done" : "Mark complete"}
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-6 text-slate-300">
                      <p className="font-semibold text-white">No urgent tasks right now.</p>
                      <p className="mt-2 text-sm text-slate-400">Use your journal or milestones to define the next move.</p>
                    </div>
                  )}
                </div>
              </motion.section>

              <motion.section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-8 shadow-2xl" {...fadeInUp}>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="uppercase tracking-[0.3em] text-slate-400 text-xs">Coach</p>
                    <h3 className="text-2xl font-semibold text-white">Founder's note</h3>
                  </div>
                  <span className="rounded-full bg-slate-950/85 px-3 py-1 text-xs text-slate-300">{nextMilestone ? "Next milestone" : "Keep the pace"}</span>
                </div>
                <div className="space-y-4">
                  {coachingLines.map((line, index) => (
                    <div key={index} className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-4">
                      <p className="text-sm text-slate-300">{line}</p>
                    </div>
                  ))}
                  {nextMilestone && (
                    <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-4">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Upcoming milestone</p>
                      <p className="mt-2 font-semibold text-white">{nextMilestone.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{nextMilestone.description}</p>
                    </div>
                  )}
                </div>
              </motion.section>
            </div>
          </div>

          <aside className="space-y-6">
            <motion.section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-8 shadow-2xl" {...fadeInUp}>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="uppercase tracking-[0.3em] text-slate-400 text-xs">Journal</p>
                  <h3 className="text-2xl font-semibold text-white">Capture reflection</h3>
                </div>
                <span className="rounded-full bg-slate-950/85 px-3 py-1 text-xs text-slate-300">{dashboard?.journal?.length || 0} entries</span>
              </div>
              <div className="space-y-4">
                <label className="text-sm text-slate-400">Mood / energy</label>
                <input
                  value={journalMood}
                  onChange={(e) => setJournalMood(e.target.value)}
                  placeholder="Focused, energized, cautious"
                  className="w-full rounded-3xl border border-slate-800/70 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-500 outline-none"
                />
                <label className="text-sm text-slate-400">Key lesson</label>
                <input
                  value={journalLessons}
                  onChange={(e) => setJournalLessons(e.target.value)}
                  placeholder="What did you learn today?"
                  className="w-full rounded-3xl border border-slate-800/70 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-500 outline-none"
                />
                <label className="text-sm text-slate-400">Reflection note</label>
                <textarea
                  value={journalDraft}
                  onChange={(e) => setJournalDraft(e.target.value)}
                  rows={5}
                  placeholder="Write a quick founder update..."
                  className="w-full rounded-3xl border border-slate-800/70 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-500 outline-none"
                />
                <button
                  onClick={saveJournalEntry}
                  disabled={journalSaving || !journalDraft.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
                >
                  <BookOpen className="w-4 h-4" />
                  Save entry
                </button>
                {actionMessage && <p className="text-sm text-slate-400">{actionMessage}</p>}
              </div>
            </motion.section>

            <motion.section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-8 shadow-2xl" {...fadeInUp}>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="uppercase tracking-[0.3em] text-slate-400 text-xs">Ventures</p>
                  <h3 className="text-2xl font-semibold text-white">Active ideas</h3>
                </div>
                <span className="rounded-full bg-slate-950/85 px-3 py-1 text-xs text-slate-300">{dashboard?.ventures?.length || 0}</span>
              </div>
              <div className="space-y-4">
                {dashboard?.ventures?.map((venture) => (
                  <div key={venture.id} className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{venture.name}</p>
                        <p className="text-sm text-slate-400">{venture.stage} · {venture.category}</p>
                      </div>
                      <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-300">{venture.status}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{venture.description}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default DashboardNew;
