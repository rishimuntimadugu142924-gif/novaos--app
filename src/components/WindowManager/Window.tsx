import React, { useState, useRef, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { WindowState } from '../../types';
import { Minus, Square, Copy, X, Maximize2, Minimize2 } from 'lucide-react';

interface WindowProps {
  win: WindowState;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ win, children }) => {
  const { 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    focusWindow, 
    activeWindowId, 
    updateWindowPosition, 
    updateWindowSize 
  } = useSystem();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; winX: number; winY: number }>({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const resizeStartRef = useRef<{ mouseX: number; mouseY: number; winW: number; winH: number }>({ mouseX: 0, mouseY: 0, winW: 0, winH: 0 });

  const isActive = activeWindowId === win.id;

  // Window drag handlers
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (win.maximized) return;
    focusWindow(win.id);
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: win.x,
      winY: win.y,
    };
  };

  // Window resize handlers
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (win.maximized) return;
    focusWindow(win.id);
    setIsResizing(true);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winW: win.width,
      winH: win.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartRef.current.mouseX;
        const deltaY = e.clientY - dragStartRef.current.mouseY;
        const newX = Math.max(10, Math.min(window.innerWidth - win.width - 10, dragStartRef.current.winX + deltaX));
        const newY = Math.max(10, Math.min(window.innerHeight - win.height - 70, dragStartRef.current.winY + deltaY));
        updateWindowPosition(win.id, newX, newY);
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStartRef.current.mouseX;
        const deltaY = e.clientY - resizeStartRef.current.mouseY;
        const newW = Math.max(340, resizeStartRef.current.winW + deltaX);
        const newH = Math.max(260, resizeStartRef.current.winH + deltaY);
        updateWindowSize(win.id, newW, newH);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, win.id, win.width, win.height]);

  if (win.minimized) return null;

  return (
    <div 
      onMouseDown={() => focusWindow(win.id)}
      style={{
        top: win.maximized ? 0 : win.y,
        left: win.maximized ? 0 : win.x,
        width: win.maximized ? '100vw' : win.width,
        height: win.maximized ? 'calc(100vh - 68px)' : win.height,
        zIndex: win.zIndex,
      }}
      className={`fixed flex flex-col transition-all duration-75 select-none rounded-xl overflow-hidden shadow-2xl border ${
        win.maximized ? 'rounded-none border-none' : 'rounded-xl'
      } ${
        isActive 
          ? 'bg-slate-950/85 backdrop-blur-2xl border-white/20 ring-1 ring-blue-500/30' 
          : 'bg-slate-950/70 backdrop-blur-xl border-white/10 opacity-95'
      }`}
    >
      {/* Title Bar Header */}
      <div 
        onMouseDown={handleHeaderMouseDown}
        className={`h-10 bg-white/5 border-b border-white/10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing ${
          isActive ? 'bg-white/10' : ''
        }`}
      >
        {/* Traffic Light Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
            className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-500 transition-colors flex items-center justify-center group"
            title="Close"
          >
            <X size={8} className="text-black opacity-0 group-hover:opacity-100" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
            className="w-3 h-3 rounded-full bg-amber-500/70 hover:bg-amber-500 transition-colors flex items-center justify-center group"
            title="Minimize"
          >
            <Minus size={8} className="text-black opacity-0 group-hover:opacity-100" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }}
            className="w-3 h-3 rounded-full bg-emerald-500/70 hover:bg-emerald-500 transition-colors flex items-center justify-center group"
            title="Maximize"
          >
            <Maximize2 size={8} className="text-black opacity-0 group-hover:opacity-100" />
          </button>
        </div>

        {/* Window Title (Geometric Uppercase) */}
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-[2px] truncate px-2 font-mono">
          {win.title}
        </div>

        {/* Balance spacer */}
        <div className="w-12" />
      </div>

      {/* Window Body */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>

      {/* Resize Handle Handle on Bottom Right */}
      {!win.maximized && (
        <div 
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 flex items-center justify-center group"
        >
          <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-slate-500 group-hover:border-blue-400" />
        </div>
      )}
    </div>
  );
};
