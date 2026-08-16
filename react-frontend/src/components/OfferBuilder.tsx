import React, { useState, useEffect } from 'react';
import { UserProfile, BusinessOffer, MonetizationPath } from '../types';
import { generateOffer } from '../services/geminiService';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Package, Sparkles, Loader2, Plus, X, ArrowRight, CheckCircle2, Lock, Edit3, Trash2, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { hasReachedLimit, incrementGenerations } from '../lib/limits';
import { LimitModal } from './LimitModal';

interface OfferBuilderProps {
  userProfile: UserProfile;
}

export const OfferBuilder: React.FC<OfferBuilderProps> = ({ userProfile }) => {
  const [activePath, setActivePath] = useState<MonetizationPath | null>(null);
  const [niche, setNiche] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<Partial<BusinessOffer> | null>(null);
  const [activeOffer, setActiveOffer] = useState<BusinessOffer | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    const qPath = query(collection(db, 'users', userProfile.uid, 'paths'));
    const unsubscribePath = onSnapshot(qPath, (snapshot) => {
      const paths = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MonetizationPath));
      const active = paths.find(p => p.status === 'active');
      if (active) setActivePath(active);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'paths'));

    const qOffer = query(collection(db, 'users', userProfile.uid, 'offers'));
    const unsubscribeOffer = onSnapshot(qOffer, (snapshot) => {
      const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessOffer));
      const active = offers.find(o => o.locked === true) || offers[0];
      if (active) setActiveOffer(active);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'offers'));

    return () => {
      unsubscribePath();
      unsubscribeOffer();
    };
  }, [userProfile.uid]);

  const handleGenerate = async () => {
    if (!activePath || !niche) return;
    if (hasReachedLimit(userProfile)) {
      setShowLimitModal(true);
      return;
    }
    setIsGenerating(true);
    try {
      const output = await generateOffer(niche, activePath.recommendedService);
      setResult(output);
      await incrementGenerations(userProfile.uid);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveOffer = async () => {
    if (!result) return;
    try {
      const offerData: BusinessOffer = {
        userId: userProfile.uid,
        niche: result.niche!,
        title: result.title!,
        description: result.description!,
        tiers: result.tiers!,
        locked: false,
        createdAt: Date.now()
      };
      await addDoc(collection(db, 'users', userProfile.uid, 'offers'), offerData);
      setResult(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'offers');
    }
  };

  const handleLockOffer = async (id: string) => {
    try {
      await updateDoc(doc(db, 'users', userProfile.uid, 'offers', id), { locked: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'offers');
    }
  };

  if (!activePath) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-zinc-800 rounded-3xl">
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
          <Package className="w-8 h-8 text-zinc-700" />
        </div>
        <h3 className="text-xl font-bold text-zinc-400">Select a Path First</h3>
        <p className="text-zinc-500 max-w-xs mt-2">You need to select a monetization path before you can build an offer.</p>
        <button className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold">Go to Monetization Path</button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Build Your Offer</h1>
        <p className="text-zinc-400 text-lg">Turn your service into a high-ticket offer that clients can't refuse.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-xl h-fit">
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-zinc-300">Target Niche</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Real Estate Agents, Gym Owners"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Service</p>
            <p className="text-lg font-bold text-white">{activePath.recommendedService}</p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !niche}
            className={cn(
              "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl",
              isGenerating || !niche
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Building Offer...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Offer
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!result && !activeOffer && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-zinc-800 rounded-3xl"
              >
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
                  <Package className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-xl font-bold text-zinc-400">Create Your Offer</h3>
                <p className="text-zinc-500 max-w-xs mt-2">Define your niche and let AI structure your service tiers and deliverables.</p>
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
                  <h3 className="text-xl font-bold text-white">AI Offer Builder</h3>
                  <p className="text-zinc-400 animate-pulse">Structuring tiers and pricing...</p>
                </div>
              </motion.div>
            )}

            {(result || activeOffer) && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20">
                        {activeOffer?.locked ? 'Locked Offer' : 'Draft Offer'}
                      </span>
                      <h2 className="text-3xl font-black text-white mt-4">{result?.title || activeOffer?.title}</h2>
                      <p className="text-zinc-400 mt-2">{result?.description || activeOffer?.description}</p>
                    </div>
                    {activeOffer && !activeOffer.locked && (
                      <button 
                        onClick={() => handleLockOffer(activeOffer.id!)}
                        className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                        title="Lock Offer for 30 Days"
                      >
                        <Lock className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(result?.tiers || activeOffer?.tiers)?.map((tier, i) => (
                      <div key={i} className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
                        <div className="space-y-1">
                          <p className="text-emerald-500 text-xs font-black uppercase tracking-wider">{tier.name}</p>
                          <p className="text-2xl font-black text-white">{tier.price}</p>
                        </div>
                        <ul className="space-y-2">
                          {tier.deliverables.map((d, j) => (
                            <li key={j} className="text-xs text-zinc-400 flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {result && (
                    <button 
                      onClick={handleSaveOffer}
                      className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                    >
                      Save This Offer <ArrowRight className="w-5 h-5" />
                    </button>
                  )}

                  {activeOffer?.locked && (
                    <Link 
                      to="/landing"
                      className="w-full py-4 bg-zinc-800 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-700 transition-all border border-zinc-700"
                    >
                      Build Landing Page <Layout className="w-5 h-5 text-emerald-500" />
                    </Link>
                  )}
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
