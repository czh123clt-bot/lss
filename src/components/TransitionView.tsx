import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, ShieldAlert } from 'lucide-react';
import { UserDate } from '../types';

interface TransitionViewProps {
  date: UserDate;
  onTransitionComplete: () => void;
  apiSuccess: boolean;
}

export default function TransitionView({ date, onTransitionComplete, apiSuccess }: TransitionViewProps) {
  const [countdown, setCountdown] = useState(3);
  const [currentYearDisplay, setCurrentYearDisplay] = useState(2026);
  const targetYear = parseInt(date.year) || 2024;
  const targetMonth = date.month ? parseInt(date.month) : 1;
  const targetDay = date.day ? parseInt(date.day) : 1;

  // Countdown timer for progress steps
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Scrolling year backwards animation
  useEffect(() => {
    // We want the year to scroll from 2026 down to targetYear over 2.5 seconds
    const duration = 2500;
    const startYear = 2026;
    const diff = startYear - targetYear;
    
    if (diff <= 0) {
      setCurrentYearDisplay(targetYear);
      return;
    }

    const startTime = Date.now();

    const updateYear = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startYear - diff * easeProgress);
      setCurrentYearDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(updateYear);
      } else {
        setCurrentYearDisplay(targetYear);
      }
    };

    const animFrame = requestAnimationFrame(updateYear);
    return () => cancelAnimationFrame(animFrame);
  }, [targetYear]);

  // Handle transition completion when both countdown is done and API has succeeded
  useEffect(() => {
    if (countdown === 0 && apiSuccess) {
      onTransitionComplete();
    }
  }, [countdown, apiSuccess, onTransitionComplete]);

  const getStepMessage = () => {
    if (countdown === 3) return '正在接入时空流，校准时间秩序...';
    if (countdown === 2) return `正在扫描 ${targetYear} 年 ${targetMonth} 月的历史刻度...`;
    if (countdown === 1) return '时空通道已锁定，正在解析历史碎片...';
    return '解析完成，即将呈现时空画面...';
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-6 relative overflow-hidden bg-bg-deep select-none">
      {/* Dynamic Background Grid and Particles */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08),transparent_70%)]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full animate-ping [animation-duration:8s]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-white/5 rounded-full animate-ping [animation-duration:12s]"></div>
      </div>

      <div className="relative flex flex-col items-center max-w-md w-full text-center space-y-10 z-10">
        
        {/* Animated Chrono-dial */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing ring outer */}
          <div className="absolute w-44 h-44 rounded-full border-2 border-dashed border-amber-500/20 animate-spin [animation-duration:20s]" />
          <div className="absolute w-36 h-36 rounded-full border border-white/10 animate-spin [animation-duration:10s] [animation-direction:reverse]" />
          
          {/* Core circular element */}
          <div className="w-28 h-28 rounded-full bg-slate-900/90 border border-white/10 flex flex-col items-center justify-center relative shadow-2xl backdrop-blur-md">
            <Compass className="absolute text-amber-500/20 w-24 h-24 animate-pulse pointer-events-none" />
            
            {/* Center digit: Countdown */}
            <AnimatePresence mode="wait">
              <motion.span
                key={countdown}
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.2, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-4xl font-serif font-black text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]"
              >
                {countdown > 0 ? countdown : 'GO'}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Temporal coordinates indicator */}
        <div className="space-y-3">
          <div className="font-mono text-[10px] tracking-[0.3em] text-text-dim uppercase">
            校准目标时间
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-serif font-bold text-white tracking-tight tabular-nums min-w-[5.5rem] text-right">
              {currentYearDisplay}
            </span>
            <span className="text-sm font-sans font-medium text-white/50">年</span>
            <span className="text-2xl font-serif font-bold text-white tracking-tight">
              {date.month}
            </span>
            <span className="text-sm font-sans font-medium text-white/50">月</span>
            <span className="text-2xl font-serif font-bold text-white tracking-tight">
              {date.day}
            </span>
            <span className="text-sm font-sans font-medium text-white/50">日</span>
          </div>
        </div>

        {/* Transition message text */}
        <div className="h-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={countdown}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.4 }}
              className="text-xs font-light text-white/80 tracking-wide font-sans max-w-xs"
            >
              {getStepMessage()}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Micro status line at the bottom */}
        <div className="flex items-center gap-1.5 justify-center py-2 px-4 rounded-full bg-white/5 border border-white/5 text-[9px] font-mono text-white/40 tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>时空奇点稳定系数: 99.98%</span>
        </div>
      </div>
    </div>
  );
}
