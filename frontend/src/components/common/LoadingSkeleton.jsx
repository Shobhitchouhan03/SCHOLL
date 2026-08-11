import React from 'react';

export const LoadingSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 bg-almond/30 rounded-xl w-full" />
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="h-32 bg-almond/30 rounded-2xl animate-pulse w-full" />
  );
};
