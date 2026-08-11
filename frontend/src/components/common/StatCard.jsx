import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'chestnut' }) => {
  const colorStyles = {
    chestnut: 'bg-chestnut/10 text-chestnut border-chestnut/20',
    morning: 'bg-morning/10 text-morning border-morning/20',
    darkBrown: 'bg-darkBrown/10 text-darkBrown border-darkBrown/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-almond/40 shadow-card hover:shadow-premium transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colorStyles[color] || colorStyles.chestnut}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="text-2xl font-extrabold text-darkBrown tracking-tight">{value}</div>
      {subtitle && <p className="text-xs text-textMuted mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
