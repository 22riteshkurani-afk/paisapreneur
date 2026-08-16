import React, { useState, useEffect } from 'react';
import { UserProfile, CRMLead, BusinessOffer } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Users, Plus, X, MessageSquare, Phone, CheckCircle2, MoreVertical, Trash2, Calendar, DollarSign, Sparkles, TrendingUp, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { scoreLead, suggestNextStep } from '../services/geminiService';

interface CRMPipelineProps {
  userProfile: UserProfile;
}

export const CRMPipeline: React.FC<CRMPipelineProps> = ({ userProfile }) => {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', status: 'Lead' as CRMLead['status'], value: 0 });
  const [activeOffer, setActiveOffer] = useState<BusinessOffer | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);

  const columns: CRMLead['status'][] = ['Lead', 'Conversation', 'Call', 'Deal'];

  useEffect(() => {
    const q = query(collection(db, 'users', userProfile.uid, 'leads'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMLead)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'leads'));

    const qOffer = query(collection(db, 'users', userProfile.uid, 'offers'));
    const unsubscribeOffer = onSnapshot(qOffer, (snapshot) => {
      const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessOffer));
      const active = offers.find(o => o.locked === true) || offers[0];
      if (active) setActiveOffer(active);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'offers'));

    return () => {
      unsubscribe();
      unsubscribeOffer();
    };
  }, [userProfile.uid]);

  const handleAddLead = async () => {
    if (!newLead.name) return;
    setIsScoring(true);
    try {
      let scoreData = { score: 0, reasoning: '' };
      let nextStep = '';

      if (activeOffer) {
        scoreData = await scoreLead(newLead.name, activeOffer);
        nextStep = await suggestNextStep({ name: newLead.name, status: newLead.status }, activeOffer);
      }

      await addDoc(collection(db, 'users', userProfile.uid, 'leads'), {
        userId: userProfile.uid,
        name: newLead.name,
        status: newLead.status,
        value: newLead.value,
        score: scoreData.score,
        scoreReasoning: scoreData.reasoning,
        nextStep: nextStep,
        createdAt: Date.now()
      });
      setNewLead({ name: '', status: 'Lead', value: 0 });
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'leads');
    } finally {
      setIsScoring(false);
    }
  };

  const handleRefreshAI = async (lead: CRMLead) => {
    if (!activeOffer) return;
    try {
      const scoreData = await scoreLead(lead.name, activeOffer);
      const nextStep = await suggestNextStep(lead, activeOffer);
      await updateDoc(doc(db, 'users', userProfile.uid, 'leads', lead.id!), {
        score: scoreData.score,
        scoreReasoning: scoreData.reasoning,
        nextStep: nextStep
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'leads');
    }
  };

  const handleUpdateStatus = async (id: string, status: CRMLead['status']) => {
    try {
      await updateDoc(doc(db, 'users', userProfile.uid, 'leads', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'leads');
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', userProfile.uid, 'leads', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'leads');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Your Client Pipeline</h1>
          <p className="text-zinc-400 text-lg">Track leads, conversations, calls, and closed deals.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" /> Add Lead
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-x-auto pb-6">
        {columns.map((col) => (
          <div key={col} className="space-y-4 min-w-[250px]">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  col === 'Lead' ? "bg-blue-500" :
                  col === 'Conversation' ? "bg-emerald-500" :
                  col === 'Call' ? "bg-amber-500" : "bg-purple-500"
                )} />
                <h3 className="font-bold text-zinc-300">{col}</h3>
              </div>
              <span className="text-xs font-bold text-zinc-600 bg-zinc-900 px-2 py-1 rounded-md">
                {leads.filter(l => l.status === col).length}
              </span>
            </div>

            <div className="space-y-3 min-h-[500px] bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-3">
              {leads.filter(l => l.status === col).map((lead) => (
                <motion.div
                  layoutId={lead.id}
                  key={lead.id}
                  className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3 group relative"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-200">{lead.name}</h4>
                      {lead.score && (
                        <div className="space-y-1.5">
                          <div className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded-full border w-fit flex items-center gap-1",
                            lead.score > 70 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            lead.score > 40 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            "bg-red-500/10 text-red-500 border-red-500/20"
                          )}>
                            <TrendingUp className="w-2.5 h-2.5" />
                            AI Score: {lead.score}
                          </div>
                          {lead.scoreReasoning && (
                            <p className="text-[10px] text-zinc-500 leading-tight italic bg-zinc-950/50 p-1.5 rounded-lg border border-zinc-800/50">
                              {lead.scoreReasoning}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleRefreshAI(lead)}
                        className="p-1 text-zinc-600 hover:text-emerald-500 transition-all"
                        title="Refresh AI Strategy"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteLead(lead.id!)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {lead.nextStep && (
                    <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                        Next Best Action
                      </p>
                      <p className="text-xs text-zinc-300 font-medium leading-tight">{lead.nextStep}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    {lead.value ? (
                      <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm">
                        <DollarSign className="w-3 h-3" />
                        {lead.value.toLocaleString()}
                      </div>
                    ) : <div />}
                    
                    <div className="flex gap-1">
                      {columns.filter(c => c !== col).map((c) => (
                        <button
                          key={c}
                          onClick={() => handleUpdateStatus(lead.id!, c)}
                          className="text-[9px] font-bold text-zinc-500 bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700 transition-all"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Add New Lead</h3>
                <X className="w-6 h-6 text-zinc-500 cursor-pointer" onClick={() => setIsAdding(false)} />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400">Lead Name</label>
                  <input
                    type="text"
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400">Estimated Value (INR)</label>
                  <input
                    type="number"
                    value={newLead.value}
                    onChange={(e) => setNewLead({ ...newLead, value: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. 15000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400">Initial Status</label>
                  <select
                    value={newLead.status}
                    onChange={(e) => setNewLead({ ...newLead, status: e.target.value as CRMLead['status'] })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                  >
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button 
                onClick={handleAddLead}
                disabled={isScoring}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {isScoring ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI Scoring Lead...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Add to Pipeline
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
