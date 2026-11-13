import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="m4 19 8-14 8 14" />
                  <path d="M7.5 13h9" />
                  <path d="M6 16h12" />
                  <path d="M9 10h6" />
                </svg>
              </div>
              <span className="font-bold text-white text-base">
                SkillChallenge <span className="text-indigo-400">Ladder</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Start Small. Build Skills. Reach Higher. Practical skill development through structured challenges and reviewer feedback.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/challenges" className="hover:text-white transition-colors">
                  All Challenges
                </Link>
              </li>
              <li>
                <Link to="/challenges?difficulty=Beginner" className="hover:text-white transition-colors">
                  Beginner Level
                </Link>
              </li>
              <li>
                <Link to="/challenges?difficulty=Intermediate" className="hover:text-white transition-colors">
                  Intermediate Level
                </Link>
              </li>
              <li>
                <Link to="/challenges?difficulty=Advanced" className="hover:text-white transition-colors">
                  Advanced Level
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-400">Smart Challenge Unlocking</li>
              <li className="text-slate-400">Personalized Recommendations</li>
              <li className="text-slate-400">Reviewer Scoring & Mentorship</li>
              <li className="text-slate-400">Dynamic Learning Ladder</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Platform
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Built on the modern MERN Stack with strict role-based access control and rule-based recommendation logic.
            </p>
            <div className="text-xs text-indigo-400 font-medium">
              support@skillchallengeladder.edu
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-800 text-xs text-center text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} SkillChallenge Ladder. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Code of Conduct</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

