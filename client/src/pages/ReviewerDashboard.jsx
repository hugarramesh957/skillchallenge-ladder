import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Layers,
  Search,
  Filter,
  ArrowRight,
  Eye,
} from 'lucide-react';
import submissionService from '../services/submissionService';
import StatCard from '../components/StatCard';
import DifficultyBadge from '../components/DifficultyBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export const ReviewerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('pending'); // default to pending queue
  const [search, setSearch] = useState('');

  const fetchDashboardAndQueue = async () => {
    try {
      setLoading(true);
      setError('');

      const [dashRes, subRes] = await Promise.all([
        submissionService.getReviewerDashboard(),
        submissionService.getReviewerSubmissions({
          status: statusFilter !== 'All' ? statusFilter : undefined,
          search: search.trim() || undefined,
        }),
      ]);

      setDashboardData(dashRes.data);
      setSubmissions(subRes.data?.submissions || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reviewer dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardAndQueue();
    }, 200);
    return () => clearTimeout(timer);
  }, [statusFilter, search]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading reviewer command center..." />;
  }

  const stats = dashboardData?.stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>Reviewer Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Submission Review Queue
          </h1>
          <p className="mt-1 text-slate-600 text-sm">
            Evaluate student practical implementations, assign scores, and provide guidance that powers smart challenge unlocking.
          </p>
        </div>

        <Link
          to="/reviewer/challenges"
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <Layers className="w-4 h-4" />
          <span>Manage Challenges</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Reviewer Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents || 0}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Challenges"
          value={stats.totalChallenges || 0}
          icon={Layers}
          color="purple"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingSubmissions || 0}
          badgeText={stats.pendingSubmissions > 0 ? 'Action Needed' : 'Clear'}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Reviewed"
          value={stats.reviewedSubmissions || 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Needs Revision"
          value={stats.challengesRequiringImprovement || 0}
          icon={AlertCircle}
          color="rose"
        />
      </div>

      {/* Submission Queue Filtering Toolbar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['pending', 'All', 'approved', 'needs_revision'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'All' ? 'All Submissions' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student or challenge..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        {/* Submissions Table */}
        {submissions.length > 0 ? (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Challenge</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sub.studentId?.name}</div>
                      <div className="text-[11px] text-slate-400">{sub.studentId?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {sub.challengeId?.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <DifficultyBadge
                        difficulty={sub.challengeId?.difficulty || 'Beginner'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(sub.submittedAt || sub.createdAt).toLocaleString()}
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
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/reviewer/submissions/${sub._id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all shadow-sm"
                      >
                        <span>{sub.status === 'pending' ? 'Review Now' : 'View Review'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No submissions found"
            description="The queue is currently clear for the selected filter."
          />
        )}
      </div>
    </div>
  );
};

export default ReviewerDashboard;

