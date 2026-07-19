// Production-ready AI Career Coach page with chat history, responsive layout, and API integration.
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Loader2, Bot } from "lucide-react";
import ChatHistory from "../components/ChatHistory";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import { sendChatMessage } from "../services/api";

function createConversation(title, firstMessage) {
  return {
    id: Date.now().toString(),
    title,
    lastMessage: firstMessage,
    messages: [{ role: "assistant", content: firstMessage }],
  };
}

function AICareerCoach() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const endRef = useRef(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  useEffect(() => {
    if (conversations.length === 0) {
      const starter = createConversation("Career launch plan", "Hi! I can help you refine your career direction, resume, interviews, and growth plan.");
      setConversations([starter]);
      setActiveConversationId(starter.id);
    }
  }, [conversations.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages.length, loading]);

  async function handleSend() {
    const trimmed = draft.trim();
    if (!trimmed || loading) return;

    setError("");
    const userMessage = { role: "user", content: trimmed };

    const updatedConversations = conversations.map((conversation) => {
      if (conversation.id !== activeConversationId) {
        return conversation;
      }

      return {
        ...conversation,
        lastMessage: trimmed,
        messages: [...conversation.messages, userMessage],
      };
    });

    setConversations(updatedConversations);
    setDraft("");
    setLoading(true);

    try {
      const response = await sendChatMessage(trimmed);
      const assistantMessage = { role: "assistant", content: response };

      const withReply = updatedConversations.map((conversation) => {
        if (conversation.id !== activeConversationId) {
          return conversation;
        }

        return {
          ...conversation,
          lastMessage: response,
          messages: [...conversation.messages, assistantMessage],
        };
      });

      setConversations(withReply);
    } catch (err) {
      setError(err.message || "Unable to reach the AI service right now.");
      setConversations(
        updatedConversations.map((conversation) => {
          if (conversation.id !== activeConversationId) {
            return conversation;
          }

          return {
            ...conversation,
            messages: [
              ...conversation.messages,
              { role: "assistant", content: "I hit an issue while responding. Please try again in a moment." },
            ],
          };
        })
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function handleNewChat() {
    const newConversation = createConversation("New coaching session", "Start a new conversation with your AI coach.");
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setDraft("");
    setError("");
  }

  const filteredConversations = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return conversations.filter((conversation) => conversation.title.toLowerCase().includes(term) || conversation.lastMessage.toLowerCase().includes(term));
  }, [conversations, searchTerm]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col gap-4 lg:flex-row">
      <div className="w-full lg:w-[320px]">
        <ChatHistory
          conversations={filteredConversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewChat={handleNewChat}
          searchTerm={searchTerm}
          onSearchChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">AI Career Coach</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Personalized guidance for your next move.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <Sparkles size={16} />
            Live coach
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4 dark:border-slate-700 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            <Bot size={16} />
            Welcome to your AI Career Coach
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Ask for resume help, interview practice, role strategy, or a business growth plan.
          </p>
        </div>

        <div className="mb-4 flex h-[440px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {activeConversation?.messages.map((message, index) => (
              <ChatMessage key={`${message.role}-${index}`} message={message} />
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
                {error}
              </div>
            )}

            <div ref={endRef} />
          </div>
        </div>

        <ChatInput
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onSend={handleSend}
          disabled={loading}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}

export default AICareerCoach;
