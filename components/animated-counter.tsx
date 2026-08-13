'use client';

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  format,
  duration = 1.5,
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });

  useEffect(() => {
    if (inView) {
      motionValue.set(value);
    }
  }, [inView, value, motionValue]);

  useEffect(() => {
    const unsub = spring.on('change', (latest) => {
      if (ref.current) {
        const formatted = format
          ? format(latest)
          : `${prefix}${new Intl.NumberFormat('en-US', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            }).format(latest)}${suffix}`;
        ref.current.textContent = formatted;
      }
    });
    return () => unsub();
  }, [spring, format, prefix, suffix, decimals]);

  return (
    <span ref={ref} className={className}>
      {`${prefix}0${suffix}`}
    </span>
  );
}
