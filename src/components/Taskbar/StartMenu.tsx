import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { AppId } from '../../types';
import { 
  Search, 
  Folder, 
  Terminal, 
  FileText, 
  Bot, 
  Settings, 
  Cpu, 
  Trash2, 
  Power, 
  RotateCcw, 
  Lock, 
  User, 
  HardDrive 
} from 'lucide-react';

export const StartMenu: React.FC = () => {
  const { openWindow, files, setIsStartOpen, shutdownSystem, restartSystem, setIsLocked } = useSystem();
  const [search, setSearch] = useState('');

  const appList: { id: AppId; name: string; icon: React.ReactNode; category: string }[] = [
    { id: 'explorer', name: 'File Explorer', icon: <Folder className="text-amber-400" size={20} />, category: 'Files' },
    { id: 'terminal', name: 'Nova Terminal', icon: <Terminal className="text-emerald-400" size={20} />, category: 'System' },
    { id: 'notepad', name: 'Notepad Pro', icon: <FileText className="text-blue-400" size={20} />, category: 'Tools' },
    { id: 'ai', name: 'Nova Assistant', icon: <Bot className="text-indigo-400" size={20} />, category: 'Intelligence' },
    { id: 'settings', name: 'System Settings', icon: <Settings className="text-slate-300" size={20} />, category: 'Preferences' },
    { id: 'sysinfo', name: 'System Metrics', icon: <Cpu className="text-purple-400" size={20} />, category: 'System' },
    { id: 'trash', name: 'Trash Bin', icon: <Trash2 className="text-red-400" size={20} />, category: 'Files' },
  ];

  const filteredApps = appList.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase()) || 
    app.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFiles = files.filter(f => 
    f.type === 'file' && f.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 4);

  const handleLaunch = (appId: AppId) => {
    openWindow(appId);
    setIsStartOpen(false);
  };

  return (
    <div 
      className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[420px] max-w-[92vw] bg-slate-900/90 backdrop-blur-3xl border border-white/15 rounded-3xl p-5 shadow-2xl z-[999] flex flex-col gap-4 text-slate-100 font-sans select-none animate-in fade-in slide-in-from-bottom-5 duration-150"
    >
      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search apps, files, or settings..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400/50"
        />
      </div>

      {/* Pinned Applications Grid */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Pinned Applications
        </div>
        <div className="grid grid-cols-4 gap-2">
          {filteredApps.map(app => (
            <button 
              key={app.id}
              onClick={() => handleLaunch(app.id)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all group"
            >
              <div className="p-2 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                {app.icon}
              </div>
              <span className="mt-2 text-[11px] font-medium text-slate-300 text-center truncate w-full">
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search File Matches (If query entered) */}
      {search && filteredFiles.length > 0 && (
        <div className="space-y-2 border-t border-white/10 pt-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Matching Files
          </div>
          <div className="space-y-1">
            {filteredFiles.map(file => (
              <div 
                key={file.id}
                onClick={() => { openWindow('notepad', file.name, { filePath: file.path }); setIsStartOpen(false); }}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer text-xs text-slate-200"
              >
                <FileText size={14} className="text-blue-400" />
                <span className="font-medium truncate flex-1">{file.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">{file.path}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Avatar & Power Bar */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-md">
            <User size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-none">root@nova</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Administrator</div>
          </div>
        </div>

        {/* Power Menu */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => { setIsLocked(true); setIsStartOpen(false); }}
            className="p-2 rounded-xl hover:bg-white/15 text-slate-300 transition-colors"
            title="Lock Workspace"
          >
            <Lock size={15} />
          </button>
          <button 
            onClick={() => { restartSystem(); setIsStartOpen(false); }}
            className="p-2 rounded-xl hover:bg-white/15 text-amber-400 transition-colors"
            title="Restart OS"
          >
            <RotateCcw size={15} />
          </button>
          <button 
            onClick={() => { shutdownSystem(); setIsStartOpen(false); }}
            className="p-2 rounded-xl hover:bg-red-500/20 text-red-400 transition-colors"
            title="Shutdown"
          >
            <Power size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
