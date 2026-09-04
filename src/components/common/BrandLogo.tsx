import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  showGlow?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 32,
  className = '',
  showGlow = false,
}) => {
  return (
    <div
      className={`brand-logo-container ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
        filter: showGlow ? 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.45))' : 'none',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="jobOrbitBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <linearGradient id="jobOrbitRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#c7d2fe" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="jobOrbitCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0e7ff" />
          </linearGradient>

          <filter id="jobOrbitGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Rounded Container with Glass Depth */}
        <rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="10"
          fill="url(#jobOrbitBgGrad)"
        />

        {/* Subtle Inner Border */}
        <rect
          x="2.5"
          y="2.5"
          width="35"
          height="35"
          rx="9.5"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1"
        />

        {/* Planetary / Career Core Sphere */}
        <circle
          cx="20"
          cy="20"
          r="4.8"
          fill="url(#jobOrbitCoreGrad)"
          filter="url(#jobOrbitGlow)"
        />

        {/* Dynamic Primary Orbital Ellipse (Tilted Angle) */}
        <ellipse
          cx="20"
          cy="20"
          rx="11.5"
          ry="5.2"
          transform="rotate(-28 20 20)"
          stroke="url(#jobOrbitRingGrad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="28 8 16 6"
        />

        {/* Counter Orbital Arc */}
        <ellipse
          cx="20"
          cy="20"
          rx="12"
          ry="4.2"
          transform="rotate(35 20 20)"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.2"
          strokeDasharray="14 12"
        />

        {/* Orbiting Career Satellite Beacon (Opportunity in Orbit) */}
        <circle
          cx="29"
          cy="15"
          r="2.2"
          fill="#38bdf8"
          stroke="#ffffff"
          strokeWidth="1"
        />

        {/* Minor Trailing Star / Opportunity Beacon */}
        <circle
          cx="10.5"
          cy="24"
          r="1.3"
          fill="#a5f3fc"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};
