"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";

interface AnimatedStatProps {
  value: string;
}

export default function AnimatedStat({ value }: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  // Extract number and suffix from string like "10K+" or "1M+" or "50+"
  const match = value.match(/^([0-9.]+)(.*)$/);
  const targetNumber = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : value;
  const isNumber = match !== null;

  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => {
    const hasDecimal = targetNumber % 1 !== 0;
    return latest.toFixed(hasDecimal ? 1 : 0);
  });

  useEffect(() => {
    if (isInView && isNumber) {
      const controls = animate(motionValue, targetNumber, {
        duration: 2,
        ease: "easeOut"
      });
      return controls.stop;
    }
  }, [isInView, isNumber, targetNumber, motionValue]);

  if (!isNumber) {
    return (
      <div className="text-5xl lg:text-7xl font-black text-[#6C63FF] tracking-tight mb-4">
        {value}
      </div>
    );
  }

  return (
    <div ref={ref} className="text-5xl lg:text-7xl font-black text-[#6C63FF] tracking-tight mb-4 flex items-center justify-center">
      <motion.span>{rounded}</motion.span>
      <span>{suffix}</span>
    </div>
  );
}
