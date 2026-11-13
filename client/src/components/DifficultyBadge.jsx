import React from 'react';

const DIFFICULTY_CONFIG = {
  Beginner: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  Intermediate: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  Advanced: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  Expert: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

export const DifficultyBadge = ({ difficulty = 'Beginner', size = 'md' }) => {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Beginner;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses} tracking-wide`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {difficulty}
    </span>
  );
};

export default DifficultyBadge;

