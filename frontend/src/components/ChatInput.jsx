// Reusable composer for sending chat messages with keyboard shortcuts.
function ChatInput({ value, onChange, onSend, disabled, onKeyDown }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <textarea
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        rows={3}
        disabled={disabled}
        placeholder="Ask about your career, interview prep, or growth plan..."
        className="w-full resize-none border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">Press Enter to send • Shift+Enter for a new line</p>
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {disabled ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
