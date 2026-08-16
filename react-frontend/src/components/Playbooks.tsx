import React from 'react';
import { BookOpen, Send, MessageSquare, Phone, CheckCircle2, Zap, ArrowRight, PlayCircle, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export const Playbooks: React.FC = () => {
  const playbooks = [
    {
      title: 'The First 10 DMs',
      description: 'How to send your first 10 outreach messages without sounding like a bot.',
      icon: Send,
      color: 'text-blue-500',
      category: 'Outreach',
      time: '5 min read'
    },
    {
      title: 'Handling Objections',
      description: 'Common client objections and exactly how to handle them to close the deal.',
      icon: MessageSquare,
      color: 'text-emerald-500',
      category: 'Sales',
      time: '8 min read'
    },
    {
      title: 'The Perfect Discovery Call',
      description: 'A step-by-step script for your first client call to ensure you land the project.',
      icon: Phone,
      color: 'text-amber-500',
      category: 'Sales',
      time: '10 min read'
    },
    {
      title: 'D2C Brand Launch',
      description: 'Case study of how a founder launched a skincare brand in 30 days using AI.',
      icon: Zap,
      color: 'text-purple-500',
      category: 'Case Study',
      time: '12 min read'
    }
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Execution Library</h1>
        <p className="text-zinc-400 text-lg">Actionable playbooks, scripts, and case studies to speed up your execution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {playbooks.map((p, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl hover:bg-zinc-800/50 transition-all group cursor-pointer relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className={cn("p-3 rounded-xl bg-zinc-950 shadow-lg", p.color)}>
                  <p.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                  {p.category}
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white group-hover:text-emerald-500 transition-colors">{p.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{p.description}</p>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold">
                  <PlayCircle className="w-4 h-4" />
                  {p.time}
                </div>
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm group-hover:translate-x-1 transition-transform">
                  Read Playbook <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
            <FileText className="absolute -right-10 -bottom-10 w-48 h-48 text-emerald-500/5 rotate-12 group-hover:scale-110 transition-transform" />
          </div>
        ))}
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Need a specific playbook?</h3>
        <p className="text-zinc-400 max-w-md mx-auto">Our AI Mentor can generate custom playbooks for your specific niche and service.</p>
        <button className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20">
          Ask AI Mentor
        </button>
      </div>
    </div>
  );
};
