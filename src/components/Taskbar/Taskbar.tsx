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
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[720px] max-w-[94vw] h-[64px] bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-between px-4 shadow-2xl taskbar-layer select-none">

        {/* Start Button */}
        <button 
          onClick={toggleStartMenu}
          className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all"
        >
          <div className="w-5 h-5 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-md" />
        </button>

        {/* App Icons */}
        <div className="flex items-center gap-1">
          {appIcons.map(app => (
            <button
              key={app.id}
              onClick={() => handleAppClick(app.id)}
              className="w-10 h-10 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all relative group"
              title={app.name}
            >
              {app.icon}
              {/* Active indicator dot */}
              {windows.some(w => w.appId === app.id && !w.minimized) && (
                <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* System Tray */}
        <SystemTray />
      </div>
    </>
  );
};
