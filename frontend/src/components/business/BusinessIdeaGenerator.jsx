// Startup idea generator that produces a business concept and positioning summary.
function BusinessIdeaGenerator({ ideas, loading, onGenerate }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Business Idea Generator</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Generate ideas, validate demand, and find your niche.</p>
        </div>
        <button onClick={onGenerate} disabled={loading} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400">
          {loading ? "Thinking..." : "Generate Ideas"}
        </button>
      </div>

      <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
        {ideas.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Use the button to generate a startup concept, niche, market opportunity, and value proposition.</p>
        ) : (
          ideas.map((idea) => (
            <div key={idea} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{idea}</div>
          ))
        )}
      </div>
    </div>
  );
}

export default BusinessIdeaGenerator;
