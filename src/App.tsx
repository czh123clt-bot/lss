import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import InputView from './components/InputView';
import ResultView from './components/ResultView';
import TransitionView from './components/TransitionView';
import BackgroundSymbols from './components/BackgroundSymbols';
import { HistoricalEvent, UserDate } from './types';

export default function App() {
  const [view, setView] = useState<'input' | 'transition' | 'result'>('input');
  const [date, setDate] = useState<UserDate>({ year: '', month: '', day: '' });
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuery = async (inputDate: UserDate) => {
    setIsLoading(true);
    setErrorMsg(null);
    setDate(inputDate);
    setApiSuccess(false);
    setView('transition'); // Enter transition screen immediately
    
    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: inputDate.year, month: inputDate.month, day: inputDate.day }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '查询失败');
      }

      if (Array.isArray(data)) {
        setEvents(data);
        setApiSuccess(true); // Signal to the transition view that data is ready
      } else {
        throw new Error('返回数据格式异常');
      }
    } catch (error: any) {
      console.error('Failed to query history:', error);
      setErrorMsg(error.message || '查询失败，请检查网络或稍后再试');
      setView('input'); // Fallback to input view on error
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setView('input');
    setEvents([]);
    setApiSuccess(false);
    setErrorMsg(null);
  };

  const handleTransitionComplete = () => {
    setView('result');
  };

  return (
    <div className="h-screen w-full bg-bg-deep text-text-main overflow-hidden font-sans select-none relative">
      <div className="absolute inset-0 geometric-pattern pointer-events-none"></div>
      <BackgroundSymbols />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      
      {errorMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/20 text-red-200 border border-red-500/30 px-4 py-2 rounded-lg z-50 text-xs backdrop-blur-md animate-pulse">
          {errorMsg}
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full w-full"
          >
            <InputView onQuery={handleQuery} isLoading={isLoading} />
          </motion.div>
        )}

        {view === 'transition' && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full"
          >
            <TransitionView 
              date={date} 
              apiSuccess={apiSuccess} 
              onTransitionComplete={handleTransitionComplete} 
            />
          </motion.div>
        )}

        {view === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="h-full w-full"
          >
            <ResultView date={date} events={events} onBack={reset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
