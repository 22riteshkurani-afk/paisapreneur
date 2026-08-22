import { useState } from "react";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, loading, error } = useAuth();
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  const handleGoogleLogin = async () => {
    try {
      setIsLoadingGoogle(true);

      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        document.body.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential);
          } catch (err) {
            console.error("Login failed:", err);
          } finally {
            setIsLoadingGoogle(false);
          }
        },
      });

      window.google.accounts.id.renderButton(document.getElementById("google-signin-button"), {
        type: "standard",
        size: "large",
        text: "signin_with",
        theme: "dark",
      });
    } catch (err) {
      console.error("Error initializing Google Sign-In:", err);
      setIsLoadingGoogle(false);
    }
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();

    try {
      if (mode === "register") {
        await registerWithEmail(form.email, form.password, form.fullName);
      } else {
        await loginWithEmail(form.email, form.password);
      }
    } catch (err) {
      console.error("Email auth failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
          >
            Paisapreneur
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg text-gray-400"
          >
            Founder OS – Your Command Center
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-xl p-8 shadow-2xl"
        >
          <div className="mb-6 flex rounded-lg border border-gray-700 bg-gray-950 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-white text-black" : "text-gray-400"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-white text-black" : "text-gray-400"}`}
            >
              Register
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-6"
            >
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="mb-1 block text-sm text-gray-300">Full name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none ring-0 placeholder:text-gray-500"
                  placeholder="Jane Doe"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm text-gray-300">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none ring-0 placeholder:text-gray-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-300">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none ring-0 placeholder:text-gray-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Please wait..." : mode === "register" ? "Create account" : "Login with email"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-b from-gray-900 to-black text-gray-400">OR</span>
            </div>
          </div>

          <div className="mb-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoadingGoogle || loading}
              className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingGoogle || loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </div>

          <div id="google-signin-button" className="mt-4 hidden"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}
