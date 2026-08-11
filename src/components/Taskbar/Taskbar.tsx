import React from 'react';
import { useSystem } from '../../context/SystemContext';
import { AppId } from '../../types';
import { SystemTray } from './SystemTray';
import { StartMenu } from './StartMenu';
import { Folder, Terminal, FileText, Bot, Settings, Cpu, Trash2 } from 'lucide-react';

export const Taskbar: React.FC = () => {
  const { 
    windows, 
    activeWindowId, 
    openWindow, 
    focusWindow, 
    isStartOpen, 
    toggleStartMenu 
  } = useSystem();

  const appIcons: { id: AppId; name: string; icon: React.ReactNode }[] = [
    { id: 'ai', name: 'Nova Assistant', icon: <Bot className="text-indigo-400" size={20} /> },
    { id: 'explorer', name: 'File Explorer', icon: <Folder className="text-amber-400" size={20} /> },
    { id: 'notepad', name: 'Notepad Pro', icon: <FileText className="text-blue-400" size={20} /> },
    { id: 'terminal', name: 'Nova Terminal', icon: <Terminal className="text-emerald-400" size={20} /> },
    { id: 'settings', name: 'Settings', icon: <Settings className="text-slate-300" size={20} /> },
    { id: 'sysinfo', name: 'System Info', icon: <Cpu className="text-purple-400" size={20} /> },
  ];

  const handleAppClick = (appId: AppId) => {
    const existing = windows.find(w => w.appId === appId);
    if (existing) {
      if (existing.minimized || activeWindowId !== existing.id) {
        focusWindow(existing.id);
      } else {
        // If already active, open another window or focus
        focusWindow(existing.id);
      }
    } else {
      openWindow(appId);
    }
  };

  return (
    <>
      {isStartOpen && <StartMenu />}

      {/* Floating Bottom Dock Container */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[720px] max-w-[94vw] h-[64px] bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-between px-4 shadow-2xl z-[900] select-none">
        
        {/* Start Button */}
        <div 
          onClick={toggleStartMenu}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer mr-2 border ${
            isStartOpen ? 'bg-blue-500/30 border-blue-400/50' : 'bg-white/10 border-white/10 hover:bg-white/20'
          }`}
          title="Start Menu"
        >
          <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
            <div className="bg-white/80 rounded-[1px]" />
            <div className="bg-white/80 rounded-[1px]" />
            <div className="bg-white/80 rounded-[1px]" />
            <div className="bg-white/80 rounded-[1px]" />
          </div>
        </div>

        <div className="h-8 w-[1px] bg-white/10 mx-2" />

        {/* Pinned App Icons Dock */}
        <div className="flex-1 flex justify-center gap-3">
          {appIcons.map(app => {
            const runningWin = windows.find(w => w.appId === app.id);
            const isRunning = !!runningWin;
            const isActive = isRunning && activeWindowId === runningWin.id && !runningWin.minimized;

            return (
              <div 
                key={app.id}
                onClick={() => handleAppClick(app.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center relative cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-blue-500/25 border border-blue-500/40 shadow-lg shadow-blue-500/10' 
                    : isRunning
                    ? 'bg-white/10 border border-white/10 hover:bg-white/15'
                    : 'bg-white/5 border border-white/5 hover:bg-white/10'
                }`}
                title={app.name}
              >
                {app.icon}

                {/* Running Active Dot */}
                {isRunning && (
                  <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-blue-400 ring-2 ring-blue-400/30' : 'bg-slate-400'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="h-8 w-[1px] bg-white/10 mx-2" />

        {/* System Tray */}
        <SystemTray />
      </div>
    </>
  );
};
