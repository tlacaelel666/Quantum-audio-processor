
import React from 'react';

interface IconProps {
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

export const PlayIcon: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M7 4v16l13-8z"></path></svg>
);

export const SquareIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M4 4h16v16H4z"></path></svg>
);

export const BrainIcon: React.FC<IconProps> = ({ size = 24, className, strokeWidth = 1.5 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.98-3.32 2.5 2.5 0 0 1 4.52-1.64v-4.5a2.5 2.5 0 0 1-4.99-.44 2.5 2.5 0 0 1 2.5-2.5h5Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.98-3.32 2.5 2.5 0 0 0-4.52-1.64v-4.5a2.5 2.5 0 0 0 4.99-.44 2.5 2.5 0 0 0-2.5-2.5h-5Z" />
  </svg>
);

export const ActivityIcon: React.FC<IconProps> = ({ size = 24, className, strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export const WaveformIcon: React.FC<IconProps> = ({ size = 24, className, strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 12h3l3-9 4 18 4-9h3"/>
    </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ size = 20, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2a1 1 0 0 1 .96.72l1.35 4.1a1 1 0 0 0 .76.76l4.1 1.35a1 1 0 0 1 0 1.92l-4.1 1.35a1 1 0 0 0-.76.76l-1.35 4.1a1 1 0 0 1-1.92 0l-1.35-4.1a1 1 0 0 0-.76-.76l-4.1-1.35a1 1 0 0 1 0-1.92l4.1-1.35a1 1 0 0 0 .76-.76l1.35-4.1A1 1 0 0 1 12 2Z"/>
    </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ size = 24, className, strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

export const FeatherIcon: React.FC<IconProps> = ({ size = 24, className, strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
        <line x1="16" y1="8" x2="2" y2="22"></line>
        <line x1="17.5" y1="15" x2="9" y2="15"></line>
    </svg>
);
