import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Award,
  CheckCircle2,
  Lock,
  Unlock,
  TrendingUp,
  Cpu,
  Compass,
  Code2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { user, isStudent, isReviewer } = useAuth();

  const primaryActionLink = user
    ? isReviewer
      ? '/reviewer/dashboard'
      : '/student/dashboard'
    : '/register';

  const primaryActionText = user ? 'Go to My Dashboard' : 'Get Started Free';

  const steps = [
    {
      num: '01',
      title: 'Choose a Challenge',
      desc: 'Start at your current skill tier with clear instructions, expected deliverables, and helpful hints.',
    },
    {
      num: '02',
      title: 'Complete the Task',
      desc: 'Build hands-on practical solutions using real tools, writing clean, accessible, and structured code.',
    },
    {
      num: '03',
      title: 'Submit Your Work',
      desc: 'Provide your GitHub repository, live URL demo, and a detailed explanation of your architectural approach.',
    },
    {
      num: '04',
      title: 'Receive Feedback',
      desc: 'Gain expert mentor scoring, identified strengths, pinpointed improvement areas, and recommended focus tags.',
    },
    {
      num: '05',
      title: 'Unlock Your Next Challenge',
      desc: 'Our rule-based engine automatically unlocks dependent challenges and personalizes your optimal next steps.',
    },
  ];

  const difficultyTiers = [
    {
      level: 'Beginner',
      badge: 'Tier 1',
      title: 'Foundational Exercises',
      desc: 'Master semantic HTML5, modern CSS flexbox & grid, and basic DOM manipulation with guided hints.',
      color: 'from-emerald-500/20 to-emerald-50 border-emerald-200 text-emerald-800',
      pill: 'bg-emerald-100 text-emerald-700',
    },
    {
      level: 'Intermediate',
      badge: 'Tier 2',
      title: 'Problem-Solving & State',
      desc: 'Tackle state management, asynchronous REST APIs, dynamic data tables, and client storage.',
      color: 'from-blue-500/20 to-blue-50 border-blue-200 text-blue-800',
      pill: 'bg-blue-100 text-blue-700',
    },
    {
      level: 'Advanced',
      badge: 'Tier 3',
      title: 'Deep Practical Engineering',
      desc: 'Architect Express REST APIs, Mongoose database schemas, compound indexing, and JWT authentication.',
      color: 'from-purple-500/20 to-purple-50 border-purple-200 text-purple-800',
      pill: 'bg-purple-100 text-purple-700',
    },
    {
      level: 'Expert',
      badge: 'Tier 4',
      title: 'Complex Real-World Systems',
      desc: 'Build real-time WebSocket applications, collaborative Kanban systems, and scalable full-stack platforms.',
      color: 'from-rose-500/20 to-rose-50 border-rose-200 text-rose-800',
      pill: 'bg-rose-100 text-rose-700',
    },
  ];

  const keyFeatures = [
    {
      icon: Layers,
      title: 'Progressive Challenges',
      desc: 'Structured ladder ensuring foundational competence before progressing to high-difficulty projects.',
    },
    {
      icon: TrendingUp,
      title: 'Submission Tracking',
      desc: 'Detailed history of every attempt, revision request, timestamp, and progressive score improvements.',
    },
    {
      icon: Award,
      title: 'Reviewer Feedback & Scoring',
      desc: 'Constructive evaluations from experienced mentors highlighting code quality, creativity, and strengths.',
    },
    {
      icon: Unlock,
      title: 'Smart Challenge Unlocking',
      desc: 'Backend-verified prerequisite evaluation that automatically opens new challenges upon reviewer approval.',
    },
    {
      icon: Sparkles,
      title: 'Personalized Recommendations',
      desc: 'Intelligent rule-based recommendation engine matching your reviewer feedback tags and score trajectory.',
    },
    {
      icon: Shield,
      title: 'Role-Based Security',
      desc: 'Enterprise-grade JWT authentication with HttpOnly cookies, Zod validation, and role protection.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-indigo-50/60 via-slate-50 to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Next-Generation Practical Skill Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Your Skills. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
                  Your Challenges.
                </span> <br />
                Your Growth.
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                SkillChallenge Ladder replaces unstructured tutorials with a practical challenge catalogue. Start with beginner exercises, submit code, receive mentor feedback, and automatically unlock higher-difficulty tiers.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to={primaryActionLink}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>{primaryActionText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/challenges"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-base shadow-sm hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span>Explore Challenges</span>
                </Link>
              </div>

              {/* Quick Trust Stat Strip */}
              <div className="pt-6 border-t border-slate-200/80 flex items-center justify-center lg:justify-start gap-8 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Prerequisite-Gated Ladder</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Actionable Reviewer Feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Zero Placeholder Data</span>
                </div>
              </div>
            </div>

            {/* Right Graphic: Progressive Ladder Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-indigo-500/5 relative">
                {/* Visual Ladder progression items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <span className="font-bold text-sm text-slate-800">
                        Smart Challenge Progression
                      </span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> Auto-Unlocking
                    </span>
                  </div>

                  {/* Progressive Mock Nodes */}
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-indigo-500 before:to-slate-200">
                    {/* Node 1: Completed */}
                    <div className="relative p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                      <div className="absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                      <div>
                        <div className="text-xs font-bold text-emerald-900">
                          1. Personal HTML Profile
                        </div>
                        <div className="text-[11px] text-emerald-700">Approved • Score 94/100</div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>

                    {/* Node 2: Unlocked & In Progress */}
                    <div className="relative p-3.5 rounded-xl bg-indigo-50/90 border border-indigo-200 flex items-center justify-between shadow-sm">
                      <div className="absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                      <div>
                        <div className="text-xs font-bold text-indigo-950">
                          2. Responsive Landing Page
                        </div>
                        <div className="text-[11px] text-indigo-700">Unlocked • Ready to submit</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
                        ACTIVE
                      </span>
                    </div>

                    {/* Node 3: Locked */}
                    <div className="relative p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between opacity-75">
                      <div className="absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full bg-slate-300 ring-4 ring-white" />
                      <div>
                        <div className="text-xs font-bold text-slate-600">
                          3. Personal Portfolio Website
                        </div>
                        <div className="text-[11px] text-slate-400">Locked • Requires #2 completion</div>
                      </div>
                      <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>

                    {/* Node 4: Advanced Locked */}
                    <div className="relative p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between opacity-50">
                      <div className="absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full bg-slate-300 ring-4 ring-white" />
                      <div>
                        <div className="text-xs font-bold text-slate-500">
                          4. Full-Stack REST API & Auth
                        </div>
                        <div className="text-[11px] text-slate-400">Locked • Advanced Tier</div>
                      </div>
                      <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <span className="text-xs text-slate-500 italic">
                      "Start Small. Build Skills. Reach Higher."
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-2">
              Structured Methodology
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              How SkillChallenge Ladder Works
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              A 5-step continuous cycle designed to transform passive theoretical study into practical engineering mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                    {step.num}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge Difficulty Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-2">
              Progressive Difficulty
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Four Levels of Practical Mastery
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              Every level demands deeper comprehension, testing algorithmic reasoning, robust system architecture, and production readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {difficultyTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-6 bg-gradient-to-b ${tier.color} border shadow-sm flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tier.pill}`}>
                      {tier.badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {tier.level}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {tier.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {tier.desc}
                  </p>
                </div>

                <Link
                  to={`/challenges?difficulty=${tier.level}`}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1.5 transition-colors"
                >
                  <span>Explore {tier.level}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-2">
              Engineered For Excellence
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Why SkillChallenge Ladder Works
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              A balanced blend of learning management, strict verification rules, and gamified progress tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {keyFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to climb your practical skill ladder?
          </h2>
          <p className="text-indigo-200 text-base max-w-xl mx-auto">
            Join students leveling up their development skills through structured challenges, expert reviewer critiques, and automatic challenge unlocks.
          </p>
          <div className="pt-2">
            <Link
              to={primaryActionLink}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-900 font-bold text-sm hover:bg-indigo-50 shadow-lg shadow-black/20 hover:scale-105 transition-all"
            >
              <span>{primaryActionText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

