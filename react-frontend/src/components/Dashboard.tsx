import React, { useState, useEffect } from 'react';
import { UserProfile, CRMLead, Task } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { Target, TrendingUp, Calendar, Zap, Send, MessageSquare, Phone, CheckCircle2, ChevronRight, ArrowUpRight, BarChart3, Layout, Plus, Trash2, Circle, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface DashboardProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userProfile, onUpdateProfile }) => {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    const qLeads = query(collection(db, 'users', userProfile.uid, 'leads'));
    const unsubscribeLeads = onSnapshot(qLeads, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMLead)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'leads'));

    const qTasks = query(
      collection(db, 'users', userProfile.uid, 'tasks'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'));

    return () => {
      unsubscribeLeads();
      unsubscribeTasks();
    };
  }, [userProfile.uid]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    setIsAddingTask(true);
    try {
      const newTask: Task = {
        userId: userProfile.uid,
        text: taskInput.trim(),
        completed: false,
        createdAt: Date.now()
      };
      await addDoc(collection(db, 'users', userProfile.uid, 'tasks'), newTask);
      setTaskInput('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'tasks');
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      await updateDoc(doc(db, 'users', userProfile.uid, 'tasks', task.id!), {
        completed: !task.completed
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tasks');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userProfile.uid, 'tasks', taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'tasks');
    }
  };

  const metrics = {
    dmsSent: 45, // Mock for now, would come from actual tracking
    replies: 12,
    calls: 4,
    deals: leads.filter(l => l.status === 'Deal').length
  };

  const currentIncome = userProfile.currentIncome || 0;
  const incomeGoal = userProfile.incomeGoal || 25000;
  const progressPercent = (currentIncome / incomeGoal) * 100;

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back, {userProfile.displayName?.split(' ')[0] || 'Entrepreneur'}</h1>
          <p className="text-zinc-400 text-lg">Week {userProfile.currentWeek || 1} of your 90-day monetization sprint.</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 p-2 rounded-2xl">
          <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl font-bold text-sm">
            ₹{currentIncome.toLocaleString()} / ₹{incomeGoal.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-1">Income Goal Progress</p>
              <h2 className="text-3xl font-black">₹{currentIncome.toLocaleString()} <span className="text-zinc-500 text-lg font-normal">earned this month</span></h2>
            </div>
            <div className="text-right">
              <p className="text-emerald-500 font-bold text-xl">{progressPercent.toFixed(1)}%</p>
              <p className="text-zinc-500 text-xs uppercase font-bold">of ₹{incomeGoal.toLocaleString()} goal</p>
            </div>
          </div>
          <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            />
          </div>
        </div>
        <TrendingUp className="absolute -right-10 -bottom-10 w-64 h-64 text-emerald-500/5 rotate-12" />
      </div>

      {/* Action Required Today */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Action Required Today
          </h3>
          <div className="space-y-4">
            {[
              { title: 'Send 10 personalized DMs', icon: Send, color: 'text-blue-500', path: '/outreach' },
              { title: 'Follow up with 3 leads', icon: MessageSquare, color: 'text-emerald-500', path: '/crm' },
              { title: 'Build your landing page', icon: Layout, color: 'text-amber-500', path: '/landing' },
              { title: 'Review weekly performance', icon: BarChart3, color: 'text-purple-500', path: '/coach' }
            ].map((action, i) => (
              <Link 
                key={i}
                to={action.path}
                className="flex items-center justify-between p-5 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:bg-zinc-800/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl bg-zinc-950", action.color)}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-zinc-200">{action.title}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>

        {/* Metrics Snapshot */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Metrics Snapshot</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'DMs Sent', value: metrics.dmsSent, icon: Send, color: 'text-blue-400' },
                { label: 'Replies', value: metrics.replies, icon: MessageSquare, color: 'text-emerald-400' },
                { label: 'Calls', value: metrics.calls, icon: Phone, color: 'text-amber-400' },
                { label: 'Deals', value: metrics.deals, icon: CheckCircle2, color: 'text-purple-400' }
              ].map((m, i) => (
                <div key={i} className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-2">
                  <m.icon className={cn("w-5 h-5", m.color)} />
                  <p className="text-2xl font-black">{m.value}</p>
                  <p className="text-xs text-zinc-500 font-bold uppercase">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center justify-between">
              My Tasks
              <span className="text-xs font-normal text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">{tasks.length}</span>
            </h3>
            
            <form onSubmit={handleAddTask} className="relative">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Add a new task..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              />
              <button
                type="submit"
                disabled={isAddingTask || !taskInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </form>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {tasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 border-2 border-dashed border-zinc-800 rounded-2xl"
                  >
                    <p className="text-zinc-500 text-sm">No tasks yet. Add one above!</p>
                  </motion.div>
                ) : (
                  tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={cn(
                        "group flex items-center justify-between p-4 rounded-xl border transition-all",
                        task.completed 
                          ? "bg-zinc-900/20 border-zinc-800/50 opacity-60" 
                          : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleTask(task)}
                          className={cn(
                            "shrink-0 transition-colors",
                            task.completed ? "text-emerald-500" : "text-zinc-600 hover:text-zinc-400"
                          )}
                        >
                          {task.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                        <span className={cn(
                          "text-sm font-medium truncate",
                          task.completed ? "line-through text-zinc-500" : "text-zinc-200"
                        )}>
                          {task.text}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id!)}
                        className="p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
