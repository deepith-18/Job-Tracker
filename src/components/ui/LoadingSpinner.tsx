import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading…',
}) => {
  const dim = size === 'sm' ? 20 : size === 'lg' ? 48 : 32;
  const stroke = size === 'sm' ? 2 : 2.5;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        fill="none"
        style={{ animation: 'spin-slow 1s linear infinite' }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      )}
    </div>
  );
};
