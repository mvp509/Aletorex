/**
 * ALETOREX - Official Luxury Golden Monogram 'A' Logo
 * Replaces old star/sparkle emblems with the majestic golden aerodynamic 'A' icon.
 */

import React from 'react';

interface AletorexALogoProps {
  className?: string;
  size?: number | string;
  withGlow?: boolean;
}

export const AletorexALogo: React.FC<AletorexALogoProps> = ({
  className = '',
  size = 24,
  withGlow = false,
}) => {
  const width = typeof size === 'number' ? `${size}px` : size;
  const height = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width, height }}
      className={`inline-block select-none ${withGlow ? 'filter drop-shadow-[0_0_12px_rgba(245,158,11,0.65)]' : ''} ${className}`}
      aria-label="Logo Aletorex A"
    >
      <defs>
        {/* Main Golden Metallic Linear Gradient */}
        <linearGradient id="goldMetallicMain" x1="20" y1="180" x2="180" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#78350F" />
          <stop offset="18%" stopColor="#D97706" />
          <stop offset="35%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#FFFBEB" />
          <stop offset="85%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Secondary Gold Highlight for Inner Strokes */}
        <linearGradient id="goldHighlight" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="25%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#B45309" />
          <stop offset="85%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Soft Drop Shadow Filter for Internal Depth */}
        <filter id="innerDepth" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#451a03" floodOpacity="0.8" />
        </filter>
      </defs>

      <g filter="url(#innerDepth)">
        {/* Outer Left Curved Arch */}
        <path
          d="M 22 188 C 24 186, 36 165, 58 128 C 82 86, 114 42, 138 12 C 142 8, 148 7, 144 14 C 122 48, 92 98, 68 142 C 48 178, 32 194, 22 188 Z"
          fill="url(#goldMetallicMain)"
        />

        {/* Outer Left Lower Wing Accent */}
        <path
          d="M 12 194 C 14 192, 28 170, 48 142 C 40 156, 32 174, 18 196 C 14 198, 10 196, 12 194 Z"
          fill="url(#goldHighlight)"
        />

        {/* Inner Parallel Left Blade */}
        <path
          d="M 64 122 C 78 94, 106 48, 128 22 C 132 18, 136 18, 132 24 C 112 50, 84 96, 72 124 C 70 128, 62 126, 64 122 Z"
          fill="url(#goldHighlight)"
        />

        {/* Main Apex & Right Curved Leg */}
        <path
          d="M 136 12 C 144 8, 150 14, 142 26 C 128 48, 118 72, 122 100 C 124 110, 130 114, 142 112 C 158 110, 178 104, 192 100 C 196 99, 194 104, 184 108 C 160 118, 136 124, 120 128 C 108 131, 98 126, 92 120 C 86 114, 82 104, 86 92 C 92 72, 110 38, 136 12 Z"
          fill="url(#goldMetallicMain)"
        />

        {/* Horizontal Center Slash Swoosh (Extending to the Right) */}
        <path
          d="M 38 152 C 58 132, 94 108, 138 98 C 162 93, 186 95, 194 98 C 198 100, 192 103, 180 106 C 140 116, 98 136, 52 168 C 42 175, 30 162, 38 152 Z"
          fill="url(#goldMetallicMain)"
        />

        {/* Right Lower Foot & Fin */}
        <path
          d="M 126 124 C 138 128, 154 136, 174 158 C 188 174, 196 188, 192 194 C 186 198, 178 188, 164 168 C 148 146, 134 136, 126 124 Z"
          fill="url(#goldMetallicMain)"
        />

        {/* Right Inner Accent Blade */}
        <path
          d="M 144 140 C 156 150, 170 168, 182 188 C 180 190, 176 190, 170 180 C 160 164, 148 150, 138 138 C 140 137, 142 138, 144 140 Z"
          fill="url(#goldHighlight)"
        />
      </g>
    </svg>
  );
};

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AletorexLogo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const dim = size === 'sm' ? 36 : size === 'lg' ? 56 : 42;
  const iconDim = size === 'sm' ? 24 : size === 'lg' ? 40 : 28;

  return (
    <div
      className={`relative rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-700 p-0.5 shadow-[0_0_15px_rgba(251,191,36,0.35)] flex items-center justify-center ${className}`}
      style={{ width: dim, height: dim }}
    >
      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
        {/* Subtle background gold glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-transparent pointer-events-none" />

        {/* Official Golden 'A' Emblem */}
        <AletorexALogo size={iconDim} withGlow />
      </div>
    </div>
  );
};

export default AletorexLogo;
