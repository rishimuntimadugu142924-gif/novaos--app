import React from 'react';
import { SystemProvider, useSystem } from './context/SystemContext';
import { Desktop } from './components/Desktop/Desktop';
import { Taskbar } from './components/Taskbar/Taskbar';
import { LockScreen } from './components/LockScreen/LockScreen';
import { Power } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { isLocked, isShutDown, bootSystem } = useSystem();

  if (isShutDown) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans select-none">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-slate-400 mb-4 animate-pulse">
          <Power size={32} />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">NovaOS System Powered Down</h2>
        <p className="text-xs text-slate-500 mt-1">Virtual container session halted cleanly.</p>
        <button 
          onClick={bootSystem}
          className="mt-6 bg-blue-600 hover:bg-blue-500 text-white text-xs px-5 py-2.5 rounded-2xl font-semibold transition-all shadow-lg shadow-blue-600/30"
        >
          Boot System
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-slate-950 text-slate-100 select-none font-sans">
      <Desktop />
      <Taskbar />
      {isLocked && <LockScreen />}
    </div>
  );
};

export default function App() {
  return (
    <SystemProvider>
      <MainLayout />
    </SystemProvider>
  );
}
