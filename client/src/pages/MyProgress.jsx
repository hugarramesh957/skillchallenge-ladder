import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Award,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import progressService from '../services/progressService';
import submissionService from '../services/submissionService';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import DifficultyBadge from '../components/DifficultyBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export const MyProgress = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashRes, subRes] = await Promise.all([
        progressService.getDashboard(),
        submissionService.getMySubmissions(),
      ]);
      setDashboardStats(dashRes.data?.stats);
      setSubmissions(subRes.data?.submissions || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load progress records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Calculating your progress & achievements..." />;
  }

  const stats = dashboardStats || {};
  const diffBreakdown = stats.difficultyBreakdown || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Real-time Tracking</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Learning Ladder Progress
        </h1>
        <p className="mt-1 text-slate-600 text-sm max-w-xl">
          Visual metrics tracking your completed challenges, reviewer evaluation history, and unlocked skill milestones.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Primary Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Challenges"
          value={stats.totalChallenges || 0}
          icon={Layers}
          color="indigo"
        />
        <StatCard
          title="Completed"
          value={stats.completedChallenges || 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="In Progress"
          value={stats.challengesInProgress || 0}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Pending Review"
          value={stats.pendingReviews || 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Needs Revision"
          value={stats.needsImprovement || 0}
          icon={AlertCircle}
          color="rose"
        />
      </div>

      {/* Progress Visualization Strip */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Overall Challenge Completion
          </h2>
          <p className="text-xs text-slate-500">
            {stats.completedChallenges || 0} of {stats.totalChallenges || 0} total practical challenges successfully mastered
          </p>
        </div>

        <ProgressBar
          progress={stats.completionPercentage || 0}
          height="h-3.5"
          color="bg-gradient-to-r from-indigo-500 to-emerald-500"
        />

        {/* Difficulty-wise Completion Grid */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4">
            Progression by Difficulty Tier
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((diff) => {
              const diffData = diffBreakdown[diff] || { total: 0, completed: 0 };
              const percent =
                diffData.total > 0
                  ? Math.round((diffData.completed / diffData.total) * 100)
                  : 0;

              return (
                <div
                  key={diff}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <DifficultyBadge difficulty={diff} size="sm" />
                    <span className="text-xs font-bold text-slate-600">
                      {diffData.completed} / {diffData.total}
                    </span>
                  </div>

                  <ProgressBar progress={percent} showPercentage={true} height="h-2" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submission & Review Evaluation History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Submission & Evaluation History
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {submissions.length} Total Submissions
          </span>
        </div>

        {submissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Challenge</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Attempt</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {sub.challengeId?.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <DifficultyBadge
                        difficulty={sub.challengeId?.difficulty || 'Beginner'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      #{sub.attemptNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(sub.submittedAt || sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          sub.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'needs_revision'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sub.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-800">
                      {sub.score !== null && sub.score !== undefined ? `${sub.score}/100` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/challenges/${sub.challengeId?._id || sub.challengeId}/submit`}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No submissions recorded yet"
            description="Start any available challenge from the catalogue and submit your practical work to see your timeline here."
            actionLabel="Browse Challenges"
            onAction={() => (window.location.href = '/challenges')}
          />
        )}
      </div>
    </div>
  );
};

export default MyProgress;

