import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  CheckSquare,
  Clock,
  Sparkles,
  TrendingUp,
  Award,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Unlock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import progressService from '../services/progressService';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import DifficultyBadge from '../components/DifficultyBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await progressService.getDashboard();
      setDashboardData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your dashboard & smart recommendations..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchDashboard}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, continueLearning, recommendation, recentActivity } = dashboardData || {};
  const recChallenge = recommendation?.recommendation;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Personalized Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practical Learning Ladder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-indigo-100 text-sm leading-relaxed">
            You are currently working at the{' '}
            <span className="font-bold text-amber-300">{stats?.currentDifficulty || 'Beginner'}</span>{' '}
            tier. Complete your current challenges and apply mentor feedback to unlock higher levels!
          </p>
        </div>

        {/* Quick Progression Metric in Hero */}
        <div className="mt-6 pt-6 border-t border-indigo-700/60 max-w-lg">
          <div className="flex justify-between items-center text-xs text-indigo-200 mb-1.5">
            <span>Overall Ladder Completion</span>
            <span className="font-bold text-white">{stats?.completionPercentage || 0}%</span>
          </div>
          <div className="w-full bg-indigo-950/60 rounded-full h-2.5 overflow-hidden border border-indigo-600/30">
            <div
              className="bg-emerald-400 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${stats?.completionPercentage || 0}%` }}
            />
          </div>
        </div>

        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Live MongoDB-Driven Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Challenges"
          value={stats?.totalChallenges ?? 0}
          subtitle="In platform catalogue"
          icon={Compass}
          color="indigo"
        />
        <StatCard
          title="Completed"
          value={stats?.completedChallenges ?? 0}
          subtitle="Approved by reviewer"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="In Progress"
          value={stats?.challengesInProgress ?? 0}
          subtitle="Currently tackling"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Available"
          value={stats?.availableChallenges ?? 0}
          subtitle="Unlocked & ready"
          icon={Unlock}
          color="purple"
        />
        <StatCard
          title="Pending Reviews"
          value={stats?.pendingReviews ?? 0}
          subtitle="Waiting for feedback"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* HIGHLIGHTED SECTION: Recommended Next Challenge (Main Feature) */}
      <section className="rounded-3xl bg-white border-2 border-indigo-400/80 p-6 sm:p-8 shadow-lg shadow-indigo-500/5 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
              Smart Progression Engine
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Your Next Challenge
            </h2>
          </div>
        </div>

        {recChallenge ? (
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 rounded-2xl p-6 border border-indigo-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <DifficultyBadge difficulty={recChallenge.difficulty} />
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                  {recChallenge.category}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  ~{recChallenge.estimatedMinutes || 60} mins
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                {recChallenge.title}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                {recChallenge.description}
              </p>

              {/* Required Skills */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs font-semibold text-slate-500 mr-1">
                  Skills:
                </span>
                {recChallenge.skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono text-[11px]"
                  >
                    #{skill}
                  </span>
                ))}
              </div>

              {/* Explanation of Recommendation */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Why recommended: </span>
                  {recommendation?.reason || 'Optimal challenge based on your current ladder tier and skills.'}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="shrink-0 flex flex-col gap-2">
              <Link
                to={`/challenges/${recChallenge._id || recChallenge.slug}`}
                className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Start This Challenge</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/challenges"
                className="text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1"
              >
                Browse all {stats?.totalChallenges} challenges
              </Link>
            </div>
          </div>
        ) : (
          <EmptyState
            title="All available challenges completed!"
            description="You have completed all currently unlocked challenges. Wait for your pending reviewer feedback to unlock your next milestone."
            actionLabel="View My Progress"
            onAction={() => (window.location.href = '/student/progress')}
          />
        )}
      </section>

      {/* Grid: Continue Learning & Latest Reviewer Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Continue Learning (In-Progress / Needs Revision) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Continue Learning
            </h2>
            <Link
              to="/challenges"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Catalogue →
            </Link>
          </div>

          {continueLearning && continueLearning.length > 0 ? (
            <div className="space-y-3">
              {continueLearning.map((item) => (
                <div
                  key={item._id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <DifficultyBadge difficulty={item.difficulty} size="sm" />
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.reasonBadge === 'Needs Improvement'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.reasonBadge}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {item.category} • ~{item.estimatedMinutes} mins
                    </p>
                  </div>

                  <Link
                    to={`/challenges/${item._id || item.slug}`}
                    className="shrink-0 px-4 py-2 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-indigo-600 transition-all"
                  >
                    {item.status === 'needs_revision' ? 'Revise' : 'Continue'}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No challenges in progress. Select a challenge from the catalogue or start your recommended challenge above!
            </div>
          )}
        </div>

        {/* Latest Reviewer Feedback */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Latest Reviewer Feedback
            </h2>
          </div>

          {recentActivity?.latestFeedback ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900">
                    {recentActivity.latestFeedback.challengeId?.title}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white text-purple-700 font-extrabold text-xs shadow-sm">
                    {recentActivity.latestFeedback.score}/100
                  </span>
                </div>

                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{recentActivity.latestFeedback.reviewerFeedback}"
                </p>

                {recentActivity.latestFeedback.strengths && (
                  <div className="text-xs">
                    <span className="font-bold text-emerald-700">Strengths: </span>
                    <span className="text-slate-600">
                      {recentActivity.latestFeedback.strengths}
                    </span>
                  </div>
                )}

                {recentActivity.latestFeedback.improvementAreas && (
                  <div className="text-xs">
                    <span className="font-bold text-rose-700">Areas for Growth: </span>
                    <span className="text-slate-600">
                      {recentActivity.latestFeedback.improvementAreas}
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 pt-1">
                  Reviewed by {recentActivity.latestFeedback.reviewedBy?.name || 'Lead Reviewer'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No reviewed submissions yet. Submit completed practical work to receive mentor evaluations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

