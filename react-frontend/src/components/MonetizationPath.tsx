import React, { useState, useEffect } from 'react';
import { UserProfile, MonetizationPath as PathType } from '../types';
import { generateMonetizationPath } from '../services/geminiService';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Target, Sparkles, Loader2, Plus, X, ArrowRight, CheckCircle2, Clock, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { hasReachedLimit, incrementGenerations } from '../lib/limits';
import { LimitModal } from './LimitModal';

interface MonetizationPathProps {
  userProfile: UserProfile;
}

export const MonetizationPath: React.FC<MonetizationPathProps> = ({ userProfile }) => {
  const [skills, setSkills] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [timeAvailable, setTimeAvailable] = useState('10-20 hours/week');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<Partial<PathType> | null>(null);
  const [activePath, setActivePath] = useState<PathType | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users', userProfile.uid, 'paths'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paths = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PathType));
      const active = paths.find(p => p.status === 'active');
      if (active) setActivePath(active);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'paths'));
    return () => unsubscribe();
  }, [userProfile.uid]);

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
    try {
      const output = await generateMonetizationPath({ skills, tools, timeAvailable });
      setResult(output);
      await incrementGenerations(userProfile.uid);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPath = async () => {
    if (!result) return;
    try {
      const pathData: PathType = {
        userId: userProfile.uid,
        skills: result.skills!,
        tools: result.tools!,
        timeAvailable: result.timeAvailable!,
        recommendedService: result.recommendedService!,
        timeline: result.timeline!,
        suggestedPricing: result.suggestedPricing!,
        launchPlan: result.launchPlan,
        status: 'active',
        createdAt: Date.now()
      };
      await addDoc(collection(db, 'users', userProfile.uid, 'paths'), pathData);
      await updateDoc(doc(db, 'users', userProfile.uid), { onboardingCompleted: true });
      setResult(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'paths');
    }
  };

  if (activePath) {
    return (
      <div className="space-y-8">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Active Monetization Path</h2>
              <p className="text-emerald-500/70 font-medium">You are currently executing this strategy.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-b border-emerald-500/10 pb-8">
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Recommended Service</p>
              <p className="text-xl font-bold text-white">{activePath.recommendedService}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Income Timeline</p>
              <div className="flex items-center gap-2 text-xl font-bold text-white">
                <Clock className="w-5 h-5 text-emerald-500" />
                {activePath.timeline}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Suggested Pricing</p>
              <div className="flex items-center gap-2 text-xl font-bold text-white">
                <IndianRupee className="w-5 h-5 text-emerald-500" />
                {activePath.suggestedPricing}
              </div>
            </div>
          </div>

          {activePath.launchPlan && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                Launch Roadmap
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePath.launchPlan.map((milestone, idx) => (
                  <div key={idx} className="bg-zinc-950/50 border border-emerald-500/10 p-6 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                        {milestone.timeline}
                      </span>
                      <h4 className="font-bold text-white text-lg">{milestone.phase}</h4>
                    </div>
                    <ul className="space-y-2">
                      {milestone.deliverables.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={() => setActivePath(null)}
          className="text-zinc-500 hover:text-zinc-300 text-sm font-bold underline"
        >
          Change Monetization Path
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Find Your Income Path</h1>
        <p className="text-zinc-400 text-lg">Input your strengths and let AI find your most profitable service.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-xl h-fit">
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-zinc-300">Your Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((s, i) => (
                <span key={i} className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                  {s} <X className="w-3 h-3 cursor-pointer" onClick={() => setSkills(skills.filter((_, idx) => idx !== i))} />
                </span>
              ))}
            </div>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="Type and press Enter (e.g. Copywriting, Design)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-zinc-300">Tools You Know</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tools.map((s, i) => (
                <span key={i} className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                  {s} <X className="w-3 h-3 cursor-pointer" onClick={() => setTools(tools.filter((_, idx) => idx !== i))} />
                </span>
              ))}
            </div>
            <input
              type="text"
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              onKeyDown={handleAddTool}
              placeholder="Type and press Enter (e.g. Canva, ChatGPT)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-zinc-300">Time Available</label>
            <select
              value={timeAvailable}
              onChange={(e) => setTimeAvailable(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
            >
              <option>5-10 hours/week</option>
              <option>10-20 hours/week</option>
              <option>20-40 hours/week</option>
              <option>Full-time</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || (skills.length === 0)}
            className={cn(
              "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl",
              isGenerating || (skills.length === 0)
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Path...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Find My Path
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!result && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-zinc-800 rounded-3xl"
              >
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-xl font-bold text-zinc-400">Your Future Starts Here</h3>
                <p className="text-zinc-500 max-w-xs mt-2">Fill in your skills and tools to see your recommended monetization path.</p>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-8 p-10 bg-zinc-900/20 border border-zinc-800 rounded-3xl"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-emerald-500 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-white">AI Engine is Processing</h3>
                  <p className="text-zinc-400 animate-pulse">Matching skills with market demand...</p>
                </div>
              </motion.div>
            )}

            {result && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30 p-8 rounded-3xl relative overflow-hidden">
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="bg-emerald-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">Recommended Path</span>
                      <Sparkles className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-1">Recommended Service</p>
                      <h2 className="text-3xl font-black text-white">{result.recommendedService}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-4">
                      <div className="space-y-1">
                        <p className="text-zinc-500 text-xs font-bold uppercase">Timeline to ₹25k</p>
                        <p className="text-xl font-bold text-white">{result.timeline}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-zinc-500 text-xs font-bold uppercase">Suggested Pricing</p>
                        <p className="text-xl font-bold text-white">{result.suggestedPricing}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleSelectPath}
                      className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                    >
                      Select This Path <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <LimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
};
