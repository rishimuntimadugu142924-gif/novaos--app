import React, { useState, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Lock, Unlock, User, ArrowRight, RotateCcw, Power } from 'lucide-react';

export const LockScreen: React.FC = () => {
  const { setIsLocked, settings, restartSystem, shutdownSystem } = useSystem();
  
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      setDateStr(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin === settings.pinCode || pin === '1234' || pin === '') {
      setIsLocked(false);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-3xl flex flex-col justify-between p-12 text-slate-100 font-sans select-none animate-in fade-in duration-300">
      {/* Top Lock Clock */}
      <div className="text-center pt-8">
        <div className="text-7xl font-extralight tracking-tighter text-white font-mono">
          {timeStr}
        </div>
        <div className="text-sm font-medium uppercase tracking-widest text-slate-400 mt-2">
          {dateStr}
        </div>
      </div>

      {/* Center Unlock Card */}
      <div className="w-full max-w-sm mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center shadow-2xl space-y-5">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
          <User size={36} />
        </div>

        <div className="text-center">
          <h3 className="text-base font-bold text-white">{settings.userName}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{settings.userRole}</p>
        </div>

        <form onSubmit={handleUnlock} className="w-full space-y-3">
          <div className="relative">
            <input 
              type="password" 
              placeholder="Enter PIN (Default: 1234)" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
              className={`w-full bg-black/50 border rounded-2xl px-4 py-3 text-sm text-center text-white placeholder-slate-500 outline-none transition-colors font-mono tracking-widest ${
                error ? 'border-red-500 ring-2 ring-red-500/30' : 'border-white/10 focus:border-blue-400'
              }`}
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <ArrowRight size={16} />
            </button>
          </div>

          {error && (
            <div className="text-center text-xs text-red-400 font-medium">Incorrect PIN code. Try 1234</div>
          )}
        </form>
      </div>

      {/* Bottom Power Controls */}
      <div className="flex justify-center gap-4 text-slate-400 text-xs">
        <button 
          onClick={restartSystem}
          className="flex items-center gap-1.5 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/5"
        >
          <RotateCcw size={14} /> Restart
        </button>
        <button 
          onClick={shutdownSystem}
          className="flex items-center gap-1.5 hover:text-red-400 transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/5"
        >
          <Power size={14} /> Shutdown
        </button>
      </div>
    </div>
  );
};
