export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isPremium: boolean;
  generationsToday: number;
  lastGenerationDate: string;
  incomeGoal: number;
  currentIncome: number;
  onboardingCompleted: boolean;
  currentWeek: number;
}

export interface LaunchMilestone {
  phase: string;
  timeline: string;
  deliverables: string[];
}

export interface MonetizationPath {
  id?: string;
  userId: string;
  skills: string[];
  tools: string[];
  timeAvailable: string;
  recommendedService: string;
  timeline: string;
  suggestedPricing: string;
  launchPlan?: LaunchMilestone[];
  status: 'draft' | 'active';
  createdAt: number;
}

export interface BusinessOffer {
  id?: string;
  userId: string;
  niche: string;
  title: string;
  description: string;
  tiers: {
    name: string;
    price: string;
    deliverables: string[];
  }[];
  locked: boolean;
  createdAt: number;
}

export interface CRMLead {
  id?: string;
  userId: string;
  name: string;
  status: 'Lead' | 'Conversation' | 'Call' | 'Deal';
  lastMessage?: string;
  nextFollowUp?: string;
  value?: number;
  score?: number;
  scoreReasoning?: string;
  nextStep?: string;
  createdAt: number;
}

export interface WeeklyReview {
  id?: string;
  userId: string;
  week: number;
  metrics: {
    dmsSent: number;
    replies: number;
    calls: number;
    deals: number;
  };
  aiFeedback: string;
  nextWeekPlan: string;
  createdAt: number;
}

export interface Task {
  id?: string;
  userId: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface ChatMessage {
  id?: string;
  userId: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface LandingPage {
  id?: string;
  userId: string;
  offerId: string;
  headline: string;
  subheadline: string;
  heroImagePrompt: string;
  benefits: { title: string; description: string }[];
  socialProofPlaceholders: string[];
  ctas: { text: string; goal: string }[];
  selectedCtaIndex: number;
  faq: { question: string; answer: string }[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: number;
}
