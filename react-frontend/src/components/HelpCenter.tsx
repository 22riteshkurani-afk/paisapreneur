import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Book, MessageCircle, Zap, Shield, Rocket, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'monetization' | 'outreach' | 'crm' | 'billing';
}

const faqs: FAQItem[] = [
  {
    category: 'general',
    question: "What is Paisapreneur AI?",
    answer: "Paisapreneur AI is an 'AI Monetization OS' designed specifically for Indian entrepreneurs. It helps you identify profitable service paths, build high-ticket offers, and execute a 90-day sprint to reach your first ₹25,000/month in independent income."
  },
  {
    category: 'monetization',
    question: "How does the Monetization Path work?",
    answer: "The Monetization Path uses our 'Pathfinder AI' to analyze your current skills, the tools you know, and your available time. It then matches these with high-demand niches in the Indian market to recommend the fastest route to revenue."
  },
  {
    category: 'outreach',
    question: "Is the Outreach Engine automated?",
    answer: "No, we believe in 'AI-Assisted Personalization'. The Outreach Engine generates high-conversion scripts tailored to your specific offer and niche, but we recommend you send them manually to maintain the human touch and avoid platform bans."
  },
  {
    category: 'crm',
    question: "How do I track my leads?",
    answer: "Use the CRM Pipeline to move leads through four stages: Lead, Conversation, Call, and Deal. This visual board helps you focus on the most promising opportunities and ensures no follow-up is missed."
  },
  {
    category: 'billing',
    question: "What's included in the Free vs. Premium plan?",
    answer: "The Free plan allows you to generate one monetization path and one offer. Premium unlocks unlimited generations, advanced outreach scripts, the Weekly AI Coach, and priority access to new playbooks."
  },
  {
    category: 'monetization',
    question: "Can I change my monetization path?",
    answer: "Yes, you can reset your path at any time from the Monetization Path section. However, we recommend sticking to one path for at least 30 days of focused execution to see real results."
  },
  {
    category: 'general',
    question: "What is the 90-day sprint?",
    answer: "It's a structured execution framework. Week 1 is for strategy and offer building, Weeks 2-8 are for aggressive outreach and sales, and Weeks 9-12 are for delivery and scaling. The Weekly AI Coach helps you stay on track."
  }
];

export const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'general', label: 'General', icon: Rocket },
    { id: 'monetization', label: 'Monetization', icon: Zap },
    { id: 'outreach', label: 'Outreach', icon: Send },
    { id: 'crm', label: 'CRM & Sales', icon: Shield },
    { id: 'billing', label: 'Billing', icon: Book },
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">Help Center</h1>
        <p className="text-zinc-400 text-lg">Find answers to common questions and learn how to master the Paisapreneur OS.</p>
        
        <div className="relative mt-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border",
              activeCategory === cat.id 
                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            )}
          >
            {/* cat.icon is a component, but we need to render it */}
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <div 
              key={faq.question}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden transition-all hover:border-zinc-700"
            >
              <button
                onClick={() => setOpenQuestion(openQuestion === faq.question ? null : faq.question)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-bold text-zinc-200">{faq.question}</span>
                {openQuestion === faq.question ? <ChevronUp className="w-5 h-5 text-emerald-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
              </button>
              <AnimatePresence>
                {openQuestion === faq.question && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-6 text-zinc-400 leading-relaxed border-t border-zinc-800 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-zinc-900/20 border-2 border-dashed border-zinc-800 rounded-3xl">
            <p className="text-zinc-500 font-bold">No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>

      <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-3xl text-center space-y-4 max-w-3xl mx-auto">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold">Still have questions?</h3>
        <p className="text-zinc-400">Our AI Mentor is available 24/7 to help you with specific business challenges.</p>
        <button className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20">
          Chat with AI Mentor
        </button>
      </div>
    </div>
  );
};
