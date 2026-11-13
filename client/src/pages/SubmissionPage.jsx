import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Send,
  Github,
  Globe,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Loader2,
  Sparkles,
  Award,
} from 'lucide-react';
import submissionService from '../services/submissionService';
import challengeService from '../services/challengeService';
import LoadingSpinner from '../components/LoadingSpinner';
import DifficultyBadge from '../components/DifficultyBadge';

export const SubmissionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    description: '',
    approach: '',
    repositoryUrl: '',
    liveProjectUrl: '',
    notes: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});

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

  const validate = () => {
    const errs = {};
    if (!formData.description.trim()) {
      errs.description = 'Submission summary/description is required (min 5 chars)';
    } else if (formData.description.trim().length < 5) {
      errs.description = 'Description must be at least 5 characters';
    }

    if (!formData.approach.trim()) {
      errs.approach = 'Explanation of your architectural approach is required (min 10 chars)';
    } else if (formData.approach.trim().length < 10) {
      errs.approach = 'Approach explanation must be at least 10 characters';
    }

    if (formData.repositoryUrl && !/^https?:\/\/.+/i.test(formData.repositoryUrl.trim())) {
      errs.repositoryUrl = 'Repository URL must start with http:// or https://';
    }

    if (formData.liveProjectUrl && !/^https?:\/\/.+/i.test(formData.liveProjectUrl.trim())) {
      errs.liveProjectUrl = 'Live Project URL must start with http:// or https://';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        challengeId: challenge._id,
        description: formData.description.trim(),
        approach: formData.approach.trim(),
        repositoryUrl: formData.repositoryUrl.trim(),
        liveProjectUrl: formData.liveProjectUrl.trim(),
        notes: formData.notes.trim(),
      };

      const res = await submissionService.submitWork(payload);
      setSuccessMessage(
        res.message || 'Your work has been submitted successfully and is waiting for review.'
      );

      // Re-fetch challenge details to show latest attempt and updated status
      await fetchChallenge();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit work. Please check your inputs.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Preparing submission workspace..." />;
  }

  if (error && !challenge) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
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

  const isLocked = challenge.status === 'locked' || challenge.isUnlocked === false;
  const isPendingReview = challenge.status === 'submitted';
  const needsRevision = challenge.status === 'needs_revision';
  const isApproved = challenge.status === 'completed';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Back button */}
      <div>
        <Link
          to={`/challenges/${challenge._id || challenge.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Challenge Details</span>
        </Link>
      </div>

      {/* Challenge Summary Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <DifficultyBadge difficulty={challenge.difficulty} />
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
            {challenge.category}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Submit Work for: {challenge.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {challenge.description}
        </p>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="rounded-2xl p-5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-950">Submission Confirmed</h4>
            <p className="mt-1 text-xs text-emerald-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Server Error Banner */}
      {error && (
        <div className="rounded-2xl p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Locked Guard Banner */}
      {isLocked && (
        <div className="rounded-2xl p-6 bg-slate-100 border border-slate-200 text-slate-700 text-sm text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-900">
            Submission Blocked: Challenge is Locked
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You cannot submit work for a locked challenge. Complete all prerequisites first.
          </p>
          <Link
            to="/challenges"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            Explore Available Challenges
          </Link>
        </div>
      )}

      {/* Pending Review Notice */}
      {isPendingReview && !successMessage && (
        <div className="rounded-2xl p-5 bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Work Submitted & Under Review</h4>
            <p className="mt-1 text-xs text-amber-800">
              Your latest attempt has been queued for mentor feedback. You will receive an email and in-app review results once evaluated.
            </p>
          </div>
        </div>
      )}

      {/* Submission Form (Shown if unlocked and not pending review) */}
      {!isLocked && (!isPendingReview || needsRevision) && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {needsRevision ? 'Submit Revised Work (Attempt #2+)' : 'Submit Your Solution'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Provide thorough details regarding your design decisions and implementation approach.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Summary / Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Submission Summary / Overview <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Fully responsive portfolio with dark theme switcher and accessible contact form"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  fieldErrors.description ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
              {fieldErrors.description && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.description}</p>
              )}
            </div>

            {/* Approach Explanation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Explanation of Your Approach <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="approach"
                rows={4}
                value={formData.approach}
                onChange={handleChange}
                placeholder="Describe how you planned your solution, architectural patterns used, data flow, error handling, and any challenges you overcame..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  fieldErrors.approach ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
              {fieldErrors.approach && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.approach}</p>
              )}
            </div>

            {/* Repositories and Live URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Repository URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GitHub / Repository URL (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Github className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    name="repositoryUrl"
                    value={formData.repositoryUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/username/project"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                      fieldErrors.repositoryUrl ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                </div>
                {fieldErrors.repositoryUrl && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.repositoryUrl}</p>
                )}
              </div>

              {/* Live Project URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Live Project URL (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    name="liveProjectUrl"
                    value={formData.liveProjectUrl}
                    onChange={handleChange}
                    placeholder="https://my-project.vercel.app"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                      fieldErrors.liveProjectUrl ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                </div>
                {fieldErrors.liveProjectUrl && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.liveProjectUrl}</p>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Notes / Questions for Reviewer
              </label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Mention any specific areas you'd like feedback on (e.g. state management performance, CSS clean-up)..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Work...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Work for Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submission History Section */}
      {challenge.submissions && challenge.submissions.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            Previous Submissions & Feedback History
          </h3>

          <div className="space-y-4">
            {challenge.submissions.map((sub) => (
              <div
                key={sub._id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    Attempt #{sub.attemptNumber}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                      sub.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sub.status === 'needs_revision'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {sub.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-700">
                  <span className="font-semibold text-slate-800">Approach: </span>
                  {sub.approach}
                </div>

                {sub.score !== null && sub.score !== undefined && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                    <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Overall Score: {sub.score}/100
                    </span>
                  </div>
                )}

                {sub.reviewerFeedback && (
                  <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-100 text-xs text-purple-950 space-y-1.5">
                    <div className="font-bold text-purple-900">
                      Reviewer Feedback:
                    </div>
                    <p className="italic leading-relaxed">
                      "{sub.reviewerFeedback}"
                    </p>
                    {sub.strengths && (
                      <div>
                        <span className="font-bold text-emerald-800">Strengths: </span>
                        <span>{sub.strengths}</span>
                      </div>
                    )}
                    {sub.improvementAreas && (
                      <div>
                        <span className="font-bold text-rose-800">Areas to Improve: </span>
                        <span>{sub.improvementAreas}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionPage;

