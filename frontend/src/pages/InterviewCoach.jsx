// Premium interview preparation experience with setup, question generation, mock interview feedback, and analytics.
import { useEffect, useState } from "react";
import { BrainCircuit, Sparkles } from "lucide-react";
import InterviewSetup from "../components/interview/InterviewSetup";
import QuestionGenerator from "../components/interview/QuestionGenerator";
import MockInterview from "../components/interview/MockInterview";
import PerformanceCards from "../components/interview/PerformanceCards";
import InterviewHistory from "../components/interview/InterviewHistory";
import VoiceRecorder from "../components/interview/VoiceRecorder";
import QuickInterviewModes from "../components/interview/QuickInterviewModes";
import { interviewApi } from "../services/apiService";

function InterviewCoach() {
  const [setup, setSetup] = useState({ role: "Software Engineer", company: "Microsoft", level: "Mid-Level", type: "Behavioral" });
  const [questions, setQuestions] = useState([]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await interviewApi.history();
        if (response.data?.history?.length) {
          setQuestions(response.data.history.map((entry) => entry.prompt));
        }
      } catch (err) {
        console.error("History load failed", err);
      }
    };

    loadHistory();
  }, []);

  async function handleGenerateQuestions() {
    setLoading(true);
    setError("");
    setFeedback("");

    try {
      const prompt = `Create 10 interview questions for a ${setup.level} ${setup.role} interviewing at ${setup.company}. Include company-specific questions, STAR questions, and follow-up questions for a ${setup.type} interview.`;
      const response = await interviewApi.generateQuestions({ setup });
      const parsedQuestions = (response.data?.questions || []).map((item) => item.trim()).filter(Boolean);
      setQuestions(parsedQuestions.length ? parsedQuestions : [response.data?.message || "No questions generated."]);
    } catch (err) {
      setError(err.message || "Could not generate questions right now.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEvaluateAnswer() {
    setLoading(true);
    setError("");

    try {
      const prompt = `Evaluate this interview answer for a ${setup.role} interview at ${setup.company}. Return: Rating out of 10, Grammar, Confidence, Professionalism, Technical accuracy, and a better answer. Answer: ${answer}`;
      const response = await interviewApi.evaluateAnswer({ setup, answer });
      setFeedback(response.data?.feedback || response.data?.message || "Feedback ready.");
    } catch (err) {
      setError(err.message || "Could not evaluate the answer right now.");
    } finally {
      setLoading(false);
    }
  }

  function handleQuickMode(mode) {
    setSetup((prev) => ({ ...prev, role: mode, company: mode === "Startup" ? "Startup" : "Target Company" }));
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-violet-900 to-indigo-600 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-200">
              <BrainCircuit size={16} />
              AI Interview Coach
            </div>
            <h2 className="text-2xl font-semibold">Prepare like a top-tier candidate.</h2>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">Generate tailored questions, simulate interviews, and improve your delivery with AI coaching.</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-sm text-indigo-100">Practice ready</p>
            <p className="text-lg font-semibold">Interview mode active</p>
          </div>
        </div>
      </div>

      <InterviewSetup setup={setup} onChange={(field, value) => setSetup((prev) => ({ ...prev, [field]: value }))} />
      <QuickInterviewModes onSelect={handleQuickMode} />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <QuestionGenerator questions={questions} loading={loading} onGenerate={handleGenerateQuestions} />
          <MockInterview answer={answer} onAnswerChange={setAnswer} onSubmit={handleEvaluateAnswer} loading={loading} feedback={feedback} />
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">{error}</div>}
        </div>

        <div className="space-y-6">
          <VoiceRecorder />
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <Sparkles size={18} className="text-indigo-600" />
              Performance Dashboard
            </div>
            <PerformanceCards />
          </div>
          <InterviewHistory />
        </div>
      </div>
    </div>
  );
}

export default InterviewCoach;
