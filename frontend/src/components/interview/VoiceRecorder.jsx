// Placeholder voice practice panel for future recording support.
function VoiceRecorder() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Voice Practice</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Practice speaking with a polished, distraction-free interface.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">Start Recording</button>
        <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">Stop Recording</button>
        <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">Replay</button>
      </div>
    </div>
  );
}

export default VoiceRecorder;
