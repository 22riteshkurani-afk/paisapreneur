import React, { useState, useEffect } from 'react';
import { UserProfile, BusinessOffer, LandingPage } from '../types';
import { generateLandingPage, generateCtaVariations, analyzeLandingPage, generateHeroImagePrompt } from '../services/geminiService';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Layout, Sparkles, Loader2, Copy, CheckCircle2, ArrowRight, Eye, Code, Image as ImageIcon, MessageSquare, Zap, Target, RefreshCw, Plus, TrendingUp, AlertCircle, Trash2, Edit3, Monitor, Smartphone, Columns2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { hasReachedLimit, incrementGenerations } from '../lib/limits';
import { LimitModal } from './LimitModal';

interface LandingPageBuilderProps {
  userProfile: UserProfile;
}

export const LandingPageBuilder: React.FC<LandingPageBuilderProps> = ({ userProfile }) => {
  const [activeOffer, setActiveOffer] = useState<BusinessOffer | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [landingPage, setLandingPage] = useState<Partial<LandingPage> | null>(null);
  const [savedPage, setSavedPage] = useState<LandingPage | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'copy' | 'split'>('edit');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [isGeneratingCta, setIsGeneratingCta] = useState(false);
  const [ctaGoal, setCtaGoal] = useState('Book a Call');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isGeneratingImagePrompt, setIsGeneratingImagePrompt] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const qOffer = query(collection(db, 'users', userProfile.uid, 'offers'));
    const unsubscribeOffer = onSnapshot(qOffer, (snapshot) => {
      const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessOffer));
      const active = offers.find(o => o.locked === true) || offers[0];
      if (active) setActiveOffer(active);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'offers'));

    const qPage = query(collection(db, 'users', userProfile.uid, 'landingPages'));
    const unsubscribePage = onSnapshot(qPage, (snapshot) => {
      const pages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LandingPage));
      if (pages.length > 0) setSavedPage(pages[0]);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'landingPages'));

    return () => {
      unsubscribeOffer();
      unsubscribePage();
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
      const output = await generateLandingPage(activeOffer);
      setLandingPage(output);
      await incrementGenerations(userProfile.uid);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!landingPage || !activeOffer) return;

    // Final validation check
    const newErrors: Record<string, string> = {};
    if (!landingPage.headline?.trim()) newErrors.headline = 'Headline is required';
    if (!landingPage.subheadline?.trim()) newErrors.subheadline = 'Sub-headline is required';
    
    landingPage.benefits?.forEach((b, i) => {
      if (!b.title.trim()) newErrors[`benefit-title-${i}`] = 'Title required';
      if (!b.description.trim()) newErrors[`benefit-desc-${i}`] = 'Description required';
    });

    landingPage.ctas?.forEach((c, i) => {
      if (!c.text.trim()) newErrors[`cta-text-${i}`] = 'Text required';
      if (!c.goal.trim()) newErrors[`cta-goal-${i}`] = 'Goal required';
    });

    landingPage.faq?.forEach((f, i) => {
      if (!f.question.trim()) newErrors[`faq-q-${i}`] = 'Question required';
      if (!f.answer.trim()) newErrors[`faq-a-${i}`] = 'Answer required';
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const pageData: LandingPage = {
        userId: userProfile.uid,
        offerId: activeOffer.id!,
        headline: landingPage.headline!,
        subheadline: landingPage.subheadline!,
        heroImagePrompt: landingPage.heroImagePrompt!,
        benefits: landingPage.benefits!,
        socialProofPlaceholders: landingPage.socialProofPlaceholders!,
        ctas: landingPage.ctas!,
        selectedCtaIndex: landingPage.selectedCtaIndex || 0,
        faq: landingPage.faq!,
        seoTitle: landingPage.seoTitle || '',
        seoDescription: landingPage.seoDescription || '',
        seoKeywords: landingPage.seoKeywords || '',
        createdAt: Date.now()
      };
      await addDoc(collection(db, 'users', userProfile.uid, 'landingPages'), pageData);
      setLandingPage(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'landingPages');
    }
  };

  const handleUpdateCtaIndex = async (index: number) => {
    if (landingPage) {
      setLandingPage({ ...landingPage, selectedCtaIndex: index });
    } else if (savedPage) {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid, 'landingPages', savedPage.id!), { selectedCtaIndex: index });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'landingPages');
      }
    }
  };

  const handleGenerateNewCtas = async () => {
    if (!activeOffer) return;
    if (hasReachedLimit(userProfile)) {
      setShowLimitModal(true);
      return;
    }
    setIsGeneratingCta(true);
    try {
      const newCtas = await generateCtaVariations(activeOffer, ctaGoal);
      const currentPage = landingPage || savedPage;
      if (currentPage) {
        const updatedCtas = [...(currentPage.ctas || []), ...newCtas];
        if (landingPage) {
          setLandingPage({ ...landingPage, ctas: updatedCtas });
        } else if (savedPage) {
          await updateDoc(doc(db, 'users', userProfile.uid, 'landingPages', savedPage.id!), { ctas: updatedCtas });
        }
      }
      await incrementGenerations(userProfile.uid);
    } catch (error) {
      console.error('CTA generation error:', error);
    } finally {
      setIsGeneratingCta(false);
    }
  };

  const handleAnalyze = async () => {
    const page = landingPage || savedPage;
    if (!page) return;
    if (hasReachedLimit(userProfile)) {
      setShowLimitModal(true);
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeLandingPage(page);
      setAnalysis(result);
      await incrementGenerations(userProfile.uid);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateImagePrompt = async () => {
    if (!activeOffer) return;
    if (hasReachedLimit(userProfile)) {
      setShowLimitModal(true);
      return;
    }
    setIsGeneratingImagePrompt(true);
    try {
      const newPrompt = await generateHeroImagePrompt(activeOffer);
      if (landingPage) {
        setLandingPage({ ...landingPage, heroImagePrompt: newPrompt });
      } else if (savedPage) {
        await updateDoc(doc(db, 'users', userProfile.uid, 'landingPages', savedPage.id!), { heroImagePrompt: newPrompt });
      }
      await incrementGenerations(userProfile.uid);
    } catch (error) {
      console.error('Image prompt generation error:', error);
    } finally {
      setIsGeneratingImagePrompt(false);
    }
  };

  const handleUpdateHeroImagePrompt = async (value: string) => {
    if (landingPage) {
      setLandingPage({ ...landingPage, heroImagePrompt: value });
    } else if (savedPage) {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid, 'landingPages', savedPage.id!), { heroImagePrompt: value });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'landingPages');
      }
    }
  };

  const handleUpdateBenefit = async (index: number, field: 'title' | 'description', value: string) => {
    const page = landingPage || savedPage;
    if (!page || !page.benefits) return;

    const updatedBenefits = [...page.benefits];
    updatedBenefits[index] = { ...updatedBenefits[index], [field]: value };

    if (landingPage) {
      setLandingPage({ ...landingPage, benefits: updatedBenefits });
    } else if (savedPage) {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid, 'landingPages', savedPage.id!), { benefits: updatedBenefits });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'landingPages');
      }
    }
  };

  const handleAddBenefit = async () => {
    const page = landingPage || savedPage;
    if (!page) return;

    const newBenefit = { title: 'New Benefit', description: 'Describe the value here...' };
    const updatedBenefits = [...(page.benefits || []), newBenefit];

    if (landingPage) {
      setLandingPage({ ...landingPage, benefits: updatedBenefits });
    } else if (savedPage) {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid, 'landingPages', savedPage.id!), { benefits: updatedBenefits });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'landingPages');
      }
    }
  };

  const handleDeleteBenefit = async (index: number) => {
    const page = landingPage || savedPage;
    if (!page || !page.benefits) return;

    const updatedBenefits = page.benefits.filter((_, i) => i !== index);

    if (landingPage) {
      setLandingPage({ ...landingPage, benefits: updatedBenefits });
    } else if (savedPage) {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid, 'landingPages', savedPage.id!), { benefits: updatedBenefits });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'landingPages');
      }
    }
  };

  const handleAddFaq = async () => {
    const page = landingPage || savedPage;
    if (!page) return;

    const newFaq = { question: 'New Question?', answer: 'Provide the answer here...' };
    const updatedFaq = [...(page.faq || []), newFaq];

    if (landingPage) {
      setLandingPage({ ...landingPage, faq: updatedFaq });
    } else if (savedPage) {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid, 'landingPages', savedPage.id!), { faq: updatedFaq });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'landingPages');
      }
    }
  };

  const handleDeleteFaq = async (index: number) => {
    const page = landingPage || savedPage;
    if (!page || !page.faq) return;

    const updatedFaq = page.faq.filter((_, i) => i !== index);

    if (landingPage) {
      setLandingPage({ ...landingPage, faq: updatedFaq });
    } else if (savedPage) {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid, 'landingPages', savedPage.id!), { faq: updatedFaq });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'landingPages');
      }
    }
  };

  const handleUpdateCta = async (index: number, field: 'text' | 'goal', value: string) => {
    const page = landingPage || savedPage;
    if (!page || !page.ctas) return;

    const updatedCtas = [...page.ctas];
    updatedCtas[index] = { ...updatedCtas[index], [field]: value };

    if (landingPage) {
      setLandingPage({ ...landingPage, ctas: updatedCtas });
    } else if (savedPage) {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid, 'landingPages', savedPage.id!), { ctas: updatedCtas });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'landingPages');
      }
    }
  };

  const handleUpdateFaq = async (index: number, field: 'question' | 'answer', value: string) => {
    const page = landingPage || savedPage;
    if (!page || !page.faq) return;

    const updatedFaq = [...page.faq];
    updatedFaq[index] = { ...updatedFaq[index], [field]: value };

    if (landingPage) {
      setLandingPage({ ...landingPage, faq: updatedFaq });
    } else if (savedPage) {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid, 'landingPages', savedPage.id!), { faq: updatedFaq });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'landingPages');
      }
    }
  };

  const handleUpdateField = async (field: 'headline' | 'subheadline', value: string) => {
    if (landingPage) {
      setLandingPage({ ...landingPage, [field]: value });
    } else if (savedPage) {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid, 'landingPages', savedPage.id!), { [field]: value });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'landingPages');
      }
    }
  };

  const validateField = (id: string, value: string, minLen: number = 1) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, [id]: 'This field cannot be empty' }));
      return false;
    }
    if (value.trim().length < minLen) {
      setErrors(prev => ({ ...prev, [id]: `Must be at least ${minLen} characters` }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    return true;
  };

  const copyToClipboard = () => {
    const page = landingPage || savedPage;
    if (!page) return;
    const selectedCta = page.ctas?.[page.selectedCtaIndex || 0]?.text || '';
    const text = `
Headline: ${page.headline}
Sub-headline: ${page.subheadline}

SEO Meta Tags:
Title: ${page.seoTitle}
Description: ${page.seoDescription}
Keywords: ${page.seoKeywords}

Hero Image Prompt: ${page.heroImagePrompt}

Benefits:
${page.benefits?.map(b => `- ${b.title}: ${b.description}`).join('\n')}

CTA: ${selectedCta}

FAQ:
${page.faq?.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}
    `;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderLandingPageContent = (mode: 'edit' | 'preview', device: 'desktop' | 'mobile') => {
    if (!displayPage) return null;

    return (
      <div className="bg-white text-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
        {/* Hero Section */}
        <div className={cn(
          "space-y-8 text-center bg-zinc-50 border-b border-zinc-100",
          device === 'mobile' && mode === 'preview' ? "p-8" : "p-12 md:p-20"
        )}>
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="space-y-2">
              {mode === 'edit' ? (
                <>
                  <textarea
                    value={displayPage.headline}
                    onChange={(e) => {
                      handleUpdateField('headline', e.target.value);
                      validateField('headline', e.target.value, 5);
                    }}
                    className={cn(
                      "w-full bg-transparent text-4xl md:text-6xl font-black tracking-tight leading-tight text-zinc-950 text-center border-b-2 border-transparent hover:border-zinc-200 focus:border-emerald-500 outline-none transition-all resize-none min-h-[120px]",
                      errors.headline && "border-red-500 hover:border-red-500"
                    )}
                    placeholder="Your Magnetic Headline"
                  />
                  {errors.headline && <p className="text-red-500 text-xs font-bold">{errors.headline}</p>}
                </>
              ) : (
                <h1 className={cn(
                  "font-black tracking-tight leading-tight text-zinc-950 text-center",
                  device === 'mobile' ? "text-3xl" : "text-4xl md:text-6xl"
                )}>
                  {displayPage.headline}
                </h1>
              )}
            </div>
            <div className="space-y-2">
              {mode === 'edit' ? (
                <>
                  <textarea
                    value={displayPage.subheadline}
                    onChange={(e) => {
                      handleUpdateField('subheadline', e.target.value);
                      validateField('subheadline', e.target.value, 10);
                    }}
                    className={cn(
                      "w-full bg-transparent text-xl md:text-2xl text-zinc-600 font-medium text-center border-b-2 border-transparent hover:border-zinc-200 focus:border-emerald-500 outline-none transition-all resize-none min-h-[80px]",
                      errors.subheadline && "border-red-500 hover:border-red-500"
                    )}
                    placeholder="Your Persuasive Sub-headline"
                  />
                  {errors.subheadline && <p className="text-red-500 text-xs font-bold">{errors.subheadline}</p>}
                </>
              ) : (
                <p className={cn(
                  "text-zinc-600 font-medium text-center",
                  device === 'mobile' ? "text-base" : "text-xl md:text-2xl"
                )}>
                  {displayPage.subheadline}
                </p>
              )}
            </div>
          </div>
          <button className={cn(
            "bg-emerald-500 text-white rounded-2xl font-black shadow-2xl shadow-emerald-500/40 hover:scale-105 transition-transform",
            device === 'mobile' && mode === 'preview' ? "px-6 py-4 text-lg" : "px-10 py-5 text-xl"
          )}>
            {displayPage.ctas?.[displayPage.selectedCtaIndex || 0]?.text || 'Get Started'}
          </button>
        </div>

        {/* CTA Variations Section - Only in Edit Mode */}
        {mode === 'edit' && (
          <div className="p-12 bg-zinc-50 border-b border-zinc-100">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
                  <Target className="w-6 h-6 text-emerald-500" />
                  CTA Variations
                </h3>
                <div className="flex items-center gap-2">
                  <select 
                    value={ctaGoal}
                    onChange={(e) => setCtaGoal(e.target.value)}
                    className="bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>Book a Call</option>
                    <option>Download Guide</option>
                    <option>Sign Up</option>
                    <option>Get Started</option>
                    <option>Join Now</option>
                  </select>
                  <button
                    onClick={handleGenerateNewCtas}
                    disabled={isGeneratingCta}
                    className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50"
                  >
                    {isGeneratingCta ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayPage.ctas?.map((cta, i) => (
                  <button
                    key={i}
                    onClick={() => handleUpdateCtaIndex(i)}
                    className={cn(
                      "p-6 rounded-2xl border-2 text-left transition-all group relative",
                      (displayPage.selectedCtaIndex || 0) === i
                        ? "border-emerald-500 bg-emerald-50 shadow-lg"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    )}
                  >
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={cta.goal}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          handleUpdateCta(i, 'goal', e.target.value);
                          validateField(`cta-goal-${i}`, e.target.value);
                        }}
                        className={cn(
                          "w-full bg-transparent text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-emerald-500 transition-colors border-b border-transparent hover:border-zinc-200 focus:border-emerald-500 outline-none",
                          errors[`cta-goal-${i}`] && "text-red-500 border-red-500"
                        )}
                        placeholder="Goal"
                        title="Edit Goal"
                      />
                      <input
                        type="text"
                        value={cta.text}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          handleUpdateCta(i, 'text', e.target.value);
                          validateField(`cta-text-${i}`, e.target.value);
                        }}
                        className={cn(
                          "w-full bg-transparent font-bold text-lg border-b border-transparent hover:border-zinc-200 focus:border-emerald-500 outline-none",
                          (displayPage.selectedCtaIndex || 0) === i ? "text-emerald-900" : "text-zinc-700",
                          errors[`cta-text-${i}`] && "text-red-500 border-red-500"
                        )}
                        placeholder="CTA Text"
                        title="Edit CTA Text"
                      />
                      {(errors[`cta-goal-${i}`] || errors[`cta-text-${i}`]) && (
                        <p className="text-red-500 text-[10px] font-bold">Required</p>
                      )}
                    </div>
                    {(displayPage.selectedCtaIndex || 0) === i && (
                      <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image Prompt Section - Only in Edit Mode */}
        {mode === 'edit' && (
          <div className="p-12 bg-zinc-900 text-white">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
              <div className="w-full md:w-1/2 aspect-video bg-zinc-800 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 p-8 text-center">
                <ImageIcon className="w-12 h-12 text-zinc-600 mb-4" />
                <p className="text-sm text-zinc-500 italic">Use the prompt below in Midjourney or DALL-E to generate your hero image.</p>
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
                    <ImageIcon className="w-5 h-5" /> Hero Image Prompt
                  </h3>
                  <button
                    onClick={handleGenerateImagePrompt}
                    disabled={isGeneratingImagePrompt}
                    className="p-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all disabled:opacity-50"
                    title="Regenerate Prompt"
                  >
                    <RefreshCw className={cn("w-4 h-4", isGeneratingImagePrompt && "animate-spin")} />
                  </button>
                </div>
                <textarea
                  value={displayPage.heroImagePrompt}
                  onChange={(e) => handleUpdateHeroImagePrompt(e.target.value)}
                  className="w-full bg-zinc-950 text-zinc-400 text-sm leading-relaxed p-6 rounded-2xl border border-zinc-800 outline-none focus:border-emerald-500 transition-all resize-none min-h-[150px]"
                  placeholder="Describe your hero image here..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className={cn(
          "max-w-6xl mx-auto space-y-12",
          device === 'mobile' && mode === 'preview' ? "p-8" : "p-12 md:p-20"
        )}>
          <div className="flex items-center justify-between">
            <h3 className={cn(
              "font-bold text-zinc-950",
              device === 'mobile' ? "text-2xl" : "text-3xl"
            )}>Core Benefits</h3>
            {mode === 'edit' && (
              <button
                onClick={handleAddBenefit}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl font-bold hover:bg-emerald-500/20 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Benefit
              </button>
            )}
          </div>
          <div className={cn(
            "grid gap-12",
            device === 'mobile' && mode === 'preview' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
          )}>
            {displayPage.benefits?.map((benefit, i) => (
              <div key={i} className="space-y-4 group/benefit relative">
                {mode === 'edit' && (
                  <button
                    onClick={() => handleDeleteBenefit(i)}
                    className="absolute -top-2 -right-2 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover/benefit:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                    title="Delete Benefit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  {mode === 'edit' ? (
                    <>
                      <input
                        type="text"
                        value={benefit.title}
                        onChange={(e) => {
                          handleUpdateBenefit(i, 'title', e.target.value);
                          validateField(`benefit-title-${i}`, e.target.value);
                        }}
                        className={cn(
                          "w-full bg-transparent text-xl font-bold text-zinc-950 border-b border-transparent hover:border-zinc-200 focus:border-emerald-500 outline-none transition-all",
                          errors[`benefit-title-${i}`] && "border-red-500"
                        )}
                        placeholder="Benefit Title"
                        title="Click to edit title"
                      />
                      <textarea
                        value={benefit.description}
                        onChange={(e) => {
                          handleUpdateBenefit(i, 'description', e.target.value);
                          validateField(`benefit-desc-${i}`, e.target.value, 5);
                        }}
                        className={cn(
                          "w-full bg-transparent text-zinc-600 leading-relaxed border border-transparent hover:border-zinc-200 focus:border-emerald-500 rounded-lg p-1 outline-none transition-all resize-none min-h-[100px]",
                          errors[`benefit-desc-${i}`] && "border-red-500"
                        )}
                        placeholder="Benefit Description"
                        title="Click to edit description"
                      />
                      {(errors[`benefit-title-${i}`] || errors[`benefit-desc-${i}`]) && (
                        <p className="text-red-500 text-[10px] font-bold">Please provide meaningful content</p>
                      )}
                    </>
                  ) : (
                    <>
                      <h4 className="text-xl font-bold text-zinc-950">{benefit.title}</h4>
                      <p className="text-zinc-600 leading-relaxed">{benefit.description}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof Section */}
        <div className={cn(
          "bg-zinc-50 border-y border-zinc-100",
          device === 'mobile' && mode === 'preview' ? "p-8" : "p-12 md:p-20"
        )}>
          <div className="max-w-4xl mx-auto space-y-10">
            <h3 className={cn(
              "font-bold text-center text-zinc-950",
              device === 'mobile' ? "text-2xl" : "text-3xl"
            )}>What People Are Saying</h3>
            <div className={cn(
              "grid gap-6",
              device === 'mobile' && mode === 'preview' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
            )}>
              {displayPage.socialProofPlaceholders?.map((proof, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 italic text-zinc-500 text-sm">
                  "{proof}"
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className={cn(
          "max-w-4xl mx-auto space-y-10",
          device === 'mobile' && mode === 'preview' ? "p-8" : "p-12 md:p-20"
        )}>
          <div className="flex items-center justify-between">
            <h3 className={cn(
              "font-bold text-zinc-950",
              device === 'mobile' ? "text-2xl" : "text-3xl"
            )}>Frequently Asked Questions</h3>
            {mode === 'edit' && (
              <button
                onClick={handleAddFaq}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl font-bold hover:bg-emerald-500/20 transition-all"
              >
                <Plus className="w-4 h-4" /> Add FAQ
              </button>
            )}
          </div>
          <div className="space-y-8">
            {displayPage.faq?.map((item, i) => (
              <div key={i} className={cn(
                "space-y-3 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-emerald-200 transition-all group/faq relative",
                mode === 'edit' && "hover:border-emerald-200"
              )}>
                {mode === 'edit' && (
                  <button
                    onClick={() => handleDeleteFaq(i)}
                    className="absolute -top-2 -right-2 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover/faq:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="space-y-1">
                  {mode === 'edit' ? (
                    <>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => {
                          handleUpdateFaq(i, 'question', e.target.value);
                          validateField(`faq-q-${i}`, e.target.value);
                        }}
                        className={cn(
                          "w-full bg-transparent font-bold text-zinc-950 text-lg border-b border-transparent hover:border-zinc-200 focus:border-emerald-500 outline-none",
                          errors[`faq-q-${i}`] && "border-red-500"
                        )}
                        placeholder="Question"
                      />
                      {errors[`faq-q-${i}`] && <p className="text-red-500 text-[10px] font-bold">{errors[`faq-q-${i}`]}</p>}
                    </>
                  ) : (
                    <h4 className="font-bold text-zinc-950 text-lg">{item.question}</h4>
                  )}
                </div>
                <div className="space-y-1">
                  {mode === 'edit' ? (
                    <>
                      <textarea
                        value={item.answer}
                        onChange={(e) => {
                          handleUpdateFaq(i, 'answer', e.target.value);
                          validateField(`faq-a-${i}`, e.target.value, 5);
                        }}
                        className={cn(
                          "w-full bg-transparent text-zinc-600 border border-transparent hover:border-zinc-200 focus:border-emerald-500 rounded-lg p-2 outline-none transition-all resize-none min-h-[80px]",
                          errors[`faq-a-${i}`] && "border-red-500"
                        )}
                        placeholder="Answer"
                      />
                      {errors[`faq-a-${i}`] && <p className="text-red-500 text-[10px] font-bold">{errors[`faq-a-${i}`]}</p>}
                    </>
                  ) : (
                    <p className="text-zinc-600">{item.answer}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEO Meta Tags Section */}
        <div className={cn(
          "bg-zinc-50 border-y border-zinc-100",
          device === 'mobile' && mode === 'preview' ? "p-8" : "p-12 md:p-20"
        )}>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900">SEO Meta Tags</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Meta Title</label>
                {mode === 'edit' ? (
                  <input
                    type="text"
                    value={displayPage.seoTitle || ''}
                    onChange={(e) => setLandingPage({ ...displayPage, seoTitle: e.target.value })}
                    className="w-full bg-white border border-zinc-200 focus:border-emerald-500 rounded-xl px-4 py-3 outline-none transition-all"
                    placeholder="SEO Title (max 60 chars)"
                  />
                ) : (
                  <p className="text-lg font-bold text-zinc-900">{displayPage.seoTitle || 'No title set'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Meta Description</label>
                {mode === 'edit' ? (
                  <textarea
                    value={displayPage.seoDescription || ''}
                    onChange={(e) => setLandingPage({ ...displayPage, seoDescription: e.target.value })}
                    className="w-full bg-white border border-zinc-200 focus:border-emerald-500 rounded-xl px-4 py-3 outline-none transition-all resize-none min-h-[100px]"
                    placeholder="SEO Description (max 160 chars)"
                  />
                ) : (
                  <p className="text-zinc-600 leading-relaxed">{displayPage.seoDescription || 'No description set'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Keywords</label>
                {mode === 'edit' ? (
                  <input
                    type="text"
                    value={displayPage.seoKeywords || ''}
                    onChange={(e) => setLandingPage({ ...displayPage, seoKeywords: e.target.value })}
                    className="w-full bg-white border border-zinc-200 focus:border-emerald-500 rounded-xl px-4 py-3 outline-none transition-all"
                    placeholder="Keywords (comma separated)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {displayPage.seoKeywords?.split(',').map((k, i) => (
                      <span key={i} className="px-3 py-1 bg-zinc-200 text-zinc-700 rounded-full text-xs font-medium">
                        {k.trim()}
                      </span>
                    )) || <p className="text-zinc-400 italic">No keywords set</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Google Search Preview */}
            <div className="mt-12 p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Google Search Preview</p>
              <div className="space-y-1">
                <p className="text-[#1a0dab] text-xl hover:underline cursor-pointer truncate">
                  {displayPage.seoTitle || 'Your Page Title Goes Here'}
                </p>
                <p className="text-[#006621] text-sm truncate">
                  https://yourdomain.com › {displayPage.seoTitle?.toLowerCase().replace(/\s+/g, '-')}
                </p>
                <p className="text-[#545454] text-sm line-clamp-2">
                  {displayPage.seoDescription || 'This is how your page description will appear in Google search results. Make it catchy to improve click-through rates!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className={cn(
          "bg-emerald-500 text-white text-center space-y-6",
          device === 'mobile' && mode === 'preview' ? "p-8" : "p-12 md:p-20"
        )}>
          <h3 className={cn(
            "font-black",
            device === 'mobile' ? "text-2xl" : "text-3xl md:text-4xl"
          )}>Ready to get started?</h3>
          <button className={cn(
            "bg-white text-emerald-600 rounded-2xl font-black shadow-2xl hover:scale-105 transition-transform",
            device === 'mobile' && mode === 'preview' ? "px-6 py-4 text-lg" : "px-10 py-5 text-xl"
          )}>
            {displayPage.ctas?.[displayPage.selectedCtaIndex || 0]?.text || 'Get Started'}
          </button>
        </div>
      </div>
    );
  };

  if (!activeOffer) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-zinc-800 rounded-3xl">
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
          <Layout className="w-8 h-8 text-zinc-700" />
        </div>
        <h3 className="text-xl font-bold text-zinc-400">Lock Your Offer First</h3>
        <p className="text-zinc-500 max-w-xs mt-2">You need a locked offer before you can build your landing page.</p>
        <button className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold">Go to Offer Builder</button>
      </div>
    );
  }

  const displayPage = landingPage || savedPage;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Landing Page Builder</h1>
          <p className="text-zinc-400 text-lg">Generate high-converting copy for your sales page.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={cn(
            "px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl",
            isGenerating
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Copy...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {displayPage ? 'Regenerate Page' : 'Generate Landing Page'}
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <AnimatePresence mode="wait">
          {!displayPage && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-zinc-800 rounded-3xl"
            >
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
                <Layout className="w-8 h-8 text-zinc-700" />
              </div>
              <h3 className="text-xl font-bold text-zinc-400">Ready to Sell?</h3>
              <p className="text-zinc-500 max-w-xs mt-2">Generate a magnetic landing page that turns visitors into paying clients.</p>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-8 p-10 bg-zinc-900/20 border border-zinc-800 rounded-3xl"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-emerald-500 animate-pulse" />
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-white">AI Copywriter is Thinking</h3>
                <p className="text-zinc-400 animate-pulse max-w-sm">Crafting headlines, benefits, and persuasive hooks for your ${activeOffer.niche} audience...</p>
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest">
                  <Zap className="w-4 h-4" /> High Thinking Mode Enabled
                </div>
              </div>
            </motion.div>
          )}

          {displayPage && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className={cn(
                "grid grid-cols-1 gap-8",
                viewMode === 'split' ? "lg:grid-cols-1" : "lg:grid-cols-3"
              )}>
                <div className={cn(
                  "space-y-6",
                  viewMode === 'split' ? "lg:col-span-1" : "lg:col-span-2"
                )}>
                  <div className="flex flex-col sm:flex-row items-center justify-between bg-zinc-900 border border-zinc-800 p-2 rounded-2xl gap-4">
                    <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl">
                      <button
                        onClick={() => setViewMode('edit')}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                          viewMode === 'edit' ? "bg-emerald-500 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editor
                      </button>
                      <button
                        onClick={() => setViewMode('preview')}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                          viewMode === 'preview' ? "bg-emerald-500 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        <Eye className="w-3.5 h-3.5" /> Live Preview
                      </button>
                      <button
                        onClick={() => setViewMode('split')}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 hidden lg:flex",
                          viewMode === 'split' ? "bg-emerald-500 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        <Columns2 className="w-3.5 h-3.5" /> Split View
                      </button>
                      <button
                        onClick={() => setViewMode('copy')}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                          viewMode === 'copy' ? "bg-emerald-500 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        <Code className="w-3.5 h-3.5" /> Raw Copy
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      {(viewMode === 'preview' || viewMode === 'split') && (
                        <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                          <button
                            onClick={() => setPreviewDevice('desktop')}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              previewDevice === 'desktop' ? "bg-zinc-800 text-emerald-500" : "text-zinc-600 hover:text-zinc-400"
                            )}
                            title="Desktop View"
                          >
                            <Monitor className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPreviewDevice('mobile')}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              previewDevice === 'mobile' ? "bg-zinc-800 text-emerald-500" : "text-zinc-600 hover:text-zinc-400"
                            )}
                            title="Mobile View"
                          >
                            <Smartphone className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={copyToClipboard}
                        className="px-6 py-2 bg-zinc-800 text-white rounded-xl text-sm font-bold hover:bg-zinc-700 transition-all flex items-center gap-2"
                      >
                        {copied ? <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy All</>}
                      </button>
                    </div>
                  </div>

                  {viewMode === 'copy' ? (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 font-mono text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">
                      {`Headline: ${displayPage.headline}
Sub-headline: ${displayPage.subheadline}

Hero Image Prompt: ${displayPage.heroImagePrompt}

Benefits:
${displayPage.benefits?.map(b => `- ${b.title}: ${b.description}`).join('\n')}

CTA: ${displayPage.ctas?.[displayPage.selectedCtaIndex || 0]?.text || ''}

FAQ:
${displayPage.faq?.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}`}
                    </div>
                  ) : viewMode === 'split' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-4">
                          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <Edit3 className="w-3 h-3" /> Editor Mode
                          </div>
                        </div>
                        <div className="max-h-[800px] overflow-y-auto custom-scrollbar rounded-[2.5rem] border border-zinc-800/50 bg-zinc-900/20">
                          {renderLandingPageContent('edit', 'desktop')}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-4">
                          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <Eye className="w-3 h-3" /> Preview ({previewDevice})
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live</span>
                          </div>
                        </div>
                        <div className={cn(
                          "max-h-[800px] overflow-y-auto custom-scrollbar transition-all duration-500 mx-auto relative",
                          previewDevice === 'mobile' 
                            ? "max-w-[375px] ring-[12px] ring-zinc-900 rounded-[3.5rem] shadow-2xl before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-32 before:h-6 before:bg-zinc-900 before:rounded-b-2xl before:z-50 after:content-[''] after:absolute after:bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-1 after:bg-zinc-900/20 after:rounded-full after:z-50" 
                            : "w-full rounded-[2.5rem] border border-zinc-800/50"
                        )}>
                          {renderLandingPageContent('preview', previewDevice)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={cn(
                      "transition-all duration-500 ease-in-out mx-auto relative",
                      viewMode === 'preview' && previewDevice === 'mobile' 
                        ? "max-w-[375px] ring-[12px] ring-zinc-900 rounded-[3.5rem] shadow-2xl before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-32 before:h-6 before:bg-zinc-900 before:rounded-b-2xl before:z-50 after:content-[''] after:absolute after:bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-1 after:bg-zinc-900/20 after:rounded-full after:z-50" 
                        : "w-full"
                    )}>
                      {renderLandingPageContent(viewMode as 'edit' | 'preview', previewDevice)}
                    </div>
                  )}
                </div>

                {viewMode !== 'split' && (
                  <div className="lg:col-span-1 space-y-6">
                  <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-xl space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        AI Optimization
                      </h3>
                      <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="p-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all flex items-center gap-2"
                        title="Analyze for Conversion"
                      >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {analysis ? (
                      <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 text-emerald-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-wider">CRO Recommendations</span>
                        </div>
                        <div className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap italic">
                          {analysis}
                        </div>
                        <button 
                          onClick={() => setAnalysis(null)}
                          className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
                        >
                          Clear Analysis
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">Get AI-powered suggestions to improve your landing page's conversion rate.</p>
                    )}
                  </div>

                  {landingPage && (
                    <button
                      onClick={handleSave}
                      className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                    >
                      Save Copy <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
      <LimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
};
