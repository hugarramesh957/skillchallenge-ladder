import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  BookOpen,
  ArrowLeft,
  FileCode,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import challengeService from '../services/challengeService';
import progressService from '../services/progressService';
import DifficultyBadge from '../components/DifficultyBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

export const ChallengeDetails = () => {
  const { id } = useParams();
  const { user, isStudent } = useAuth();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');

  // Hints disclosure state
  const [revealedHints, setRevealedHints] = useState({});

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await challengeService.getChallengeById(id);
      setChallenge(res.data?.challenge);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load challenge details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  const toggleHint = (idx) => {
    setRevealedHints((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleStartChallenge = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setStarting(true);
      setStartError('');
      await progressService.startChallenge(challenge._id);
      // Navigate directly to submission page
      navigate(`/challenges/${challenge._id}/submit`);
    } catch (err) {
      setStartError(
        err.response?.data?.message || 'Could not start challenge. Ensure all prerequisites are met.'
      );
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading challenge details..." />;
  }

  if (error || !challenge) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error || 'Challenge not found.'}
        </div>
        <Link
          to="/challenges"
          className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalogue
        </Link>
      </div>
    );
  }

  const isLocked = isStudent && (challenge.status === 'locked' || challenge.isUnlocked === false);
  const isCompleted = challenge.status === 'completed';
  const isSubmitted = challenge.status === 'submitted';
  const needsRevision = challenge.status === 'needs_revision';
  const isInProgress = challenge.status === 'in_progress';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Back button */}
      <div>
        <Link
          to="/challenges"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </Link>
      </div>

      {/* Locked Notice Banner */}
      {isLocked && (
        <div className="rounded-2xl p-5 bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">This Challenge is Locked</h4>
            <p className="mt-1 text-xs text-amber-800">
              You must complete and receive approved reviews on all prerequisite challenges before starting or submitting work for this challenge.
            </p>
          </div>
        </div>
      )}

      {/* Start Error Banner */}
      {startError && (
        <div className="rounded-2xl p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{startError}</span>
        </div>
      )}

      {/* Main Challenge Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={challenge.difficulty} />
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {challenge.category}
            </span>
          </div>

          <div className="flex items-center text-xs text-slate-500 gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Estimated Duration: ~{challenge.estimatedMinutes} minutes</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {challenge.title}
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          {challenge.description}
        </p>

        {/* Required Skills */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {challenge.skills?.map((skill, idx) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[11px]"
            >
              #{skill}
            </span>
          ))}
        </div>

        {/* Action Button Strip */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Status:{' '}
            <span className="font-bold text-slate-800 capitalize">
              {challenge.status ? challenge.status.replace('_', ' ') : 'Available'}
            </span>
          </div>

          {isStudent && (
            <div>
              {isLocked ? (
                <button
                  disabled
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Locked (Prerequisites Required)
                </button>
              ) : isCompleted ? (
                <Link
                  to={`/challenges/${challenge._id}/submit`}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> View Approved Submission
                </Link>
              ) : isSubmitted ? (
                <Link
                  to={`/challenges/${challenge._id}/submit`}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <Clock className="w-4 h-4" /> Submission Under Review
                </Link>
              ) : needsRevision ? (
                <Link
                  to={`/challenges/${challenge._id}/submit`}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse"
                >
                  <AlertCircle className="w-4 h-4" /> Submit Revised Work
                </Link>
              ) : isInProgress ? (
                <Link
                  to={`/challenges/${challenge._id}/submit`}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20"
                >
                  <BookOpen className="w-4 h-4" /> Continue & Submit Work
                </Link>
              ) : (
                <button
                  onClick={handleStartChallenge}
                  disabled={starting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/25 transition-all"
                >
                  {starting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Challenge</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Problem Statement & Detailed Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Problem Statement */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-600" />
              Problem Statement
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {challenge.problemStatement}
            </p>
          </div>

          {/* Detailed Instructions */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Detailed Instructions
            </h2>
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 font-sans">
              {challenge.instructions}
            </div>
          </div>

          {/* Expected Deliverables */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Expected Deliverables
            </h2>
            <ul className="space-y-2">
              {challenge.deliverables?.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Expandable Hints System */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">
                Available Hints ({challenge.hints?.length || 0})
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Need inspiration or stuck on an edge case? Reveal hints sequentially.
            </p>

            <div className="space-y-3 pt-2">
              {challenge.hints?.map((hint, idx) => {
                const isOpen = !!revealedHints[idx];
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleHint(idx)}
                      className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>Hint {idx + 1}</span>
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-5 bg-white text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 animate-fadeIn">
                        {hint}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Info: Prerequisites Tree & Previous Attempts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Prerequisites Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              Prerequisites ({challenge.prerequisites?.length || 0})
            </h3>

            {challenge.prerequisites && challenge.prerequisites.length > 0 ? (
              <div className="space-y-2.5">
                {challenge.prerequisites.map((prereq) => (
                  <Link
                    key={prereq._id}
                    to={`/challenges/${prereq._id || prereq.slug}`}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all block space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <DifficultyBadge difficulty={prereq.difficulty} size="sm" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 hover:text-indigo-600">
                      {prereq.title}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium">
                No prerequisites required! This challenge is immediately open to beginners.
              </div>
            )}
          </div>

          {/* Previous Submissions Card (if student has attempted before) */}
          {challenge.submissions && challenge.submissions.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-purple-600" />
                Your Previous Attempts ({challenge.submissions.length})
              </h3>

              <div className="space-y-2">
                {challenge.submissions.map((sub) => (
                  <div
                    key={sub._id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        Attempt #{sub.attemptNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          sub.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : sub.status === 'needs_revision'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {sub.status.replace('_', ' ')}
                      </span>
                    </div>

                    {sub.score !== null && sub.score !== undefined && (
                      <div className="text-indigo-600 font-extrabold text-xs">
                        Score: {sub.score}/100
                      </div>
                    )}

                    {sub.reviewerFeedback && (
                      <p className="text-slate-600 italic text-[11px] line-clamp-2">
                        "{sub.reviewerFeedback}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetails;

