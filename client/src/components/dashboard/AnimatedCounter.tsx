'use client';

import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  duration?: number; // ms
  className?: string;
}

export default function AnimatedCounter({
  value,
  duration = 800,
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<string>('0');

  useEffect(() => {
    // If prefers-reduced-motion is enabled, skip animation
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(String(value));
      return;
    }

    const strVal = String(value).trim();
    // Match numeric portion and optional prefix/suffix (e.g. "$120", "2.4 GB", "95%")
    const match = strVal.match(/^([^0-9.-]*)([0-9,.]+)(.*)$/);

    if (!match) {
      setDisplayValue(strVal);
      return;
    }

    const prefix = match[1] || '';
    const numStr = match[2].replace(/,/g, '');
    const suffix = match[3] || '';
    const targetNum = parseFloat(numStr);

    if (isNaN(targetNum)) {
      setDisplayValue(strVal);
      return;
    }

    const isDecimal = numStr.includes('.');
    const decimalPlaces = isDecimal ? numStr.split('.')[1].length : 0;

    let startTime: number | null = null;
    let animationFrameId: number;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentNum = targetNum * easedProgress;

      const formattedNum = isDecimal
        ? currentNum.toFixed(decimalPlaces)
        : Math.round(currentNum).toLocaleString();

      setDisplayValue(`${prefix}${formattedNum}${suffix}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(strVal);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return <span className={className}>{displayValue}</span>;
}
