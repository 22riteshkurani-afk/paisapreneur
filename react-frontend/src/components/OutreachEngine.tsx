import React, { useState, useEffect } from 'react';
import { UserProfile, BusinessOffer } from '../types';
import { generateOutreachScripts, researchLead, generatePersonalizedScripts, generateOutreachImage, generateOutreachVideo, textToSpeech } from '../services/geminiService';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Send, Sparkles, Loader2, Copy, CheckCircle2, MessageSquare, Mail, RefreshCw, Search, User, Image as ImageIcon, Video, Volume2, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { hasReachedLimit, incrementGenerations } from '../lib/limits';
import { LimitModal } from './LimitModal';

interface OutreachEngineProps {
  userProfile: UserProfile;
}

export const OutreachEngine: React.FC<OutreachEngineProps> = ({ userProfile }) => {
  const [activeOffer, setActiveOffer] = useState<BusinessOffer | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scripts, setScripts] = useState<{ dm: string, email: string, followUp: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadResearch, setLeadResearch] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [visualAsset, setVisualAsset] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    const qOffer = query(collection(db, 'users', userProfile.uid, 'offers'));
    const unsubscribeOffer = onSnapshot(qOffer, (snapshot) => {
      const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessOffer));
      const active = offers.find(o => o.locked === true) || offers[0];
      if (active) setActiveOffer(active);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'offers'));

    return () => unsubscribeOffer();
  }, [userProfile.uid]);

  const handleGenerate = async () => {
    if (!activeOffer) return;
    if (hasReachedLimit(userProfile)) {
      setShowLimitModal(true);
      return;
    }
    setIsGenerating(true);
    try {
      let output;
      if (leadResearch) {
        output = await generatePersonalizedScripts(leadResearch, activeOffer);
      } else {
        output = await generateOutreachScripts(activeOffer);
      }
      setScripts(output);
      await incrementGenerations(userProfile.uid);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResearch = async () => {
    if (!leadName || !activeOffer) return;
    if (hasReachedLimit(userProfile)) {
      setShowLimitModal(true);
      return;
    }
    setIsResearching(true);
    try {
      const research = await researchLead(leadName, activeOffer);
      setLeadResearch(research);
      await incrementGenerations(userProfile.uid);
    } catch (error) {
      console.error('Research error:', error);
    } finally {
      setIsResearching(false);
    }
  };

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleGenerateVisual = async (type: 'image' | 'video') => {
    if (!activeOffer) return;
    
    if (!hasApiKey) {
      await handleSelectKey();
      return;
    }

    if (hasReachedLimit(userProfile)) {
      setShowLimitModal(true);
      return;
    }
    setIsGeneratingVisual(true);
    try {
      const prompt = `A professional and eye-catching ${type === 'image' ? 'outreach image' : 'short video'} for a ${activeOffer.niche} service called ${activeOffer.title}. The vibe should be trustworthy, modern, and high-energy.`;
      let url = "";
      if (type === 'image') {
        url = await generateOutreachImage(prompt);
      } else {
        url = await generateOutreachVideo(prompt);
      }
      setVisualAsset({ type, url });
      await incrementGenerations(userProfile.uid);
    } catch (error) {
      console.error('Visual generation error:', error);
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  const handlePlayTTS = async (text: string, type: string) => {
    if (isPlaying === type) {
      audio?.pause();
      setIsPlaying(null);
      return;
    }

    try {
      const base64 = await textToSpeech(text);
      const newAudio = new Audio(`data:audio/mp3;base64,${base64}`);
      newAudio.onended = () => setIsPlaying(null);
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(type);
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!activeOffer) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-zinc-800 rounded-3xl">
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
          <Send className="w-8 h-8 text-zinc-700" />
        </div>
        <h3 className="text-xl font-bold text-zinc-400">Lock Your Offer First</h3>
        <p className="text-zinc-500 max-w-xs mt-2">You need a locked offer before you can generate outreach scripts.</p>
        <button className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold">Go to Offer Builder</button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Outreach Engine</h1>
        <p className="text-zinc-400 text-lg">Get your first clients with high-conversion DM and email scripts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-xl space-y-6">
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Active Offer</p>
              <p className="text-lg font-bold text-white">{activeOffer.title}</p>
              <p className="text-sm text-zinc-400">{activeOffer.niche}</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <label className="block text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-500" />
                Target Lead (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="e.g. Zomato, Local Gym"
                  className="flex-grow bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
                <button
                  onClick={handleResearch}
                  disabled={isResearching || !leadName}
                  className="p-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all disabled:opacity-50"
                  title="Research Lead with Google Search"
                >
                  {isResearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </button>
              </div>
              {leadResearch && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Research Found</p>
                  <p className="text-xs text-zinc-400 line-clamp-3 italic">"{leadResearch}"</p>
                  <button 
                    onClick={() => setLeadResearch('')}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
                  >
                    Clear Research
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={cn(
                "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl",
                isGenerating
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {leadResearch ? 'Personalizing...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {leadResearch ? 'Generate Personalized Scripts' : (scripts ? 'Regenerate Scripts' : 'Generate Scripts')}
                </>
              )}
            </button>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-xl space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-500" />
              Visual Outreach Assets
            </h3>
            <p className="text-xs text-zinc-500">Boost conversion by 3x with personalized AI images or videos.</p>
            
            {!hasApiKey ? (
              <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4 text-center">
                <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6 text-zinc-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Premium Models</p>
                  <p className="text-[10px] text-zinc-500">Visual generation requires a paid Gemini API key.</p>
                </div>
                <button
                  onClick={handleSelectKey}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Select API Key
                </button>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-[10px] text-zinc-600 hover:text-zinc-400 underline"
                >
                  Learn about billing
                </a>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleGenerateVisual('image')}
                    disabled={isGeneratingVisual}
                    className="flex flex-col items-center gap-2 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-purple-500/50 transition-all group"
                  >
                    <ImageIcon className="w-6 h-6 text-zinc-600 group-hover:text-purple-500" />
                    <span className="text-xs font-bold text-zinc-400">AI Image</span>
                  </button>
                  <button
                    onClick={() => handleGenerateVisual('video')}
                    disabled={isGeneratingVisual}
                    className="flex flex-col items-center gap-2 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-blue-500/50 transition-all group"
                  >
                    <Video className="w-6 h-6 text-zinc-600 group-hover:text-blue-500" />
                    <span className="text-xs font-bold text-zinc-400">AI Video</span>
                  </button>
                </div>

                {isGeneratingVisual && (
                  <div className="flex items-center justify-center gap-3 p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    <span className="text-xs text-zinc-400 animate-pulse">Generating your asset...</span>
                  </div>
                )}

                {visualAsset && (
                  <div className="space-y-3">
                    <div className="relative aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
                      {visualAsset.type === 'image' ? (
                        <img src={visualAsset.url} alt="Outreach Asset" className="w-full h-full object-cover" />
                      ) : (
                        <video src={visualAsset.url} controls className="w-full h-full object-cover" />
                      )}
                    </div>
                    <button 
                      onClick={() => setVisualAsset(null)}
                      className="w-full py-2 text-xs font-bold text-zinc-500 hover:text-zinc-300"
                    >
                      Clear Asset
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {!scripts && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-zinc-800 rounded-3xl"
              >
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-xl font-bold text-zinc-400">Ready to Outreach?</h3>
                <p className="text-zinc-500 max-w-xs mt-2">Generate personalized scripts for DMs, emails, and follow-ups based on your offer.</p>
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
                  <h3 className="text-xl font-bold text-white">AI Script Agent</h3>
                  <p className="text-zinc-400 animate-pulse">Personalizing outreach for {activeOffer.niche}...</p>
                </div>
              </motion.div>
            )}

            {scripts && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {[
                  { title: 'Instagram/LinkedIn DM', icon: MessageSquare, text: scripts.dm, type: 'dm' },
                  { title: 'Cold Email', icon: Mail, text: scripts.email, type: 'email' },
                  { title: 'Follow-up', icon: RefreshCw, text: scripts.followUp, type: 'followUp' }
                ].map((script, i) => (
                  <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-950 rounded-lg text-emerald-500">
                          <script.icon className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-zinc-200">{script.title}</h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handlePlayTTS(script.text, script.type)}
                          className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-emerald-500 transition-colors"
                        >
                          {isPlaying === script.type ? (
                            <><Pause className="w-3 h-3" /> Stop</>
                          ) : (
                            <><Volume2 className="w-3 h-3" /> Listen</>
                          )}
                        </button>
                        <button 
                          onClick={() => copyToClipboard(script.text, script.type)}
                          className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-emerald-500 transition-colors"
                        >
                          {copied === script.type ? (
                            <><CheckCircle2 className="w-3 h-3" /> Copied!</>
                          ) : (
                            <><Copy className="w-3 h-3" /> Copy Script</>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
                      {script.text}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <LimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
};
