import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Github,
  Globe,
  Star,
  Sparkles,
  Loader2,
  Clock,
  User,
  Unlock,
} from 'lucide-react';
import submissionService from '../services/submissionService';
import DifficultyBadge from '../components/DifficultyBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export const ReviewSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [previousAttempts, setPreviousAttempts] = useState([]);
  const [studentSummary, setStudentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resultBanner, setResultBanner] = useState(null);

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    decision: 'approved',
    score: 85,
    correctnessRating: 4,
    codeQualityRating: 4,
    creativityRating: 4,
    reviewerFeedback: '',
    strengths: '',
    improvementAreas: '',
    tagsInput: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await submissionService.getSubmissionForReview(id);
      const sub = res.data?.submission;
      setSubmission(sub);
      setPreviousAttempts(res.data?.previousAttempts || []);
      setStudentSummary(res.data?.studentSummary || null);

      // Prepopulate form if already reviewed
      if (sub && sub.status !== 'pending') {
        setReviewForm({
          decision: sub.status,
          score: sub.score ?? 80,
          correctnessRating: sub.correctnessRating ?? 4,
          codeQualityRating: sub.codeQualityRating ?? 4,
          creativityRating: sub.creativityRating ?? 4,
          reviewerFeedback: sub.reviewerFeedback || '',
          strengths: sub.strengths || '',
          improvementAreas: sub.improvementAreas || '',
          tagsInput: (sub.recommendedFocusTags || []).join(', '),
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch submission details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const validate = () => {
    const errs = {};
    if (reviewForm.score < 0 || reviewForm.score > 100) {
      errs.score = 'Score must be between 0 and 100';
    }
    if (!reviewForm.reviewerFeedback.trim()) {
      errs.reviewerFeedback = 'Written feedback is required (min 5 characters)';
    } else if (reviewForm.reviewerFeedback.trim().length < 5) {
      errs.reviewerFeedback = 'Written feedback must be at least 5 characters';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReviewSubmit = async (e, decision) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError('');

    try {
      const tags = reviewForm.tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        decision: decision || reviewForm.decision,
        score: Number(reviewForm.score),
        correctnessRating: Number(reviewForm.correctnessRating),
        codeQualityRating: Number(reviewForm.codeQualityRating),
        creativityRating: Number(reviewForm.creativityRating),
        reviewerFeedback: reviewForm.reviewerFeedback.trim(),
        strengths: reviewForm.strengths.trim(),
        improvementAreas: reviewForm.improvementAreas.trim(),
        recommendedFocusTags: tags,
      };

      const res = await submissionService.reviewSubmission(id, payload);

      setResultBanner({
        message: res.message,
        decision: payload.decision,
        newlyUnlocked: res.data?.newlyUnlocked || [],
        updatedRecommendation: res.data?.updatedRecommendation || null,
      });

      // Refetch submission
      await fetchSubmission();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading submission evaluation workspace..." />;
  }

  if (error && !submission) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
        <Link
          to="/reviewer/dashboard"
          className="mt-4 inline-flex items-center gap-2 text-purple-600 font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Review Queue
        </Link>
      </div>
    );
  }

  const challenge = submission.challengeId;
  const student = submission.studentId;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Back button */}
      <div>
        <Link
          to="/reviewer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Review Queue</span>
        </Link>
      </div>

      {/* Success / Smart Unlocking Result Banner */}
      {resultBanner && (
        <div
          className={`rounded-3xl p-6 border shadow-md space-y-3 ${
            resultBanner.decision === 'approved'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-base">{resultBanner.message}</h3>
          </div>

          {resultBanner.decision === 'approved' && resultBanner.newlyUnlocked?.length > 0 && (
            <div className="pt-2 border-t border-emerald-200 text-xs">
              <span className="font-bold flex items-center gap-1.5 mb-2">
                <Unlock className="w-4 h-4 text-emerald-600" />
                Newly Unlocked Challenges for this Student:
              </span>
              <ul className="list-disc list-inside space-y-1 text-emerald-900">
                {resultBanner.newlyUnlocked.map((c) => (
                  <li key={c._id} className="font-semibold">
                    {c.title} ({c.difficulty})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Student & Challenge Context Strip */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Student Profile Card */}
        <div className="md:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base">
              {student?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">{student?.name}</h3>
              <p className="text-xs text-slate-500">{student?.email}</p>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-1.5">
            <div>
              <span className="text-slate-400">Enrolled: </span>
              {new Date(student?.createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="text-slate-400">Total Completed: </span>
              <span className="font-bold text-slate-800">
                {studentSummary?.totalCompleted || 0} Challenges
              </span>
            </div>
            <div>
              <span className="text-slate-400">Current Attempt: </span>
              <span className="font-bold text-purple-700">
                Attempt #{submission.attemptNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Challenge Summary Card */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DifficultyBadge difficulty={challenge?.difficulty} />
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                {challenge?.category}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              Submitted: {new Date(submission.submittedAt || submission.createdAt).toLocaleString()}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900">{challenge?.title}</h2>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {challenge?.problemStatement}
          </p>

          <div className="flex items-center gap-2 pt-2">
            <Link
              to={`/challenges/${challenge?._id}`}
              target="_blank"
              className="text-xs font-semibold text-purple-600 hover:text-purple-800"
            >
              View Full Challenge Brief & Deliverables →
            </Link>
          </div>
        </div>
      </div>

      {/* Student's Practical Submission Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Student Implementation & Deliverables
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              submission.status === 'approved'
                ? 'bg-emerald-100 text-emerald-800'
                : submission.status === 'needs_revision'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {submission.status.replace('_', ' ')}
          </span>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Submission Summary
          </h4>
          <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            {submission.description}
          </p>
        </div>

        {/* Approach Explanation */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Architectural Approach Explanation
          </h4>
          <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 leading-relaxed whitespace-pre-line">
            {submission.approach}
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Github className="w-5 h-5 text-slate-700" />
              <div>
                <div className="text-xs font-bold text-slate-800">Source Repository</div>
                <div className="text-[11px] text-slate-500 truncate max-w-xs">
                  {submission.repositoryUrl || 'None provided'}
                </div>
              </div>
            </div>
            {submission.repositoryUrl && (
              <a
                href={submission.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl"
              >
                Inspect Code
              </a>
            )}
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-indigo-600" />
              <div>
                <div className="text-xs font-bold text-slate-800">Live Deployment</div>
                <div className="text-[11px] text-slate-500 truncate max-w-xs">
                  {submission.liveProjectUrl || 'None provided'}
                </div>
              </div>
            </div>
            {submission.liveProjectUrl && (
              <a
                href={submission.liveProjectUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
              >
                Open Demo
              </a>
            )}
          </div>
        </div>

        {/* Notes */}
        {submission.notes && (
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-500">Student Notes:</h4>
            <p className="text-xs text-slate-600 italic">{submission.notes}</p>
          </div>
        )}
      </div>

      {/* Reviewer Evaluation & Decision Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-md space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Reviewer Evaluation & Scoring
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Scores directly influence smart challenge recommendations
          </span>
        </div>

        <form className="space-y-6">
          {/* Rating sliders / score inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
            {/* Overall Score */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Overall Score (0-100) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={reviewForm.score}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, score: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-base text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              {formErrors.score && (
                <p className="mt-1 text-xs text-rose-600">{formErrors.score}</p>
              )}
            </div>

            {/* Correctness Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correctness (1-5)
              </label>
              <select
                value={reviewForm.correctnessRating}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, correctnessRating: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
              >
                {[5, 4, 3, 2, 1].map((val) => (
                  <option key={val} value={val}>
                    {val} Star{val > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Code Quality Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Code Quality (1-5)
              </label>
              <select
                value={reviewForm.codeQualityRating}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, codeQualityRating: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
              >
                {[5, 4, 3, 2, 1].map((val) => (
                  <option key={val} value={val}>
                    {val} Star{val > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Creativity Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Creativity (1-5)
              </label>
              <select
                value={reviewForm.creativityRating}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, creativityRating: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
              >
                {[5, 4, 3, 2, 1].map((val) => (
                  <option key={val} value={val}>
                    {val} Star{val > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Written Reviewer Feedback <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reviewForm.reviewerFeedback}
              onChange={(e) =>
                setReviewForm((prev) => ({ ...prev, reviewerFeedback: e.target.value }))
              }
              placeholder="Provide constructive, actionable feedback on their implementation, architectural choices, and coding practices..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                formErrors.reviewerFeedback ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {formErrors.reviewerFeedback && (
              <p className="mt-1 text-xs text-rose-600">{formErrors.reviewerFeedback}</p>
            )}
          </div>

          {/* Strengths & Improvement Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">
                Identified Strengths
              </label>
              <textarea
                rows={2}
                value={reviewForm.strengths}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, strengths: e.target.value }))
                }
                placeholder="e.g. Clean semantic HTML structure, proper responsive breakpoints..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-800 mb-1">
                Areas for Improvement
              </label>
              <textarea
                rows={2}
                value={reviewForm.improvementAreas}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, improvementAreas: e.target.value }))
                }
                placeholder="e.g. Enhance input validation patterns, fix edge case when value is null..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Recommended Skill Tags (Crucial for Smart Recommendation Engine) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Recommended Skill Tags for Next Challenges</span>
            </label>
            <input
              type="text"
              value={reviewForm.tagsInput}
              onChange={(e) =>
                setReviewForm((prev) => ({ ...prev, tagsInput: e.target.value }))
              }
              placeholder="e.g. CSS3, Responsive Design, State Management, Debugging (comma separated)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              The smart recommendation engine prioritizes unlocked challenges that match these tags.
            </p>
          </div>

          {/* Action Buttons: Approve vs Request Improvements */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <button
              type="button"
              disabled={submitting}
              onClick={(e) => handleReviewSubmit(e, 'approved')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Approve Submission & Unlock Dependent Challenges</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={(e) => handleReviewSubmit(e, 'needs_revision')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>Request Improvements (Keep Incomplete)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewSubmission;

