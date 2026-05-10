import { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Play, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Onboarding from "./Onboarding";
import DashboardNew from "./DashboardNew";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

function App() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check onboarding status on mount
  useEffect(() => {
    if (user && token && !user.onboarding_completed) {
      setShowOnboarding(true);
    } else if (user && token && user.onboarding_completed) {
      // Load dashboard data
      loadDashboard();
    }
  }, [user, token]);

  const loadDashboard = async () => {
    if (!token) return;
    
    setLoading(true);
    setError("");
    try {
      // Get founder profile using email from auth user
      const response = await fetch(`/api/founder/dashboard?email=${encodeURIComponent(user.email)}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Unable to load your founder dashboard.");
      }
      
      const data = await response.json();
      setDashboardData(data);
      setShowOnboarding(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to connect to the founder OS.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleStartOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = async (profile) => {
    if (!token) return;
    
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/founder/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Unable to save your profile.");
      }
      
      const data = await response.json();
      setDashboardData(data);
      setShowOnboarding(false);
      
      // Mark onboarding as completed
      try {
        await fetch("/api/auth/complete-onboarding", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error("Failed to mark onboarding complete:", err);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save founder profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestartOnboarding = () => {
    setFounderEmail(null);
    setDashboardData(null);
    setShowOnboarding(true);
  };

  // Loading state
  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/90 p-10 shadow-2xl text-center">
          <div className="animate-pulse text-cyan-300 text-xl font-semibold">Loading your founder operating system...</div>
          <p className="mt-4 text-slate-400">This may take a moment while we prepare your progress dashboard.</p>
        </div>
      </div>
    );
  }

  // Show onboarding if user hasn't completed it
  if (showOnboarding || !dashboardData) {
    return <Onboarding onComplete={handleOnboardingComplete} error={error} />;
  }

  // Show dashboard
  if (dashboardData && !showOnboarding) {
    return (
      <DashboardNew 
        data={dashboardData} 
        onRestart={handleRestartOnboarding}
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden relative">
      {/* Background Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-0 w-96 h-96 opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
          }}
        ></div>
        <div
          className="absolute top-1/4 right-0 w-80 h-80 opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 70%)',
            transform: 'translate(50%, -50%)',
          }}
        ></div>
        <div
          className="absolute bottom-0 left-1/4 w-72 h-72 opacity-18 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.13) 0%, rgba(147, 197, 253, 0.09) 50%, transparent 70%)',
            transform: 'translate(-50%, 50%)',
          }}
        ></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-64 h-64 opacity-16 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.11) 0%, rgba(191, 219, 254, 0.07) 50%, transparent 70%)',
            transform: 'translate(50%, 50%)',
          }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-56 h-56 opacity-14 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(3, 105, 161, 0.1) 0%, rgba(125, 211, 252, 0.06) 50%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
          }}
        ></div>
      </div>
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Paisapreneur
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-cyan-400 transition-colors">
                Features
              </a>
              <a href="#community" className="text-slate-300 hover:text-cyan-400 transition-colors">
                Community
              </a>
              <a href="#pricing" className="text-slate-300 hover:text-cyan-400 transition-colors">
                Pricing
              </a>
              <a href="#login" className="text-slate-300 hover:text-cyan-400 transition-colors">
                Login
              </a>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-cyan-500/25">
                Start Building
              </button>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-300 hover:text-cyan-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-slate-300 hover:text-cyan-400">
                Features
              </a>
              <a href="#community" className="block px-3 py-2 text-slate-300 hover:text-cyan-400">
                Community
              </a>
              <a href="#pricing" className="block px-3 py-2 text-slate-300 hover:text-cyan-400">
                Pricing
              </a>
              <a href="#login" className="block px-3 py-2 text-slate-300 hover:text-cyan-400">
                Login
              </a>
              <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full font-semibold">
                Start Building
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeInUp} className="space-y-10">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                The Operating System for{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  AI Entrepreneurs
                </span>
              </h1>
              <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                Build scalable businesses with AI. Transform your skills into sustainable ventures that create lasting value and financial independence.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2" onClick={handleStartOnboarding}>
                  Start Your Journey <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" /> See How It Works
                </button>
              </div>
            </motion.div>
            <motion.div {...fadeInUp} className="relative">
              <motion.div
                className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 25px 50px -12px rgba(34, 211, 238, 0.25)",
                  transition: { duration: 0.3 },
                }}
              >
                {/* Mock Dashboard */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-cyan-400">AI Business Dashboard</h3>
                    <motion.div
                      className="flex items-center gap-2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div
                        className="w-2 h-2 bg-green-400 rounded-full"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      ></motion.div>
                      <span className="text-sm text-slate-400">Live</span>
                    </motion.div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                      animate={{
                        y: [0, -3, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                      }}
                      whileHover={{
                        borderColor: "rgba(34, 211, 238, 0.5)",
                        boxShadow: "0 10px 25px -5px rgba(34, 211, 238, 0.2)",
                        transition: { duration: 0.2 },
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-slate-400">Revenue</span>
                      </div>
                      <div className="text-2xl font-bold text-green-400">₹2.4M</div>
                      <div className="text-xs text-slate-500">+23% this month</div>
                    </motion.div>
                    <motion.div
                      className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                      animate={{
                        y: [0, -3, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1,
                      }}
                      whileHover={{
                        borderColor: "rgba(34, 211, 238, 0.5)",
                        boxShadow: "0 10px 25px -5px rgba(34, 211, 238, 0.2)",
                        transition: { duration: 0.2 },
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-slate-400">Users</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">12.5K</div>
                      <div className="text-xs text-slate-500">+180 new today</div>
                    </motion.div>
                  </div>
                  <motion.div
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                    animate={{
                      y: [0, -4, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.8,
                    }}
                    whileHover={{
                      borderColor: "rgba(34, 211, 238, 0.5)",
                      boxShadow: "0 10px 25px -5px rgba(34, 211, 238, 0.2)",
                      transition: { duration: 0.2 },
                    }}
                  >
                    <h4 className="text-sm font-semibold text-cyan-400 mb-3">AI-Generated Ideas</h4>
                    <div className="space-y-2">
                      <motion.div
                        className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="text-sm">FinTech SaaS Platform</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-slate-400">4.8</span>
                        </div>
                      </motion.div>
                      <motion.div
                        className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="text-sm">AI Content Creator</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-slate-400">4.9</span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/30"
                    animate={{
                      y: [0, -2, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.5,
                    }}
                    whileHover={{
                      borderColor: "rgba(34, 211, 238, 0.6)",
                      boxShadow: "0 15px 35px -5px rgba(34, 211, 238, 0.3)",
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-6 h-6 text-cyan-400" />
                      </motion.div>
                      <div>
                        <div className="text-sm font-semibold text-cyan-400">Generating...</div>
                        <div className="text-xs text-slate-400">New business blueprint</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              ></motion.div>
              <motion.div
                className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              ></motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <div className="text-4xl font-bold text-cyan-400 mb-2 group-hover:text-cyan-300 transition-colors">
                <AnimatedCounter end={5000} />
              </div>
              <div className="text-slate-400 text-lg">Entrepreneurs Empowered</div>
              <motion.div
                className="w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mt-4 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                viewport={{ once: true }}
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <div className="text-4xl font-bold text-cyan-400 mb-2 group-hover:text-cyan-300 transition-colors">
                <AnimatedCounter end={1200} />
              </div>
              <div className="text-slate-400 text-lg">Businesses Created</div>
              <motion.div
                className="w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mt-4 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.7 }}
                viewport={{ once: true }}
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <div className="text-4xl font-bold text-cyan-400 mb-2 group-hover:text-cyan-300 transition-colors">
                <AnimatedCounter end={85} />
              </div>
              <div className="text-slate-400 text-lg">Industries Served</div>
              <motion.div
                className="w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mt-4 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.9 }}
                viewport={{ once: true }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Traditional Careers Are Changing */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">The Evolution of Entrepreneurship</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              As AI transforms industries, entrepreneurship becomes the path to sustainable careers and meaningful work.
            </p>
          </motion.div>
          <motion.div {...stagger} className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "AI as Your Strategic Partner",
                description: "Leverage AI to amplify your expertise, not replace it. Build businesses that combine human insight with machine efficiency.",
                icon: Target,
              },
              {
                title: "Entrepreneurship as Career Strategy",
                description: "Create multiple income streams and build equity. Entrepreneurship offers control and scalability that traditional careers cannot match.",
                icon: Zap,
              },
              {
                title: "Building Lasting Value",
                description: "Create businesses that solve real problems and generate sustainable revenue. Own your economic destiny.",
                icon: Rocket,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-10 text-center hover:border-cyan-500/50 transition-all duration-300"
              >
                <item.icon className="w-14 h-14 text-cyan-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why AI Entrepreneurs Will Dominate the Future */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">The AI Advantage in Entrepreneurship</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              AI entrepreneurs have unprecedented advantages in speed, efficiency, and innovation. The future belongs to those who master this paradigm.
            </p>
          </motion.div>
          <motion.div {...stagger} className="grid md:grid-cols-2 gap-12">
            {[
              {
                title: "Accelerated Innovation",
                description: "AI enables rapid prototyping, market validation, and iteration cycles that traditional businesses cannot match.",
                icon: Zap,
              },
              {
                title: "Reduced Entry Barriers",
                description: "Launch sophisticated businesses with minimal capital. AI handles complex operations, freeing you to focus on strategy and growth.",
                icon: Rocket,
              },
              {
                title: "Scalable Intelligence",
                description: "Build businesses that grow smarter over time. AI systems learn and optimize, creating compounding advantages.",
                icon: TrendingUp,
              },
              {
                title: "Competitive Edge",
                description: "Early adoption of AI creates sustainable moats. Position yourself at the forefront of the next industrial revolution.",
                icon: Target,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-10 hover:border-cyan-500/50 transition-all duration-300"
              >
                <item.icon className="w-12 h-12 text-cyan-400 mb-6" />
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">The AI Entrepreneur Operating System</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Comprehensive tools and insights to build, validate, and scale AI-powered businesses with confidence.
            </p>
          </motion.div>
          <motion.div {...stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                title: "AI Business Design Engine",
                description: "Generate validated business models using market data, competitor analysis, and AI-driven insights.",
                icon: Zap,
              },
              {
                title: "Revenue Architecture",
                description: "Design multiple monetization strategies with pricing optimization and customer segmentation.",
                icon: BarChart3,
              },
              {
                title: "Market Intelligence Platform",
                description: "Access real-time market trends, opportunity analysis, and competitive landscape mapping.",
                icon: TrendingUp,
              },
              {
                title: "Launch Acceleration Framework",
                description: "Structured methodologies to validate ideas, build MVPs, and achieve product-market fit.",
                icon: Rocket,
              },
              {
                title: "AI Marketing Command Center",
                description: "Data-driven marketing strategies with automated optimization and performance analytics.",
                icon: Target,
              },
              {
                title: "Founder Analytics Dashboard",
                description: "Comprehensive metrics, KPIs, and insights to track progress and optimize business performance.",
                icon: BarChart3,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-300 group"
              >
                <feature.icon className="w-12 h-12 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div {...fadeInUp} className="max-w-5xl mx-auto">
            <h2 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              Democratizing{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                AI Entrepreneurship
              </span>{" "}
              for the Next Generation
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed max-w-4xl mx-auto">
              Paisapreneur is building the infrastructure that empowers skilled professionals to become successful entrepreneurs. We combine cutting-edge AI with proven business methodologies to create a platform where innovation meets execution, and ambition meets opportunity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Build Income, Freedom, and Ownership */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">Building Sustainable Business Ventures</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Transform your expertise into scalable businesses that create lasting value and financial stability.
            </p>
          </motion.div>
          <motion.div {...stagger} className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Diversified Revenue Streams",
                description: "Build multiple income sources that provide stability and growth potential beyond traditional employment.",
                icon: BarChart3,
              },
              {
                title: "Flexible Business Models",
                description: "Create ventures that adapt to your lifestyle while maintaining professional standards and market relevance.",
                icon: Globe,
              },
              {
                title: "Equity and Ownership",
                description: "Develop businesses you truly own, with the potential for significant long-term value creation and wealth building.",
                icon: Star,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-10 text-center hover:border-cyan-500/50 transition-all duration-300"
              >
                <item.icon className="w-14 h-14 text-cyan-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community */}
      <section id="community" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">The AI Entrepreneur Ecosystem</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Join a community of forward-thinking entrepreneurs building the future of business with AI.
            </p>
          </motion.div>
          <motion.div {...stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                title: "Founder Network",
                description: "Connect with experienced entrepreneurs, share insights, and collaborate on innovative ventures.",
                icon: Users,
              },
              {
                title: "Business Development Programs",
                description: "Structured programs to validate ideas, build skills, and accelerate business growth.",
                icon: Target,
              },
              {
                title: "Success Stories & Insights",
                description: "Learn from real entrepreneurs who've built successful AI-powered businesses and scaled them.",
                icon: Star,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-10 text-center hover:border-cyan-500/50 transition-all duration-300"
              >
                <item.icon className="w-14 h-14 text-cyan-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
                Paisapreneur
              </h3>
              <p className="text-slate-400">
                The operating system for AI entrepreneurs building wealth and freedom.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Forum</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Events</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-800/50">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2026 Paisapreneur. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
