import React from 'react';
import { signInWithPopup, googleProvider, auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { LogIn, Rocket } from 'lucide-react';

export const Auth: React.FC = () => {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const newUser: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Entrepreneur',
          photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'E'}&background=10b981&color=fff`,
          isPremium: false,
          generationsToday: 0,
          lastGenerationDate: new Date().toISOString().split('T')[0],
          incomeGoal: 25000,
          currentIncome: 0,
          onboardingCompleted: false,
          currentWeek: 1
        };
        await setDoc(userDocRef, newUser);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_-5px_rgba(16,185,129,0.3)]">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Paisapreneur AI</h1>
          <p className="text-zinc-400 text-lg">Go from idea to revenue in minutes.</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-xl">
          <p className="text-zinc-300 mb-8 leading-relaxed">
            Join thousands of Indian entrepreneurs building profitable businesses with multi-agent AI.
          </p>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-4 px-6 rounded-2xl hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-xl"
          >
            <LogIn className="w-5 h-5" />
            Continue with Google
          </button>
          <p className="mt-6 text-zinc-500 text-sm">
            No credit card required to start.
          </p>
        </div>
      </div>
    </div>
  );
};
