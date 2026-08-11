import React, { useEffect, useRef } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Folder, Terminal, FileText, Settings, RefreshCw, Plus, FolderPlus, Sparkles } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose }) => {
  const { openWindow, createFile, createFolder } = useSystem();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div 
      ref={menuRef}
      style={{ top: y, left: x }}
      className="fixed w-52 bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-1.5 shadow-2xl z-[1000] text-xs font-sans text-slate-200 select-none space-y-1 animate-in fade-in duration-100"
    >
      <button 
        onClick={() => handleAction(() => openWindow('explorer'))}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
      >
        <Folder size={15} className="text-amber-400" />
        <span>Open File Explorer</span>
      </button>

      <button 
        onClick={() => handleAction(() => openWindow('terminal'))}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
      >
        <Terminal size={15} className="text-emerald-400" />
        <span>Open Nova Terminal</span>
      </button>

      <button 
        onClick={() => handleAction(() => openWindow('ai'))}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
      >
        <Sparkles size={15} className="text-blue-400" />
        <span>Ask Nova Assistant</span>
      </button>

      <div className="h-[1px] bg-white/10 my-1" />

      <button 
        onClick={() => handleAction(() => createFile('/home/user/Desktop', 'New_Document.txt', ''))}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
      >
        <Plus size={15} className="text-blue-400" />
        <span>New Text File</span>
      </button>

      <button 
        onClick={() => handleAction(() => createFolder('/home/user/Desktop', 'New_Folder'))}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
      >
        <FolderPlus size={15} className="text-amber-400" />
        <span>New Folder</span>
      </button>

      <div className="h-[1px] bg-white/10 my-1" />

      <button 
        onClick={() => handleAction(() => openWindow('settings'))}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
      >
        <Settings size={15} className="text-slate-400" />
        <span>Change Wallpaper & Settings</span>
      </button>
    </div>
  );
};
