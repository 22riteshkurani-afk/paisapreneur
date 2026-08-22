import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Star,
  TrendingUp,
  Target,
  Rocket,
  BarChart3,
  Users,
  Zap,
  Globe,
  Award,
  Calendar,
  DollarSign,
  Clock,
  Briefcase,
  Lightbulb,
  Cog,
  MessageSquare,
  ShoppingCart,
  GraduationCap,
  Palette,
  Code,
  Settings,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const slideIn = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
  transition: { duration: 0.5 },
};

const Onboarding = ({ onComplete, error }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    experience: "",
    interests: [],
    incomeGoals: "",
    budget: "",
    timeCommitment: "",
    strengths: [],
  });
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const steps = [
    {
      key: "experience",
      title: "Business Experience Level",
      subtitle: "Tell us about your entrepreneurial journey",
      question: "What's your current business experience?",
      type: "single",
      options: [
        { value: "beginner", label: "Beginner", desc: "New to entrepreneurship" },
        { value: "freelancer", label: "Freelancer", desc: "Independent contractor" },
        { value: "creator", label: "Creator", desc: "Content creator/business" },
        { value: "startup_founder", label: "Startup Founder", desc: "Have launched businesses" },
        { value: "agency_owner", label: "Agency Owner", desc: "Run a service business" },
      ],
    },
    {
      key: "interests",
      title: "Areas of Interest",
      subtitle: "What industries excite you?",
      question: "Select all that interest you",
      type: "multiple",
      options: [
        { value: "ai_tools", label: "AI Tools", icon: Zap },
        { value: "saas", label: "SaaS", icon: Cog },
        { value: "content_business", label: "Content Business", icon: MessageSquare },
        { value: "ecommerce", label: "E-commerce", icon: ShoppingCart },
        { value: "consulting", label: "Consulting", icon: Users },
        { value: "education", label: "Education", icon: GraduationCap },
        { value: "finance", label: "Finance", icon: DollarSign },
        { value: "creator_economy", label: "Creator Economy", icon: Star },
      ],
    },
    {
      key: "incomeGoals",
      title: "Income Goals",
      subtitle: "What are you building toward?",
      question: "What's your primary income objective?",
      type: "single",
      options: [
        { value: "side_income", label: "Side Income", desc: "Supplement current income" },
        { value: "full_time_business", label: "Full-time Business", desc: "Replace your job" },
        { value: "scalable_startup", label: "Scalable Startup", desc: "Build a company" },
        { value: "agency", label: "Agency", desc: "Service-based business" },
        { value: "passive_income", label: "Passive Income", desc: "Automated revenue" },
      ],
    },
    {
      key: "budget",
      title: "Available Budget",
      subtitle: "Investment capacity for your venture",
      question: "What's your available budget to start?",
      type: "single",
      options: [
        { value: "0-5k", label: "₹0–₹5k", desc: "Bootstrap mode" },
        { value: "5k-50k", label: "₹5k–₹50k", desc: "Initial investment" },
        { value: "50k+", label: "₹50k+", desc: "Significant capital" },
      ],
    },
    {
      key: "timeCommitment",
      title: "Time Commitment",
      subtitle: "How much time can you dedicate?",
      question: "What's your available time commitment?",
      type: "single",
      options: [
        { value: "weekends", label: "Weekends", desc: "2-4 hours/weekend" },
        { value: "part_time", label: "Part-time", desc: "10-20 hours/week" },
        { value: "full_time", label: "Full-time", desc: "40+ hours/week" },
      ],
    },
    {
      key: "strengths",
      title: "Your Strengths",
      subtitle: "What are you naturally good at?",
      question: "Select your key strengths",
      type: "multiple",
      options: [
        { value: "marketing", label: "Marketing", icon: Target },
        { value: "sales", label: "Sales", icon: TrendingUp },
        { value: "design", label: "Design", icon: Palette },
        { value: "coding", label: "Coding", icon: Code },
        { value: "operations", label: "Operations", icon: Settings },
        { value: "communication", label: "Communication", icon: MessageSquare },
      ],
    },
  ];

  const handleAnswer = (value) => {
    const stepKey = steps[currentStep].key;
    if (steps[currentStep].type === "multiple") {
      setAnswers(prev => ({
        ...prev,
        [stepKey]: prev[stepKey].includes(value)
          ? prev[stepKey].filter(v => v !== value)
          : [...prev[stepKey], value]
      }));
    } else {
      setAnswers(prev => ({ ...prev, [stepKey]: value }));
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setErrorMessage("");
    } else {
      if (!fullName.trim() || !email.trim()) {
        setErrorMessage("Please enter your full name and email to save your founder profile.");
        return;
      }
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email.trim())) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }

      const profile = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        experience: answers.experience,
        interests: answers.interests,
        incomeGoals: answers.incomeGoals,
        budget: answers.budget,
        timeCommitment: answers.timeCommitment,
        strengths: answers.strengths,
      };

      onComplete(profile);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrorMessage("");
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Background Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 opacity-20 blur-3xl bg-cyan-500/20 rounded-full"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 opacity-15 blur-3xl bg-blue-500/20 rounded-full"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 opacity-18 blur-3xl bg-purple-500/20 rounded-full"></div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-400">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-cyan-400">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
      {error && (
        <div className="max-w-2xl mx-auto mt-6 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-100 text-sm">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              {...slideIn}
              className="text-center"
            >
              <motion.h1
                {...fadeInUp}
                className="text-4xl lg:text-5xl font-bold mb-4"
              >
                {steps[currentStep].title}
              </motion.h1>
              <motion.p
                {...fadeInUp}
                className="text-xl text-slate-400 mb-2"
              >
                {steps[currentStep].subtitle}
              </motion.p>
              <motion.p
                {...fadeInUp}
                className="text-lg text-slate-300 mb-12"
              >
                {steps[currentStep].question}
              </motion.p>

              <motion.div
                {...fadeInUp}
                className="grid gap-4 mb-12"
              >
                {steps[currentStep].options.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border rounded-2xl text-left hover:border-cyan-500/50 transition-all duration-300 group ${
                      (steps[currentStep].type === "multiple"
                        ? answers[steps[currentStep].key]?.includes(option.value)
                        : answers[steps[currentStep].key] === option.value)
                        ? 'border-cyan-500/50 bg-cyan-500/10'
                        : 'border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {option.icon && <option.icon className="w-6 h-6 text-cyan-400" />}
                        <div>
                          <div className="text-lg font-semibold">{option.label}</div>
                          {option.desc && <div className="text-sm text-slate-400">{option.desc}</div>}
                        </div>
                      </div>
                      {(steps[currentStep].type === "multiple"
                        ? answers[steps[currentStep].key]?.includes(option.value)
                        : answers[steps[currentStep].key] === option.value) && (
                        <Check className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </motion.div>

              {currentStep === steps.length - 1 && (
                <motion.div {...fadeInUp} className="space-y-4 mb-6 text-left">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-400">
                      Your full name
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full rounded-2xl border border-slate-700/50 bg-slate-900/80 px-4 py-3 text-slate-100 focus:border-cyan-500 outline-none"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-400">
                      Email address
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="w-full rounded-2xl border border-slate-700/50 bg-slate-900/80 px-4 py-3 text-slate-100 focus:border-cyan-500 outline-none"
                      />
                    </label>
                  </div>
                  {errorMessage && (
                    <p className="text-sm text-rose-400">{errorMessage}</p>
                  )}
                </motion.div>
              )}

              <motion.div
                {...fadeInUp}
                className="flex justify-between"
              >
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={
                    currentStep === steps.length - 1
                      ? !answers[steps[currentStep].key]?.length || !fullName.trim() || !email.trim()
                      : steps[currentStep].type === "multiple"
                      ? !answers[steps[currentStep].key]?.length
                      : !answers[steps[currentStep].key]
                  }
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
                >
                  {currentStep === steps.length - 1 ? "Complete Setup" : "Continue"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;