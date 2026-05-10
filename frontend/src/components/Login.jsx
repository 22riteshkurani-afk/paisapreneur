import { useState } from "react";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { loginWithGoogle, loading, error } = useAuth();
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoadingGoogle(true);
      
      // Load Google Sign-In script if not already loaded
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        document.body.appendChild(script);
        
        // Wait for script to load
        await new Promise(resolve => {
          script.onload = resolve;
        });
      }

      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
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

      // Render the Google button
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          type: "standard",
          size: "large",
          text: "signin_with",
          theme: "dark",
        }
      );
    } catch (err) {
      console.error("Error initializing Google Sign-In:", err);
      setIsLoadingGoogle(false);
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
        {/* Logo/Branding */}
        <div className="text-center mb-12">
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-sm text-gray-500 mt-2"
          >
            Think clearly. Execute consistently. Build wealth.
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Sign In to Your Founder OS
          </h2>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-6"
            >
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Google Sign-In Button */}
          <div className="mb-6">
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
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </div>

          {/* Or Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-b from-gray-900 to-black text-gray-400">
                OR
              </span>
            </div>
          </div>

          {/* Additional Context */}
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Sign in instantly with your Google account</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>No password required – secure & passwordless</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Your data is encrypted and secure</span>
            </div>
          </div>
        </motion.div>

        {/* Hidden Google Sign-In Button Container */}
        <div id="google-signin-button" className="mt-8 flex justify-center"></div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 text-center text-xs text-gray-500"
        >
          <p>
            By signing in, you agree to our{" "}
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            {" "}and{" "}
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
