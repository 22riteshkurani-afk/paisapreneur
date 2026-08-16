import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, X, Zap, Rocket, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LimitModal: React.FC<LimitModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 blur-[80px] rounded-full" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]">
                <Crown className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Daily Limit Reached</h2>
                <p className="text-zinc-400">You've used all 5 of your free daily AI generations. Upgrade to Premium for unlimited access.</p>
              </div>

              <div className="w-full space-y-3 py-4">
                {[
                  "Unlimited AI Generations",
                  "Advanced Outreach Scripts",
                  "Weekly AI Performance Coach",
                  "Priority Support & Playbooks"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="w-full flex flex-col gap-3">
                <Link
                  to="/pricing"
                  onClick={onClose}
                  className="w-full py-4 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-[0.98]"
                >
                  Go Premium <Zap className="w-5 h-5 fill-current" />
                </Link>
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-zinc-800 text-zinc-400 rounded-2xl font-bold hover:bg-zinc-700 transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
