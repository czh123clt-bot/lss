import React, { useState, FormEvent, useRef } from 'react';
import { UserDate } from '../types';

interface InputViewProps {
  onQuery: (date: UserDate) => void;
  isLoading: boolean;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function isValidDate(yearStr: string, monthStr: string, dayStr: string): { isValid: boolean; errorMsg?: string } {
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);
  const d = parseInt(dayStr, 10);

  if (isNaN(y) || isNaN(m) || isNaN(d)) {
    return { isValid: false, errorMsg: '请输入完整的数字日期' };
  }

  if (y <= 0 || y > 3000) {
    return { isValid: false, errorMsg: '年份请输入 1 到 3000 之间的正整数' };
  }

  if (m < 1 || m > 12) {
    return { isValid: false, errorMsg: '月份请输入 1 到 12 之间的整数' };
  }

  const daysInMonth = [31, (isLeapYear(y) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  if (d < 1 || d > daysInMonth[m - 1]) {
    return { isValid: false, errorMsg: `${y}年${m}月没有 ${d} 日，请输入正确的日期` };
  }

  const targetDate = new Date(y, m - 1, d);
  const now = new Date();
  if (targetDate > now) {
    return { isValid: false, errorMsg: '输入的日期不能是未来日期，请选择今天或过去的日期' };
  }

  return { isValid: true };
}

export default function InputView({ onQuery, isLoading }: InputViewProps) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [error, setError] = useState<string | null>(null);

  const yearRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = isValidDate(year, month, day);
    if (!validation.isValid) {
      setError(validation.errorMsg || '请输入正确的日期');
      return;
    }

    onQuery({ year, month, day });
  };

  const handleInputChange = (type: 'year' | 'month' | 'day', val: string) => {
    setError(null);
    // Keep only digits
    const digits = val.replace(/\D/g, '');

    if (type === 'year') {
      const truncated = digits.slice(0, 4);
      setYear(truncated);
      if (truncated.length === 4) {
        monthRef.current?.focus();
      }
    } else if (type === 'month') {
      const truncated = digits.slice(0, 2);
      setMonth(truncated);
      if (truncated.length === 2) {
        dayRef.current?.focus();
      } else if (truncated.length === 1) {
        // If user typed 2-9 directly, it can only be a single digit month, so auto-advance
        const mNum = parseInt(truncated, 10);
        if (mNum > 1) {
          dayRef.current?.focus();
        }
      }
    } else if (type === 'day') {
      const truncated = digits.slice(0, 2);
      setDay(truncated);
    }
  };

  const handleKeyDown = (type: 'year' | 'month' | 'day', e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (type === 'month' && month.length === 0) {
        yearRef.current?.focus();
      } else if (type === 'day' && day.length === 0) {
        monthRef.current?.focus();
      }
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 relative">
      {/* Background Decor */}
      <div className="absolute top-[10%] left-[5%] text-8xl font-serif text-white/5 pointer-events-none italic opacity-20">
        时光
      </div>
      <div className="absolute bottom-[15%] right-[5%] text-8xl font-serif text-white/5 pointer-events-none italic opacity-20">
        记录
      </div>

      <div className="z-10 w-full max-w-sm space-y-12">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-serif tracking-[0.2em] text-primary uppercase font-bold">历史时刻</h1>
          <p className="text-text-dim text-xs tracking-[0.3em] uppercase opacity-80">探寻日期背后的跨时空记忆</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="flex justify-between gap-4">
            <div className="flex-1 flex flex-col items-center space-y-2">
              <label className="text-[10px] tracking-[0.2em] text-text-dim uppercase">年份</label>
              <input
                ref={yearRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                onKeyDown={(e) => handleKeyDown('year', e)}
                placeholder="2024"
                className="w-full h-20 bg-white/5 border border-white/10 text-center text-3xl font-bold text-white focus:border-white/30 focus:bg-white/10 outline-none transition-all rounded-xl shadow-inner"
                required
              />
            </div>
            <div className="flex-1 flex flex-col items-center space-y-2">
              <label className="text-[10px] tracking-[0.2em] text-text-dim uppercase">月份</label>
              <input
                ref={monthRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={month}
                onChange={(e) => handleInputChange('month', e.target.value)}
                onKeyDown={(e) => handleKeyDown('month', e)}
                placeholder="06"
                className="w-full h-20 bg-white/5 border border-white/10 text-center text-3xl font-bold text-white focus:border-white/30 focus:bg-white/10 outline-none transition-all rounded-xl shadow-inner"
                required
              />
            </div>
            <div className="flex-1 flex flex-col items-center space-y-2">
              <label className="text-[10px] tracking-[0.2em] text-text-dim uppercase">日期</label>
              <input
                ref={dayRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={day}
                onChange={(e) => handleInputChange('day', e.target.value)}
                onKeyDown={(e) => handleKeyDown('day', e)}
                placeholder="03"
                className="w-full h-20 bg-white/5 border border-white/10 text-center text-3xl font-bold text-white focus:border-white/30 focus:bg-white/10 outline-none transition-all rounded-xl shadow-inner"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-rose-400 text-xs text-center font-light tracking-wide bg-rose-500/10 border border-rose-500/20 py-2.5 px-4 rounded-lg animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl border border-white/20 bg-white/5 text-white text-lg font-bold tracking-[0.2em] uppercase transition-all
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 active:scale-95 shadow-[0_4px_30px_rgba(255,255,255,0.05)]'}`}
          >
            {isLoading ? '寻觅中...' : '启动查询'}
          </button>
        </form>
      </div>

      <footer className="absolute bottom-10 text-[9px] text-text-dim tracking-[0.4em] font-light opacity-30 uppercase">
        追溯人类历史的长河
      </footer>
    </div>
  );
}
