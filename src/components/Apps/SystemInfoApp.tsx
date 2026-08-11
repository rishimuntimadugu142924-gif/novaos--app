import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Activity, ShieldCheck, MemoryStick, Layers } from 'lucide-react';

export const SystemInfoApp: React.FC = () => {
  const [cpuUsage, setCpuUsage] = useState(18);
  const [ramUsage, setRamUsage] = useState(3.4);

  // Simulate subtle real-time hardware telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(12 + Math.random() * 25));
      setRamUsage(parseFloat((3.2 + Math.random() * 0.4).toFixed(1)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full bg-slate-950/80 text-slate-100 font-sans p-5 select-none overflow-y-auto space-y-5">
      {/* OS Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/30 border border-blue-400/30 rounded-2xl flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/20">
            <Layers size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">NovaOS Workstation Edition</h3>
            <p className="text-xs text-slate-400 font-mono">Kernel v4.2.0-stable x64_86 (Build 2026.08.10)</p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            Status: OPTIMAL
          </div>
        </div>
      </div>

      {/* Realtime Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CPU Monitor */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Cpu size={16} /> Nova Neural-9 CPU
            </span>
            <span className="font-mono text-white">{cpuUsage}%</span>
          </div>
          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
            <div 
              className="bg-blue-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono">8 Cores @ 3.80 GHz • Thermal: 38°C</p>
        </div>

        {/* RAM Monitor */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <MemoryStick size={16} /> Virtual DDR5 Memory
            </span>
            <span className="font-mono text-white">{ramUsage} GB / 16 GB</span>
          </div>
          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
            <div 
              className="bg-indigo-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${(ramUsage / 16) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono">Buffered Cache: 1.2 GB • Available: 12.6 GB</p>
        </div>
      </div>

      {/* Storage & System Specs List */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="text-xs font-bold text-amber-400 flex items-center gap-2 border-b border-white/10 pb-2">
          <HardDrive size={16} /> Storage Allocation & Architecture
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <div className="text-slate-400 text-[10px]">LOCAL VIRTUAL DISK</div>
            <div className="text-slate-200 font-semibold mt-0.5">NVMe SSD (512 GB)</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">AI ENGINE</div>
            <div className="text-emerald-400 font-semibold mt-0.5">Gemini 2.5 Flash SDK</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">GRAPHICS PIPELINE</div>
            <div className="text-slate-200 font-semibold mt-0.5">Glassmorphic Radial Canvas</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">SANDBOX MODE</div>
            <div className="text-slate-200 font-semibold mt-0.5">Active Container</div>
          </div>
        </div>
      </div>
    </div>
  );
};
