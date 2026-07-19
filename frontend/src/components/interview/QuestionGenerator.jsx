// Question generation panel for producing tailored interview questions.
function QuestionGenerator({ questions, loading, onGenerate }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Generate Interview</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create role-specific practice questions with follow-ups.</p>
        </div>
        <button onClick={onGenerate} disabled={loading} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400">
          {loading ? "Generating..." : "Generate Questions"}
        </button>
      </div>

      <div className="space-y-2 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
        {questions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No questions generated yet. Use the button to create your practice set.</p>
        ) : (
          questions.map((question, index) => (
            <div key={`${question}-${index}`} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {index + 1}. {question}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default QuestionGenerator;
