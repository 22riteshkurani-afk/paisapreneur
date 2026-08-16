import React, { useState } from 'react';
import { UserProfile, MonetizationPath as PathType } from '../types';
import { generateMonetizationPath } from '../services/geminiService';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Target, Sparkles, Loader2, Plus, X, ArrowRight, CheckCircle2, Clock, IndianRupee, Rocket, TrendingUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { hasReachedLimit, incrementGenerations } from '../lib/limits';
import { LimitModal } from './LimitModal';

interface OnboardingProps {
  userProfile: UserProfile;
}

export const Onboarding: React.FC<OnboardingProps> = ({ userProfile }) => {
  const [step, setStep] = useState(1);
  const [incomeGoal, setIncomeGoal] = useState(userProfile.incomeGoal || 25000);
  const [skills, setSkills] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [timeAvailable, setTimeAvailable] = useState('10-20 hours/week');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<Partial<PathType> | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleAddTool = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && toolInput.trim()) {
      setTools([...tools, toolInput.trim()]);
      setToolInput('');
    }
  };

  const handleGenerate = async () => {
    if (hasReachedLimit(userProfile)) {
      setShowLimitModal(true);
      return;
    }
    setIsGenerating(true);
    setStep(4);
    try {
      const output = await generateMonetizationPath({ skills, tools, timeAvailable });
      setResult(output);
      await incrementGenerations(userProfile.uid);
    } catch (error) {
      console.error('Generation error:', error);
      setStep(3); // Go back if error
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPath = async () => {
    if (!result) return;
    try {
      const pathData: PathType = {
        userId: userProfile.uid,
        skills: result.skills || skills,
        tools: result.tools || tools,
        timeAvailable: result.timeAvailable || timeAvailable,
        recommendedService: result.recommendedService!,
        timeline: result.timeline!,
        suggestedPricing: result.suggestedPricing!,
        launchPlan: result.launchPlan,
        status: 'active',
        createdAt: Date.now()
      };
      await addDoc(collection(db, 'users', userProfile.uid, 'paths'), pathData);
      await updateDoc(doc(db, 'users', userProfile.uid), { 
        onboardingCompleted: true,
        incomeGoal: incomeGoal
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'paths');
    }
  };

  const steps = [
    { id: 1, title: 'Income Goal' },
    { id: 2, title: 'Skills & Tools' },
    { id: 3, title: 'Commitment' },
    { id: 4, title: 'Your Path' }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-12">
        {/* Logo & Progress */}
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]">
              <Rocket className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">Paisapreneur</span>
          </div>

          <div className="flex items-center gap-4 w-full max-w-md">
            {steps.map((s) => (
              <div key={s.id} className="flex-grow flex flex-col gap-2">
                <div className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  step >= s.id ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-zinc-800"
                )} />
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest text-center",
                  step === s.id ? "text-emerald-500" : "text-zinc-600"
                )}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Wizard */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-3 text-center">
                  <h2 className="text-3xl font-bold">Set Your Income Goal</h2>
                  <p className="text-zinc-400">How much independent income do you want to build per month?</p>
                </div>
                <div className="flex flex-col items-center gap-6">
                  <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 p-6 rounded-3xl w-full max-w-sm">
                    <IndianRupee className="w-8 h-8 text-emerald-500" />
                    <input
                      type="number"
                      value={incomeGoal}
                      onChange={(e) => setIncomeGoal(Number(e.target.value))}
                      className="bg-transparent text-4xl font-black outline-none w-full"
                    />
                  </div>
                  <div className="flex gap-3">
                    {[10000, 25000, 50000, 100000].map((val) => (
                      <button
                        key={val}
                        onClick={() => setIncomeGoal(val)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                          incomeGoal === val ? "bg-emerald-500 border-emerald-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        )}
                      >
                        ₹{val / 1000}k
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-5 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-[0.98]"
                >
                  Next Step <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-3 text-center">
                  <h2 className="text-3xl font-bold">Your Arsenal</h2>
                  <p className="text-zinc-400">What are you good at? What tools do you already know?</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s, i) => (
                        <span key={i} className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-2">
                          {s} <X className="w-3 h-3 cursor-pointer" onClick={() => setSkills(skills.filter((_, idx) => idx !== i))} />
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder="e.g. Video Editing, SEO, Sales"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Tools</label>
                    <div className="flex flex-wrap gap-2">
                      {tools.map((s, i) => (
                        <span key={i} className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-2">
                          {s} <X className="w-3 h-3 cursor-pointer" onClick={() => setTools(tools.filter((_, idx) => idx !== i))} />
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={toolInput}
                      onChange={(e) => setToolInput(e.target.value)}
                      onKeyDown={handleAddTool}
                      placeholder="e.g. Canva, Adobe Premiere, ChatGPT"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-grow py-5 bg-zinc-900 text-zinc-400 rounded-2xl font-black hover:bg-zinc-800 transition-all">Back</button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={skills.length === 0}
                    className={cn(
                      "flex-[2] py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all",
                      skills.length === 0 ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" : "bg-white text-black hover:bg-zinc-200"
                    )}
                  >
                    Next Step <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-3 text-center">
                  <h2 className="text-3xl font-bold">Time Commitment</h2>
                  <p className="text-zinc-400">How many hours can you realistically dedicate per week?</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {['5-10 hours/week', '10-20 hours/week', '20-40 hours/week', 'Full-time'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setTimeAvailable(time)}
                      className={cn(
                        "p-6 rounded-3xl border text-left flex items-center justify-between transition-all group",
                        timeAvailable === time ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl", timeAvailable === time ? "bg-emerald-500 text-white" : "bg-zinc-900 group-hover:bg-zinc-800")}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <span className="font-bold">{time}</span>
                      </div>
                      {timeAvailable === time && <CheckCircle2 className="w-6 h-6" />}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-grow py-5 bg-zinc-900 text-zinc-400 rounded-2xl font-black hover:bg-zinc-800 transition-all">Back</button>
                  <button
                    onClick={handleGenerate}
                    className="flex-[2] py-5 bg-emerald-500 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                  >
                    Generate My Path <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {isGenerating ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-8">
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-center space-y-3">
                      <h3 className="text-2xl font-bold">AI Engine Analyzing...</h3>
                      <p className="text-zinc-400 animate-pulse">Matching your skills with high-growth Indian markets.</p>
                    </div>
                  </div>
                ) : result ? (
                  <div className="space-y-8">
                    <div className="text-center space-y-3">
                      <h2 className="text-3xl font-bold">Your Monetization Path</h2>
                      <p className="text-zinc-400">Based on your arsenal, this is your fastest route to revenue.</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30 p-8 rounded-[2rem] space-y-8 relative overflow-hidden">
                      <div className="relative z-10 space-y-6">
                        <div>
                          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Recommended Service</p>
                          <h3 className="text-4xl font-black text-white leading-tight">{result.recommendedService}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-1">
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Timeline to Goal</p>
                            <p className="text-xl font-bold text-white flex items-center gap-2">
                              <Clock className="w-5 h-5 text-emerald-500" />
                              {result.timeline}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Suggested Pricing</p>
                            <p className="text-xl font-bold text-white flex items-center gap-2">
                              <IndianRupee className="w-5 h-5 text-emerald-500" />
                              {result.suggestedPricing}
                            </p>
                          </div>
                        </div>

                        {result.launchPlan && (
                          <div className="space-y-4 pt-4 border-t border-emerald-500/10">
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Launch Roadmap</p>
                            <div className="space-y-3">
                              {result.launchPlan.map((milestone, idx) => (
                                <div key={idx} className="flex gap-4">
                                  <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded h-fit shrink-0">
                                    {milestone.timeline}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-bold text-white">{milestone.phase}</p>
                                    <p className="text-xs text-zinc-400">{milestone.deliverables.join(", ")}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleSelectPath}
                          className="w-full py-5 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all shadow-2xl"
                        >
                          Deploy This Path <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                      <TrendingUp className="absolute -right-10 -bottom-10 w-64 h-64 text-emerald-500/5 rotate-12" />
                    </div>
                    <button onClick={() => setStep(3)} className="w-full text-zinc-500 font-bold hover:text-zinc-300 transition-colors">Try another configuration</button>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-center gap-6 text-zinc-600">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Zap className="w-4 h-4" /> No Theory
          </div>
          <div className="w-1 h-1 bg-zinc-800 rounded-full" />
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4" /> Pure Execution
          </div>
        </div>
      </div>
      <LimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
};
