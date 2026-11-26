// src/components/Preloader.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isSplitting, setIsSplitting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsSplitting(true), 250);
          setTimeout(() => onComplete(), 1050);
          return 100;
        }
        return prev + 4;
      });
    }, 35);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        {/* Top Leather Curtain */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: isSplitting ? '-100%' : 0 }}
          transition={{ duration: 0.85, ease: [0.77, 0, 0.175, 1] }}
          className="absolute top-0 left-0 right-0 h-1/2 bg-[#121314] border-b border-white/10"
        />

        {/* Bottom Leather Curtain */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: isSplitting ? '100%' : 0 }}
          transition={{ duration: 0.85, ease: [0.77, 0, 0.175, 1] }}
          className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#121314]"
        />

        {/* Center Animated Emblem + Counter */}
        <motion.div
          animate={{ opacity: isSplitting ? 0 : 1, scale: isSplitting ? 1.15 : 1 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex h-full flex-col items-center justify-center text-[#F5F2EB]"
        >
          {/* Animated Botanical Leaf SVG */}
          <svg
            width="68"
            height="68"
            viewBox="0 0 64 64"
            fill="none"
            className="mb-6"
          >
            <motion.path
              d="M12 52C12 28 28 12 52 12C52 36 36 52 12 52Z"
              stroke="#D4AF37"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
            />
            <motion.path
              d="M12 52L44 20"
              stroke="#F5F2EB"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </svg>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-[0.35em] uppercase"
          >
            VERDANT HIDE
          </motion.h2>

          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-neutral-400">
            100% Plant-Based Leather
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-[2px] w-40 overflow-hidden bg-white/15">
              <motion.div
                className="h-full bg-[#D4AF37]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-10 text-xs font-mono text-[#D4AF37]">
              {progress}%
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}