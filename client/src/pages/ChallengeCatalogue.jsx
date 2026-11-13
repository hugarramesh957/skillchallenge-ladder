import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  Filter,
  SlidersHorizontal,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  BookOpen,
  AlertCircle,
  X,
} from 'lucide-react';
import challengeService from '../services/challengeService';
import ChallengeCard from '../components/ChallengeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export const ChallengeCatalogue = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('difficulty_asc');

  const categories = [
    'All',
    'Frontend',
    'JavaScript',
    'API Integration',
    'Full Stack',
    'Backend',
    'Database',
    'Security',
    'Real-Time',
  ];

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const statuses = [
    'All',
    'available',
    'in_progress',
    'submitted',
    'needs_revision',
    'completed',
    'locked',
  ];

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        search: search.trim() || undefined,
        difficulty: difficulty !== 'All' ? difficulty : undefined,
        category: category !== 'All' ? category : undefined,
        status: status !== 'All' ? status : undefined,
        sort,
      };

      const res = await challengeService.getChallenges(params);
      setChallenges(res.data?.challenges || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch challenges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChallenges();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, difficulty, category, status, sort]);

  const clearFilters = () => {
    setSearch('');
    setDifficulty('All');
    setCategory('All');
    setStatus('All');
    setSort('difficulty_asc');
  };

  const hasActiveFilters =
    search || difficulty !== 'All' || category !== 'All' || status !== 'All';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Challenge Ladder</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Practical Challenges
          </h1>
          <p className="mt-1 text-slate-600 text-sm max-w-xl">
            Progress step-by-step from fundamental exercises to production full-stack systems. Complete prerequisites to unlock advanced tiers.
          </p>
        </div>

        {/* Counter Pill */}
        <div className="text-xs text-slate-500 font-semibold bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm self-start md:self-end">
          Showing <span className="text-indigo-600 font-bold">{challenges.length}</span> Challenges
        </div>
      </div>

      {/* Search, Filter and Sort Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Bar */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search challenges by title, description, or skill tag..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Difficulty Filter */}
          <div className="md:col-span-2">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="All">Difficulty: All</option>
              {difficulties.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="All">Category: All</option>
              {categories.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 capitalize"
            >
              <option value="All">Status: All</option>
              {statuses.filter((s) => s !== 'All').map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="md:col-span-1">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="difficulty_asc">Ladder (Easy First)</option>
              <option value="difficulty_desc">Ladder (Hard First)</option>
              <option value="duration_asc">Shortest Time</option>
              <option value="duration_desc">Longest Time</option>
            </select>
          </div>
        </div>

        {/* Clear Filters indicator if filtered */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Filtering applied to catalogue</span>
            <button
              onClick={clearFilters}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Challenge Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Loading challenges..." />
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      ) : challenges.length === 0 ? (
        <EmptyState
          title="No challenges matched your filters"
          description="Try broadening your search keyword or clearing the difficulty/status filters."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge._id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChallengeCatalogue;

