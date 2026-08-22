import { useState } from "react";
import { sendChatMessage } from "../../services/api";

function BusinessAIChat({ profile }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "I can help you refine your business model, launch plan, offer, or growth strategy. Share your current challenge and I will shape a focused answer.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const context = `Business context: ${JSON.stringify(profile)}`;
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await sendChatMessage(`${context}\n\nUser question: ${input}`);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "The coach hit a snag. Please try again." }]);
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Business Coach</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Get tactical feedback for your business model and growth plan.</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`rounded-2xl px-3 py-2 text-sm ${message.role === "assistant" ? "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200" : "bg-indigo-600 text-white"}`}>
            {message.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about pricing, positioning, go-to-market, or growth" className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-800" />
        <button type="submit" disabled={loading} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-indigo-600 dark:hover:bg-indigo-500">
          {loading ? "Coaching..." : "Ask Coach"}
        </button>
      </form>
    </div>
  );
}

export default BusinessAIChat;
