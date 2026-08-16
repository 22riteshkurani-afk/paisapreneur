import React, { ReactNode } from 'react';
import { auth, signOut } from '../lib/firebase';
import { UserProfile } from '../types';
import { LogOut, Rocket, LayoutDashboard, Target, Package, Send, Users, BarChart3, BookOpen, MessageSquare, Crown, HelpCircle, Layout as LayoutIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: ReactNode;
  userProfile: UserProfile | null;
}

export const Layout: React.FC<LayoutProps> = ({ children, userProfile }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Monetization Path', icon: Target, path: '/path' },
    { label: 'Offer Builder', icon: Package, path: '/offer' },
    { label: 'Landing Page', icon: LayoutIcon, path: '/landing' },
    { label: 'Outreach Engine', icon: Send, path: '/outreach' },
    { label: 'CRM Pipeline', icon: Users, path: '/crm' },
    { label: 'Weekly Coach', icon: BarChart3, path: '/coach' },
    { label: 'Playbooks', icon: BookOpen, path: '/playbooks' },
    { label: 'AI Mentor', icon: MessageSquare, path: '/chat' },
    { label: 'Help Center', icon: HelpCircle, path: '/help' },
    { label: 'Pricing', icon: Crown, path: '/pricing' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-col gap-8 bg-zinc-950/50 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Paisapreneur</span>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                location.pathname === item.path 
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", location.pathname === item.path ? "text-emerald-500" : "text-zinc-500")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-800 flex flex-col gap-4">
          {userProfile && (
            <div className="flex items-center gap-3 px-2">
              <img src={userProfile.photoURL} alt={userProfile.displayName} className="w-10 h-10 rounded-full border border-zinc-700" referrerPolicy="no-referrer" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">{userProfile.displayName}</span>
                <div className="flex items-center gap-1">
                  {userProfile.isPremium ? (
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                      <Crown className="w-2 h-2" /> Premium
                    </span>
                  ) : (
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">Free Plan</span>
                  )}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut(auth)}
            className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-5xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};
