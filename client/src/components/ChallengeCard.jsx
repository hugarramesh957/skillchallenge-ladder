import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import DifficultyBadge from './DifficultyBadge';

const STATUS_CONFIG = {
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  submitted: {
    label: 'Under Review',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  needs_revision: {
    label: 'Needs Revision',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertCircle,
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: BookOpen,
  },
  available: {
    label: 'Available',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Unlock,
  },
  locked: {
    label: 'Locked',
    bg: 'bg-slate-100 text-slate-500 border-slate-200',
    icon: Lock,
  },
};

export const ChallengeCard = ({
  challenge,
  highlighted = false,
  recommendationReason = null,
}) => {
  const isLocked = challenge.status === 'locked' || challenge.isUnlocked === false;
  const statusInfo = STATUS_CONFIG[challenge.status] || STATUS_CONFIG.available;
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl bg-white p-6 border transition-all duration-300 ${
        highlighted
          ? 'border-indigo-400 shadow-md ring-2 ring-indigo-500/20'
          : isLocked
          ? 'border-slate-200/80 bg-slate-50/50 opacity-90'
          : 'border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200'
      }`}
    >
      {/* Top Banner if Recommended */}
      {recommendationReason && (
        <div className="mb-4 -mx-6 -mt-6 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-4 py-2 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse flex-shrink-0" />
          <span className="truncate">{recommendationReason}</span>
        </div>
      )}

      <div>
        {/* Header badges: Difficulty, Category, Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <DifficultyBadge difficulty={challenge.difficulty} />
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
              {challenge.category}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${statusInfo.bg}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {statusInfo.label}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`text-lg font-bold tracking-tight mb-2 ${
            isLocked ? 'text-slate-700' : 'text-slate-900 group-hover:text-indigo-600'
          } transition-colors line-clamp-1`}
        >
          {challenge.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {challenge.description}
        </p>

        {/* Missing Prerequisites Notification for Locked items */}
        {isLocked && challenge.missingPrerequisites && challenge.missingPrerequisites.length > 0 && (
          <div className="mb-4 p-2.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-600">
            <span className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
              <Lock className="w-3 h-3 text-slate-500" /> Complete Prerequisite:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
              {challenge.missingPrerequisites.map((p, idx) => (
                <li key={idx} className="truncate">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {challenge.skills?.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px]"
            >
              #{skill}
            </span>
          ))}
          {challenge.skills?.length > 3 && (
            <span className="text-[11px] text-slate-400 self-center">
              +{challenge.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center text-xs text-slate-500 gap-1.5">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>~{challenge.estimatedMinutes || 60} mins</span>
        </div>

        {isLocked ? (
          <Link
            to={`/challenges/${challenge._id || challenge.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <Link
            to={`/challenges/${challenge._id || challenge.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all group-hover:translate-x-0.5"
          >
            <span>
              {challenge.status === 'in_progress'
                ? 'Continue'
                : challenge.status === 'needs_revision'
                ? 'Revise'
                : challenge.status === 'completed'
                ? 'Review'
                : 'Start Challenge'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;

