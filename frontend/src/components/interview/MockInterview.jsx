// Mock interview chat interface for submitting answers and receiving evaluation.
function MockInterview({ answer, onAnswerChange, onSubmit, loading, feedback }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Mock Interview</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Answer as if you're in the real interview and get instant coaching.</p>
      </div>

      <textarea rows={6} value={answer} onChange={(event) => onAnswerChange(event.target.value)} placeholder="Type your answer here..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800" />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button onClick={onSubmit} disabled={loading || !answer.trim()} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400">
          {loading ? "Evaluating..." : "Evaluate Answer"}
        </button>
      </div>

      {feedback && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <div className="whitespace-pre-wrap">{feedback}</div>
        </div>
      )}
    </div>
  );
}

export default MockInterview;
