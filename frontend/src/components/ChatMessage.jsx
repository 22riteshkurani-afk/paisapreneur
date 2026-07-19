// Reusable chat bubble component for assistant and user messages.
import { motion } from "framer-motion";

function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-7">
          {message.content}
        </div>
      </div>
    </motion.div>
  );
}

export default ChatMessage;
