import React from 'react';

export const ProgressBar = ({
  progress = 0,
  label = '',
  sublabel = '',
  color = 'bg-indigo-600',
  height = 'h-2.5',
  showPercentage = true,
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5 text-sm">
          <div>
            {label && <span className="font-medium text-slate-700">{label}</span>}
            {sublabel && <span className="text-xs text-slate-500 ml-2">{sublabel}</span>}
          </div>
          {showPercentage && (
            <span className="font-semibold text-slate-800 text-xs">{clamped}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

