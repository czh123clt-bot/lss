import { motion } from 'motion/react';
import { UserDate } from '../types';

interface FooterInfoProps {
  date: UserDate;
  onClose: () => void;
}

export default function FooterInfo({ date, onClose }: FooterInfoProps) {
  const birthDate = new Date(parseInt(date.year), parseInt(date.month) - 1, parseInt(date.day));
  const today = new Date();
  
  // Calculate days difference
  const diffTime = Math.abs(today.getTime() - birthDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Day of week in Chinese
  const daysOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const dayOfWeek = daysOfWeek[birthDate.getDay()];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-6 z-50 pointer-events-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900/90 border border-white/15 p-6 sm:p-8 rounded-2xl flex flex-col items-center gap-6 shadow-2xl max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <h3 className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-mono font-medium">时光奥秘 · 时间回响</h3>
          <p className="text-white/80 text-xs font-serif italic mt-0.5">{date.year} 年 {date.month} 月 {date.day} 日 的时光刻痕</p>
        </div>

        <div className="h-px w-3/4 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        <div className="flex gap-10 text-center w-full justify-center py-2">
          {/* Days Since */}
          <div className="space-y-2 flex-1">
            <span className="text-[10px] text-white/50 font-light tracking-[0.2em] uppercase block">距今已过</span>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-3xl font-bold font-mono text-white tracking-tighter">
                {diffDays.toLocaleString()}
              </span>
              <span className="text-[11px] text-white/40 uppercase tracking-[0.1em] ml-0.5 font-sans font-medium">天</span>
            </div>
          </div>

          <div className="w-px h-10 bg-white/10 self-center"></div>

          {/* Day of Week */}
          <div className="space-y-2 flex-1">
            <span className="text-[10px] text-white/50 font-light tracking-[0.2em] uppercase block">历史星期</span>
            <div className="flex items-baseline justify-center">
              <span className="text-2xl font-bold font-serif text-white tracking-wide">
                {dayOfWeek}
              </span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="w-full py-3 text-[11px] text-white/60 hover:text-white hover:bg-white/5 active:scale-98 transition-all uppercase tracking-[0.34em] border border-white/10 rounded-xl"
        >
          返回印记
        </button>
      </motion.div>
    </motion.div>
  );
}
