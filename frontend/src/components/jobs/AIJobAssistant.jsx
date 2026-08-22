// AI assistant panel for job discovery questions using the shared chat endpoint.
import { useState } from "react";
import { askAI } from "../../services/api";

function AIJobAssistant() {
  const [question, setQuestion] = useState("Which job suits me?");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk() {
    if (!question.trim()) return;
    setLoading(true);
    setError("");

    try {
      const response = await askAI(question);
      setAnswer(response);
    } catch (err) {
      setError(err.message || "Could not respond right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Assistant</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Ask for role advice, resume improvements, cover letters, or interview prep.</p>
      </div>

      <textarea rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800" />

      <button onClick={handleAsk} disabled={loading} className="mt-3 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400">
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      {answer && <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">{answer}</div>}
    </div>
  );
}

export default AIJobAssistant;
