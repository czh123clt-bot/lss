import React, { useState, useRef } from 'react';
import { ArrowLeft, Sparkles, X, BookOpen, Clock } from 'lucide-react';
import { HistoricalEvent, UserDate } from '../types';

interface ResultViewProps {
  date: UserDate;
  events: HistoricalEvent[];
  onBack: () => void;
}

export default function ResultView({ date, events, onBack }: ResultViewProps) {
  const [showDetailState, setShowDetailState] = useState(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);

  // States for event detailed explanation
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplainingLoading, setIsExplainingLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);

  // Calculate day difference and day of the week
  const calculateStats = () => {
    try {
      const targetYearStr = parseInt(date.year);
      const targetMonthStr = parseInt(date.month);
      const targetDayStr = parseInt(date.day);
      if (isNaN(targetYearStr) || isNaN(targetMonthStr) || isNaN(targetDayStr)) {
        return { diffDays: 0, dayOfWeek: '未知' };
      }
      const targetDate = new Date(targetYearStr, targetMonthStr - 1, targetDayStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      targetDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - targetDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const dayOfWeek = weekdays[targetDate.getDay()];

      return { diffDays, dayOfWeek };
    } catch (e) {
      return { diffDays: 0, dayOfWeek: '未知' };
    }
  };

  const { diffDays, dayOfWeek } = calculateStats();

  const startPress = (e: React.MouseEvent | React.TouchEvent) => {
    setShowDetailState(true);
  };

  const endPress = () => {
    setShowDetailState(false);
  };

  const fetchExplanation = async (event: HistoricalEvent) => {
    setIsExplainingLoading(true);
    setExplainError(null);
    setExplanation(null);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: event.year,
          month: date.month,
          day: date.day,
          title: event.title,
        }),
      });
      if (!res.ok) {
        throw new Error('服务繁忙，请稍后再试');
      }
      const data = await res.json();
      setExplanation(data.explanation || '');
    } catch (err: any) {
      setExplainError(err.message || '深度解析失败，请点击重试');
    } finally {
      setIsExplainingLoading(false);
    }
  };

  const handleEventClick = (event: HistoricalEvent) => {
    setSelectedEvent(event);
    if (event.description && event.description.trim() !== "") {
      setExplanation(event.description);
      setIsExplainingLoading(false);
      setExplainError(null);
    } else {
      fetchExplanation(event);
    }
  };

  const getCleanTitle = (fullTitle: string) => {
    let cleanText = fullTitle || "";
    if (cleanText.includes('：')) {
      cleanText = cleanText.split('：')[1] || cleanText;
    } else if (cleanText.includes(':')) {
      cleanText = cleanText.split(':')[1] || cleanText;
    }
    return cleanText.replace(/^[“”"''「」]/, '').replace(/[“”"''「」]$/, '').trim();
  };

  return (
    <div className="h-full max-h-screen flex flex-col relative px-6 py-5 overflow-hidden z-20 w-full justify-between">
      {/* Top Header Row with Action Buttons */}
      <div className="flex justify-between items-center w-full z-30">
        <button
          onClick={onBack}
          className="p-2.5 rounded-full hover:bg-white/10 active:scale-95 transition-all border border-white/10 flex items-center justify-center cursor-pointer bg-slate-900/40 backdrop-blur-sm shadow-md"
          title="返回"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>

        {/* Hidden interactive Area for Long Press in Top Right */}
        <div
          onMouseDown={startPress}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          onTouchStart={(e) => {
            if (e.cancelable) e.preventDefault();
            startPress(e);
          }}
          onTouchEnd={endPress}
          onTouchCancel={endPress}
          className="w-16 h-16 bg-transparent cursor-pointer select-none absolute right-0 top-0 z-50"
          title="长按此区域查看日期详情"
        />
      </div>

      {/* Main content container */}
      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full my-auto space-y-5 px-1 pb-4">
        {/* Date Header */}
        <header className="border-b border-white/10 pb-3.5 text-center">
          <h2 className="text-[11px] text-text-dim font-light tracking-[0.35em] mb-1.5 uppercase font-mono">
            {date.year} 年 {date.month} 月 {date.day} 日
          </h2>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-[0.1em] text-white font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            这一天 · 历史印记
          </h1>
        </header>

        {/* Dense, Beautiful & Fully-Contained Event list. Avoids any scrolling! */}
        <div className="space-y-2.5">
          {events.map((event, idx) => (
            <div 
              key={idx} 
              onClick={() => handleEventClick(event)}
              className="px-4 py-2.5 bg-slate-900/50 backdrop-blur-md rounded-xl border border-white/5 flex items-center gap-4 hover:border-white/15 cursor-pointer transition-all shadow-lg hover:translate-x-0.5 duration-200 group"
            >
              <span className="text-[10px] font-sans font-bold bg-white/10 text-white/90 px-2 py-1 rounded whitespace-nowrap tracking-wide select-none group-hover:bg-white/20 transition-all">
                {event.year} .{date.month}.{date.day}
              </span>
              <p className="text-xs text-white/90 leading-relaxed font-light text-left flex-1 line-clamp-1 group-hover:text-white transition-all">
                {getCleanTitle(event.title)}
              </p>
              <Sparkles size={12} className="text-white/30 group-hover:text-amber-300 group-hover:scale-110 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* Aesthetic Bottom Footer spacing/tip */}
      <div className="text-[10px] text-text-dim/60 tracking-[0.15em] font-light text-center select-none uppercase z-10 min-h-[24px]">
        {showDetailState ? (
          <span className="text-white bg-white/10 px-3 py-1 rounded-full font-mono font-medium border border-white/5">
            距今已过 {diffDays.toLocaleString()} 天 · {dayOfWeek}
          </span>
        ) : (
          ""
        )}
      </div>

      {/* Expanded Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative flex flex-col space-y-5 animate-scale-up">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div className="space-y-1 pr-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] bg-amber-500/15 border border-amber-500/20 text-amber-300 font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <Clock size={10} />
                  {selectedEvent.year}年 {date.month}月 {date.day}日
                </span>
                <h3 className="text-base sm:text-lg font-serif font-bold text-white leading-snug">
                  {getCleanTitle(selectedEvent.title)}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5 active:scale-95"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="flex-1 max-h-[60vh] overflow-y-auto pr-1 space-y-4 text-xs leading-relaxed text-white/80 font-light font-sans select-text">
              {isExplainingLoading ? (
                <div className="space-y-4 py-6">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-400 rounded-full animate-spin"></div>
                    <p className="text-[10px] text-text-dim tracking-[0.2em] uppercase animate-pulse">时光倒流中，AI 正在重构深度历史...</p>
                  </div>
                  <div className="space-y-2.5 pt-4">
                    <div className="h-3 bg-white/5 rounded-md w-full animate-pulse"></div>
                    <div className="h-3 bg-white/5 rounded-md w-11/12 animate-pulse"></div>
                    <div className="h-3 bg-white/5 rounded-md w-4/5 animate-pulse"></div>
                  </div>
                </div>
              ) : explainError ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-rose-400 text-xs">{explainError}</p>
                  <button 
                    onClick={() => fetchExplanation(selectedEvent)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium border border-white/10 active:scale-95 transition-all"
                  >
                    重新获取
                  </button>
                </div>
              ) : (
                <div className="space-y-4 divide-y divide-white/5">
                  <div className="flex gap-2.5 items-start text-white/90 text-sm leading-relaxed whitespace-pre-line py-1">
                    <BookOpen size={16} className="text-amber-400/80 shrink-0 mt-0.5" />
                    <div className="space-y-3 flex-1 font-light tracking-wide text-xs sm:text-sm">
                      {explanation ? (
                        explanation.split('\n\n').map((para, pidx) => (
                          <p key={pidx} className="text-white/90 leading-relaxed font-sans">
                            {para.trim()}
                          </p>
                        ))
                      ) : (
                        <p>暂无更详细的历史故事，敬请期待。</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-white/5 pt-3.5 flex justify-end">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl text-xs active:scale-95 border border-white/10 transition-all"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
