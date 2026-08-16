import React, { useState, useEffect } from 'react';
import { UserProfile, WeeklyReview, BusinessOffer } from '../types';
import { generateWeeklyReview } from '../services/geminiService';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { BarChart3, Sparkles, Loader2, Send, MessageSquare, Phone, CheckCircle2, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { hasReachedLimit, incrementGenerations } from '../lib/limits';
import { LimitModal } from './LimitModal';

interface WeeklyCoachProps {
  userProfile: UserProfile;
}

export const WeeklyCoach: React.FC<WeeklyCoachProps> = ({ userProfile }) => {
  const [metrics, setMetrics] = useState({ dmsSent: 0, replies: 0, calls: 0, deals: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeOffer, setActiveOffer] = useState<BusinessOffer | null>(null);
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    const qOffer = query(collection(db, 'users', userProfile.uid, 'offers'));
    const unsubscribeOffer = onSnapshot(qOffer, (snapshot) => {
      const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessOffer));
      const active = offers.find(o => o.locked === true) || offers[0];
      if (active) setActiveOffer(active);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'offers'));

    const qReviews = query(
      collection(db, 'users', userProfile.uid, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubscribeReviews = onSnapshot(qReviews, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeeklyReview)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'reviews'));

    return () => {
      unsubscribeOffer();
      unsubscribeReviews();
    };
  }, [userProfile.uid]);

  const handleGenerate = async () => {
    if (!activeOffer) return;
    if (hasReachedLimit(userProfile)) {
      setShowLimitModal(true);
      return;
    }
    setIsGenerating(true);
    try {
      const output = await generateWeeklyReview(metrics, activeOffer.title);
      const reviewData: WeeklyReview = {
        userId: userProfile.uid,
        week: userProfile.currentWeek,
        metrics,
        aiFeedback: output.aiFeedback!,
        nextWeekPlan: output.nextWeekPlan!,
        createdAt: Date.now()
      };
      await addDoc(collection(db, 'users', userProfile.uid, 'reviews'), reviewData);
      await incrementGenerations(userProfile.uid);
      setMetrics({ dmsSent: 0, replies: 0, calls: 0, deals: 0 });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reviews');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Weekly AI Coach</h1>
        <p className="text-zinc-400 text-lg">Input your performance metrics and get a strategic review from AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-xl h-fit">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            Weekly Performance
          </h3>
          <div className="space-y-4">
            {[
              { label: 'DMs Sent', key: 'dmsSent', icon: Send, color: 'text-blue-400' },
              { label: 'Replies', key: 'replies', icon: MessageSquare, color: 'text-emerald-400' },
              { label: 'Calls', key: 'calls', icon: Phone, color: 'text-amber-400' },
              { label: 'Deals', key: 'deals', icon: CheckCircle2, color: 'text-purple-400' }
            ].map((m, i) => (
              <div key={i} className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                  <m.icon className={cn("w-3 h-3", m.color)} />
                  {m.label}
                </label>
                <input
                  type="number"
                  value={metrics[m.key as keyof typeof metrics]}
                  onChange={(e) => setMetrics({ ...metrics, [m.key]: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !activeOffer}
            className={cn(
              "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl",
              isGenerating || !activeOffer
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Performance...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Run Performance Review
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {reviews.length === 0 && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-zinc-800 rounded-3xl"
              >
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-xl font-bold text-zinc-400">Your Performance Review</h3>
                <p className="text-zinc-500 max-w-xs mt-2">Submit your weekly metrics to get a detailed AI analysis of your bottlenecks and next steps.</p>
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
                  <h3 className="text-xl font-bold text-white">AI Performance Analyst</h3>
                  <p className="text-zinc-400 animate-pulse">Calculating conversion rates and identifying bottlenecks...</p>
                </div>
              </motion.div>
            )}

            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Week {review.week} Review</h3>
                  </div>
                  <span className="text-xs text-zinc-500 font-bold uppercase">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'DMs', value: review.metrics.dmsSent, icon: Send, color: 'text-blue-400' },
                    { label: 'Replies', value: review.metrics.replies, icon: MessageSquare, color: 'text-emerald-400' },
                    { label: 'Calls', value: review.metrics.calls, icon: Phone, color: 'text-amber-400' },
                    { label: 'Deals', value: review.metrics.deals, icon: CheckCircle2, color: 'text-purple-400' }
                  ].map((m, i) => (
                    <div key={i} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-center space-y-1">
                      <p className="text-xl font-black text-white">{m.value}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">{m.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-bold text-emerald-500 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Strategic Feedback
                    </h4>
                    <div className="prose prose-invert prose-emerald max-w-none text-sm text-zinc-300 leading-relaxed">
                      <ReactMarkdown>{review.aiFeedback}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="space-y-3 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Next Week's Battle Plan
                    </h4>
                    <div className="prose prose-invert prose-emerald max-w-none text-sm text-zinc-300 leading-relaxed">
                      <ReactMarkdown>{review.nextWeekPlan}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <LimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
};
