import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  badgeText,
}) => {
  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
    },
  }[color] || {
    bg: 'bg-indigo-50 text-indigo-600',
    border: 'border-indigo-100',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${colorStyles.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {value}
        </span>
        {badgeText && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
            {badgeText}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1.5 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};

export default StatCard;

