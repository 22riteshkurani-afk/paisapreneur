import React from 'react';
import { Check, Rocket, Crown, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface PricingProps {
  userProfile: UserProfile;
}

export const Pricing: React.FC<PricingProps> = ({ userProfile }) => {
  const handleUpgrade = async () => {
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), { isPremium: true });
      alert('Welcome to Paisapreneur Premium! You now have unlimited access.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const plans = [
    {
      name: 'Free Starter',
      price: '₹0',
      description: 'Perfect for exploring new ideas.',
      features: [
        '5 AI Generations per day',
        'Basic Monetization Path',
        'Standard AI Mentor Chat',
        'CRM & Pipeline Access',
      ],
      buttonText: 'Current Plan',
      isCurrent: !userProfile.isPremium,
      highlight: false,
    },
    {
      name: 'Premium Pro',
      price: '₹999',
      period: '/month',
      description: 'For serious entrepreneurs building empires.',
      features: [
        'Unlimited AI Generations',
        'Deep Strategic Analysis (High Thinking)',
        'Live Voice Mentor (Live API)',
        'Real-time Google Search Grounding',
        'Priority Agent Collaboration',
        'Advanced Revenue Projections',
      ],
      buttonText: userProfile.isPremium ? 'Current Plan' : 'Upgrade to Pro',
      isCurrent: userProfile.isPremium,
      highlight: true,
    },
  ];

  return (
    <div className="space-y-12 py-10">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tight">Simple, Transparent Pricing</h1>
        <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
          Invest in your future. Get the tools you need to build a profitable business in the Indian market.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative p-8 rounded-3xl border transition-all duration-300 flex flex-col",
              plan.highlight 
                ? "bg-zinc-900 border-emerald-500/50 shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]" 
                : "bg-zinc-900/50 border-zinc-800"
            )}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-zinc-400 text-sm">{plan.description}</p>
            </div>

            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-5xl font-black">{plan.price}</span>
              {plan.period && <span className="text-zinc-500 font-medium">{plan.period}</span>}
            </div>

            <ul className="space-y-4 mb-10 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-500" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={plan.highlight && !plan.isCurrent ? handleUpgrade : undefined}
              disabled={plan.isCurrent}
              className={cn(
                "w-full py-4 rounded-2xl font-bold transition-all active:scale-[0.98]",
                plan.isCurrent
                  ? "bg-zinc-800 text-zinc-500 cursor-default"
                  : plan.highlight
                    ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20"
                    : "bg-white text-black hover:bg-zinc-200"
              )}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl text-center">
        <h4 className="font-bold mb-2 flex items-center justify-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Enterprise Plan?
        </h4>
        <p className="text-zinc-400 text-sm">
          Need custom solutions or API access for your organization? 
          <button className="text-emerald-500 font-bold ml-1 hover:underline">Contact Sales</button>
        </p>
      </div>

      {/* Testimonials Section */}
      <div className="space-y-10 pt-10 border-t border-zinc-800">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Trusted by 500+ Indian Founders</h2>
          <p className="text-zinc-500">Real stories from entrepreneurs who built their empires with us.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "Paisapreneur AI helped me launch my D2C brand in just 2 weeks. The marketing hooks were a game-changer for our Instagram launch!",
              author: "Ananya Sharma",
              role: "Founder, GlowUp India",
              avatar: "https://picsum.photos/seed/ananya/100/100"
            },
            {
              quote: "The Deep Strategic Analysis saved me from a ₹5 Lakh mistake in my supply chain. It's like having a board of directors for ₹999.",
              author: "Rahul Verma",
              role: "CEO, AgriTech Solutions",
              avatar: "https://picsum.photos/seed/rahul/100/100"
            },
            {
              quote: "Live Voice Mentoring is incredible. I got real-time feedback on my investor pitch while driving to a meeting. Truly futuristic.",
              author: "Vikram Singh",
              role: "Serial Entrepreneur",
              avatar: "https://picsum.photos/seed/vikram/100/100"
            }
          ].map((t, i) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-2xl space-y-4 hover:border-emerald-500/30 transition-colors group">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Rocket key={i} className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                ))}
              </div>
              <p className="text-zinc-300 text-sm italic leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-2">
                <img src={t.avatar} alt={t.author} className="w-10 h-10 rounded-full border border-zinc-800" referrerPolicy="no-referrer" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{t.author}</span>
                  <span className="text-xs text-zinc-500">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
