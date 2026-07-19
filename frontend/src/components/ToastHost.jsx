import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const toast = {
        id: Date.now() + Math.random(),
        message: event.detail?.message || "Action completed",
        type: event.detail?.type || "info",
      };

      setToasts((prev) => [...prev, toast]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, 3200);
    };

    window.addEventListener("paisapreneur:toast", handleToast);
    return () => window.removeEventListener("paisapreneur:toast", handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;
        return (
          <div key={toast.id} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <Icon className={`h-4 w-4 ${toast.type === "error" ? "text-rose-500" : toast.type === "success" ? "text-emerald-500" : "text-indigo-500"}`} />
            <span className="text-sm text-slate-700 dark:text-slate-200">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}

export default ToastHost;
