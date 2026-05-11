import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function MasalMatikLogo({ size = 36 }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <circle
        cx="19" cy="19" r="18"
        fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(117,70,104,0.12)'}
        stroke={isDark ? 'rgba(200,185,255,0.25)' : 'rgba(117,70,104,0.3)'}
        strokeWidth="1"
      />
      {/* Crescent moon */}
      <path
        d="M23 10 A9 9 0 1 0 23 28 A7 7 0 1 1 23 10 Z"
        fill={isDark ? 'rgba(220,210,255,0.9)' : 'rgb(117,70,104)'}
      />
      {/* Small star accent */}
      <path
        d="M28 10 L28.6 12 L30.7 12 L29.1 13.2 L29.7 15.2 L28 14 L26.3 15.2 L26.9 13.2 L25.3 12 L27.4 12 Z"
        fill={isDark ? 'rgba(255,220,120,0.9)' : 'rgb(200,140,60)'}
      />
    </svg>
  );
}
