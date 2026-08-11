import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Window } from '../WindowManager/Window';
import { ContextMenu } from './ContextMenu';
import { FileExplorerApp } from '../Apps/FileExplorerApp';
import { TerminalApp } from '../Apps/TerminalApp';
import { NotepadApp } from '../Apps/NotepadApp';
import { AIAssistantApp } from '../Apps/AIAssistantApp';
import { SettingsApp } from '../Apps/SettingsApp';
import { SystemInfoApp } from '../Apps/SystemInfoApp';
import { ToastContainer } from './ToastContainer';
import { HardDrive, Folder, Terminal, Bot, FileText, Settings, Trash2, Cpu } from 'lucide-react';
import { AppId } from '../../types';

export const Desktop: React.FC = () => {
  const { windows, openWindow, settings, files } = useSystem();

  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const desktopIcons: { appId: AppId; label: string; icon: React.ReactNode; path?: string }[] = [
    { 
      appId: 'ai', 
      label: 'Nova Assistant', 
      icon: <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center text-white"><Bot size={20} /></div>
    },
    { 
      appId: 'explorer', 
      label: 'Hard Drive', 
      icon: <div className="w-8 h-8 bg-blue-500 rounded-lg shadow-lg flex items-center justify-center text-white"><HardDrive size={20} /></div>,
      path: '/home/user/Desktop'
    },
    { 
      appId: 'explorer', 
      label: 'Project_X', 
      icon: <div className="w-8 h-8 bg-amber-500 rounded-full opacity-90 flex items-center justify-center text-white"><Folder size={20} /></div>,
      path: '/home/user/Desktop/Project_X'
    },
    { 
      appId: 'notepad', 
      label: 'Notepad Pro', 
      icon: <div className="w-8 h-8 bg-indigo-600/80 rounded-lg flex items-center justify-center text-white"><FileText size={20} /></div>
    },
    { 
      appId: 'terminal', 
      label: 'Nova Terminal', 
      icon: <div className="w-8 h-8 bg-slate-900 border border-emerald-500/50 rounded-lg flex items-center justify-center text-emerald-400"><Terminal size={20} /></div>
    },
    { 
      appId: 'settings', 
      label: 'Settings', 
      icon: <div className="w-8 h-8 bg-slate-800 rounded-lg border border-slate-600 flex items-center justify-center text-slate-200"><Settings size={20} /></div>
    },
    { 
      appId: 'trash', 
      label: 'Trash Bin', 
      icon: <div className="w-8 h-8 border-2 border-slate-400/80 rounded-md flex items-center justify-center text-slate-300"><Trash2 size={18} /></div>
    },
  ];

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const renderAppContent = (win: any) => {
    switch (win.appId) {
      case 'explorer':
      case 'trash':
        return <FileExplorerApp windowProps={win.props} />;
      case 'terminal':
        return <TerminalApp />;
      case 'notepad':
        return <NotepadApp windowProps={win.props} />;
      case 'ai':
        return <AIAssistantApp />;
      case 'settings':
        return <SettingsApp />;
      case 'sysinfo':
        return <SystemInfoApp />;
      default:
        return <div className="p-4 text-slate-400">App not found</div>;
    }
  };

  // Dynamic Wallpaper style
  const getWallpaperStyle = () => {
    if (settings.wallpaper.startsWith('http://') || settings.wallpaper.startsWith('https://')) {
      return {
        backgroundImage: `url(${settings.wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    const presetGradients: Record<string, string> = {
      'indigo-radial': 'radial-gradient(circle at top left, #1e1b4b 0%, #020617 60%)',
      'emerald-nebula': 'radial-gradient(circle at top left, #064e3b 0%, #020617 60%)',
      'obsidian-crimson': 'radial-gradient(circle at top left, #4c0519 0%, #020617 60%)',
      'cyberpunk-cyan': 'radial-gradient(circle at top left, #164e63 0%, #020617 60%)',
      'solar-gold': 'radial-gradient(circle at top left, #451a03 0%, #020617 60%)',
    };
    return {
      background: presetGradients[settings.wallpaper] || presetGradients['indigo-radial'],
    };
  };

  const desktopUserFiles = files.filter(f => f.parentPath === '/home/user/Desktop' && f.name !== 'Project_X');

  return (
    <div 
      onContextMenu={handleContextMenu}
      onClick={() => setContextMenuPos(null)}
      style={getWallpaperStyle()}
      className="w-full h-full relative overflow-hidden select-none font-sans text-slate-100"
    >
      {/* Geometric Dot Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Desktop Icons Left Column Grid */}
      <div className="absolute top-12 left-12 grid grid-cols-1 gap-6 w-24 z-10 max-h-[85vh] overflow-y-auto no-scrollbar">
        {desktopIcons.map((item, idx) => (
          <div 
            key={idx}
            onClick={() => openWindow(item.appId, item.label, item.path ? { initialPath: item.path } : undefined)}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:bg-white/20 transition-all">
              {item.icon}
            </div>
            <span className="mt-2 text-xs font-medium text-slate-300 text-center drop-shadow-md group-hover:text-white transition-colors truncate max-w-[90px]">
              {item.label}
            </span>
          </div>
        ))}

        {/* Dynamic User Files & Folders on Desktop */}
        {desktopUserFiles.map(file => (
          <div 
            key={file.id}
            onDoubleClick={() => {
              if (file.type === 'folder') {
                openWindow('explorer', file.name, { initialPath: file.path });
              } else {
                openWindow('notepad', file.name, { filePath: file.path });
              }
            }}
            className="flex flex-col items-center group cursor-pointer relative"
          >
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:bg-white/20 transition-all relative">
              {file.type === 'folder' ? (
                <Folder size={26} className="text-amber-400 fill-amber-400/20" />
              ) : (
                <FileText size={26} className="text-blue-400" />
              )}
              
              {/* Desktop Delete Hover Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useSystem().deleteFile(file.path);
                }}
                className="absolute -top-1 -right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110"
                title="Delete File"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <span className="mt-2 text-xs font-medium text-slate-200 text-center drop-shadow-md group-hover:text-white transition-colors truncate max-w-[90px]">
              {file.name}
            </span>
          </div>
        ))}
      </div>

      {/* Floating System Toast Container */}
      <ToastContainer />

      {/* Windows Manager Layer */}
      {windows.map(win => (
        <Window key={win.id} win={win}>
          {renderAppContent(win)}
        </Window>
      ))}

      {/* Context Menu */}
      {contextMenuPos && (
        <ContextMenu 
          x={contextMenuPos.x} 
          y={contextMenuPos.y} 
          onClose={() => setContextMenuPos(null)} 
        />
      )}
    </div>
  );
};
