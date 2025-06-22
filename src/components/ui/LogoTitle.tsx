"use client";

import React from 'react';
import LogoIcon from './LogoIcon';

interface LogoTitleProps {
  size?: number;
  className?: string;
  showTitle?: boolean;
}

const LogoTitle: React.FC<LogoTitleProps> = ({ 
  size = 32, 
  className = '',
  showTitle = true
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <LogoIcon size={size} />
      {showTitle && (
        <span className="ml-2 text-lg font-semibold text-primary">
          SciTiger
        </span>
      )}
    </div>
  );
};

export default LogoTitle; 