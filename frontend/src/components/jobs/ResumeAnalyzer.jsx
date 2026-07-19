// Resume analysis panel for ATS match and keyword gaps.
function ResumeAnalyzer({ resume }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Resume Matching</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Upload, analyze, and compare your resume against the selected role.</p>
      </div>

      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="font-semibold">Strengths</p>
          <p className="mt-1">{resume.strengths}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="font-semibold">Weaknesses</p>
          <p className="mt-1">{resume.weaknesses}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="font-semibold">Missing Keywords</p>
          <p className="mt-1">{resume.missingKeywords}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="font-semibold">ATS Compatibility</p>
          <p className="mt-1">{resume.ats}</p>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalyzer;
