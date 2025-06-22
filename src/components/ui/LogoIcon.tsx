"use client";

import React from 'react';
import Image from 'next/image';

interface LogoIconProps {
  size?: number;
  className?: string;
}

const LogoIcon: React.FC<LogoIconProps> = ({ size = 32, className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/logo.png"
        alt="SciTiger Logo"
        width={size}
        height={size}
        priority
      />
    </div>
  );
};

export default LogoIcon; 