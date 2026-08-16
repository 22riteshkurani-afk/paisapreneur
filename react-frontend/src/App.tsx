import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { UserProfile } from './types';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { MentorChat } from './components/MentorChat';
import { MonetizationPath } from './components/MonetizationPath';
import { OfferBuilder } from './components/OfferBuilder';
import { LandingPageBuilder } from './components/LandingPageBuilder';
import { OutreachEngine } from './components/OutreachEngine';
import { CRMPipeline } from './components/CRMPipeline';
import { WeeklyCoach } from './components/WeeklyCoach';
import { Playbooks } from './components/Playbooks';
import { Pricing } from './components/Pricing';
import { HelpCenter } from './components/HelpCenter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const profile = snapshot.data() as UserProfile;
        
        // Reset daily generations if it's a new day
        const today = new Date().toISOString().split('T')[0];
        if (profile.lastGenerationDate !== today) {
          const updatedProfile = { 
            ...profile, 
            generationsToday: 0, 
            lastGenerationDate: today,
            incomeGoal: profile.incomeGoal || 25000,
            currentIncome: profile.currentIncome || 0,
            onboardingCompleted: profile.onboardingCompleted || false,
            currentWeek: profile.currentWeek || 1
          };
          setUserProfile(updatedProfile);
          updateDoc(doc(db, 'users', user.uid), updatedProfile);
        } else {
          setUserProfile(profile);
        }
      } else {
        // Create initial profile if it doesn't exist
        const initialProfile: UserProfile = {
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
        setUserProfile(initialProfile);
        setDoc(doc(db, 'users', user.uid), initialProfile);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-zinc-500 font-medium animate-pulse">Initializing Paisapreneur AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (userProfile && !userProfile.onboardingCompleted) {
    return <Onboarding userProfile={userProfile} />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Layout userProfile={userProfile}>
          <Routes>
            <Route 
              path="/" 
              element={userProfile ? <Dashboard userProfile={userProfile} onUpdateProfile={setUserProfile} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/path" 
              element={userProfile ? <MonetizationPath userProfile={userProfile} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/offer" 
              element={userProfile ? <OfferBuilder userProfile={userProfile} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/landing" 
              element={userProfile ? <LandingPageBuilder userProfile={userProfile} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/outreach" 
              element={userProfile ? <OutreachEngine userProfile={userProfile} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/crm" 
              element={userProfile ? <CRMPipeline userProfile={userProfile} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/coach" 
              element={userProfile ? <WeeklyCoach userProfile={userProfile} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/playbooks" 
              element={userProfile ? <Playbooks /> : <Navigate to="/" />} 
            />
            <Route 
              path="/chat" 
              element={userProfile ? <MentorChat userProfile={userProfile} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/pricing" 
              element={userProfile ? <Pricing userProfile={userProfile} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/help" 
              element={userProfile ? <HelpCenter /> : <Navigate to="/" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}
