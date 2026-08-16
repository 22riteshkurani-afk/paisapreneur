import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types';

export const DAILY_LIMIT_FREE = 5;

export function hasReachedLimit(userProfile: UserProfile | null): boolean {
  if (!userProfile) return true;
  if (userProfile.isPremium) return false;
  return userProfile.generationsToday >= DAILY_LIMIT_FREE;
}

export async function incrementGenerations(userId: string) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    generationsToday: increment(1)
  });
}
