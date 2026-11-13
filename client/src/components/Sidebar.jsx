import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  CheckSquare,
  Award,
  Shield,
  Layers,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { isStudent, isReviewer, user } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/challenges', icon: Compass, label: 'Challenge Catalogue' },
    { to: '/student/progress', icon: CheckSquare, label: 'My Progress' },
  ];

  const reviewerLinks = [
    { to: '/reviewer/dashboard', icon: LayoutDashboard, label: 'Reviewer Dashboard' },
    { to: '/reviewer/challenges', icon: Layers, label: 'Manage Challenges' },
    { to: '/challenges', icon: Compass, label: 'Challenge Catalogue' },
  ];

  const links = isReviewer ? reviewerLinks : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col justify-between py-6 px-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-sm text-slate-800 truncate">{user?.name}</div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 block">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Smart Challenge Highlight Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Unlocking</span>
            </div>
            <p className="text-xs text-indigo-100/90 leading-relaxed">
              Every approved review unlocks higher-difficulty challenges & targeted recommendations.
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Footer Branding in Sidebar */}
      <div className="px-3 text-xs text-slate-400">
        SkillChallenge Ladder v1.0
      </div>
    </aside>
  );
};

export default Sidebar;

