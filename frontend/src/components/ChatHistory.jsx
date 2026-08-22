// Sidebar list of previous conversations with a simple search and new chat action.
function ChatHistory({ conversations, activeConversationId, onSelectConversation, onNewChat, searchTerm, onSearchChange }) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Chat history</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Your coaching conversations</p>
        </div>
        <button
          type="button"
          onClick={onNewChat}
          className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300"
        >
          New chat
        </button>
      </div>

      <input
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search conversations"
        className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
      />

      <div className="flex-1 space-y-2 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No conversations yet.</p>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                activeConversationId === conversation.id
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300"
                  : "border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <div className="truncate text-sm font-semibold">{conversation.title}</div>
              <div className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{conversation.lastMessage}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatHistory;
