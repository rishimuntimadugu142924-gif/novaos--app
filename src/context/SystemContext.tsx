import React, { createContext, useContext, useState, useEffect } from 'react';
import { WindowState, AppId, VirtualFile, SystemSettings, SystemNotification, CalendarEvent } from '../types';
import { INITIAL_FILES } from '../utils/initialFileSystem';
import { playSound } from '../services/audioService';

interface SystemContextType {
  // Windows
  windows: WindowState[];
  activeWindowId: string | null;
  openWindow: (appId: AppId, title?: string, props?: Record<string, any>) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;

  // File System
  files: VirtualFile[];
  createFile: (parentPath: string, name: string, content?: string) => VirtualFile;
  createFolder: (parentPath: string, name: string) => VirtualFile;
  saveFileContent: (path: string, content: string) => void;
  deleteFile: (path: string) => void; // Moves to trash
  restoreFromTrash: (path: string) => void;
  emptyTrash: () => void;
  getFileByPath: (path: string) => VirtualFile | undefined;
  getFilesByParent: (parentPath: string) => VirtualFile[];

  // Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;

  // Notifications
  notifications: SystemNotification[];
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  clearNotifications: () => void;

  // System Power & Lock
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  isShutDown: boolean;
  shutdownSystem: () => void;
  restartSystem: () => void;
  bootSystem: () => void;

  // Calendar
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;

  // Start Menu Toggle
  isStartOpen: boolean;
  setIsStartOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleStartMenu: () => void;

  // Widgets Toggle
  isWidgetsOpen: boolean;
  setIsWidgetsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleWidgets: () => void;
}

const DEFAULT_SETTINGS: SystemSettings = {
  wallpaper: 'indigo-radial',
  accentColor: 'blue',
  glassOpacity: 0.6,
  soundEnabled: true,
  customApiKey: '',
  userName: 'root@nova',
  userRole: 'Administrator',
  widgetsVisible: true,
  pinCode: '1234',
};

const DEFAULT_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Deep Learning Sync', time: '15:30', location: 'Conference Room B', category: 'ai' },
  { id: '2', title: 'Kernel Security Audit', time: '17:00', location: 'Virtual Lab 4', category: 'work' },
  { id: '3', title: 'System Backup Routine', time: '20:00', location: 'Nova Cloud', category: 'sync' },
];

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Windows state
  const [windows, setWindows] = useState<WindowState[]>([
    {
      id: 'win-ai-init',
      appId: 'ai',
      title: 'Nova Assistant',
      iconName: 'Bot',
      x: 180,
      y: 60,
      width: 520,
      height: 580,
      minimized: false,
      maximized: false,
      zIndex: 12,
    }
  ]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>('win-ai-init');
  const [nextZIndex, setNextZIndex] = useState(20);

  // File system state with localStorage persistence
  const [files, setFiles] = useState<VirtualFile[]>(() => {
    try {
      const saved = localStorage.getItem('nova_os_files');
      return saved ? JSON.parse(saved) : INITIAL_FILES;
    } catch {
      return INITIAL_FILES;
    }
  });

  // Settings state with localStorage persistence
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('nova_os_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Notifications
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif-1',
      title: 'System Boot Complete',
      message: 'NovaOS Kernel v4.2.0-stable initialized successfully.',
      type: 'info',
      timestamp: 'Just now',
      read: false,
    }
  ]);

  // System power state
  const [isLocked, setIsLocked] = useState(false);
  const [isShutDown, setIsShutDown] = useState(false);

  // Shell UI toggles
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);

  // Calendar events
  const [events, setEvents] = useState<CalendarEvent[]>(DEFAULT_EVENTS);

  // Sync files & settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nova_os_files', JSON.stringify(files));
    } catch (e) {
      console.error('Failed to persist files:', e);
    }
  }, [files]);

  useEffect(() => {
    try {
      localStorage.setItem('nova_os_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to persist settings:', e);
    }
  }, [settings]);

  // Window operations
  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: nextZIndex, minimized: false } : w));
    setNextZIndex(z => z + 1);
  };

  const openWindow = (appId: AppId, title?: string, props?: Record<string, any>) => {
    playSound('open', settings.soundEnabled);
    setIsStartOpen(false);

    // Default dimensions and titles per app
    const appDefaults: Record<AppId, { title: string; iconName: string; w: number; h: number }> = {
      explorer: { title: 'File_Explorer', iconName: 'Folder', w: 760, h: 500 },
      terminal: { title: 'Nova_Terminal', iconName: 'Terminal', w: 660, h: 440 },
      notepad: { title: 'Notepad_Pro', iconName: 'FileText', w: 680, h: 480 },
      ai: { title: 'Nova Assistant', iconName: 'Bot', w: 420, h: 560 },
      settings: { title: 'System_Settings', iconName: 'Settings', w: 700, h: 520 },
      sysinfo: { title: 'System_Metrics', iconName: 'Cpu', w: 640, h: 460 },
      trash: { title: 'Trash_Bin', iconName: 'Trash2', w: 680, h: 460 },
    };

    const def = appDefaults[appId] || { title: 'App', iconName: 'Square', w: 600, h: 400 };
    const winTitle = title || def.title;

    // Check if an existing unminimized window of same appId with no custom props exists
    const existing = windows.find(w => w.appId === appId && !props);
    if (existing) {
      focusWindow(existing.id);
      return;
    }

    const newId = `win-${appId}-${Date.now()}`;
    const offset = (windows.length % 5) * 24;

    const newWin: WindowState = {
      id: newId,
      appId,
      title: winTitle,
      iconName: def.iconName,
      x: Math.max(80, 160 + offset),
      y: Math.max(60, 80 + offset),
      width: def.w,
      height: def.h,
      minimized: false,
      maximized: false,
      zIndex: nextZIndex,
      props,
    };

    setNextZIndex(z => z + 1);
    setWindows(prev => [...prev, newWin]);
    setActiveWindowId(newId);
  };

  const closeWindow = (id: string) => {
    playSound('close', settings.soundEnabled);
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (id: string) => {
    playSound('click', settings.soundEnabled);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const maximizeWindow = (id: string) => {
    playSound('click', settings.soundEnabled);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w));
    focusWindow(id);
  };

  const updateWindowPosition = (id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  };

  const updateWindowSize = (id: string, width: number, height: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, width, height } : w));
  };

  // File System operations
  const getFileByPath = (path: string) => files.find(f => f.path === path);

  const getFilesByParent = (parentPath: string) => files.filter(f => f.parentPath === parentPath);

  const createFile = (parentPath: string, name: string, content = ''): VirtualFile => {
    const cleanParent = parentPath.endsWith('/') && parentPath !== '/' ? parentPath.slice(0, -1) : parentPath;
    const fullPath = cleanParent === '/' ? `/${name}` : `${cleanParent}/${name}`;

    const newFile: VirtualFile = {
      id: `file-${Date.now()}`,
      name,
      path: fullPath,
      parentPath: cleanParent,
      type: 'file',
      content,
      size: new Blob([content]).size,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    setFiles(prev => [...prev.filter(f => f.path !== fullPath), newFile]);
    playSound('click', settings.soundEnabled);
    return newFile;
  };

  const createFolder = (parentPath: string, name: string): VirtualFile => {
    const cleanParent = parentPath.endsWith('/') && parentPath !== '/' ? parentPath.slice(0, -1) : parentPath;
    const fullPath = cleanParent === '/' ? `/${name}` : `${cleanParent}/${name}`;

    const newFolder: VirtualFile = {
      id: `folder-${Date.now()}`,
      name,
      path: fullPath,
      parentPath: cleanParent,
      type: 'folder',
      size: 0,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    setFiles(prev => [...prev.filter(f => f.path !== fullPath), newFolder]);
    playSound('click', settings.soundEnabled);
    return newFolder;
  };

  const saveFileContent = (path: string, content: string) => {
    setFiles(prev => prev.map(f => {
      if (f.path === path) {
        return {
          ...f,
          content,
          size: new Blob([content]).size,
          updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        };
      }
      return f;
    }));
    playSound('click', settings.soundEnabled);
  };

  const deleteFile = (path: string) => {
    if (!path) return;
    const clean = path.trim().replace(/\/+/g, '/').replace(/(.+)\/$/, '$1');

    // Smart path finding
    const target = files.find(f => f.path === clean) ||
      files.find(f => f.path === `/home/user/Desktop/${clean.replace(/^\//, '')}`) ||
      files.find(f => f.path === `/home/user/Documents/${clean.replace(/^\//, '')}`) ||
      files.find(f => f.path === `/home/user/Downloads/${clean.replace(/^\//, '')}`) ||
      files.find(f => f.name === clean && f.parentPath !== '/home/user/Trash') ||
      files.find(f => f.name === clean);

    if (!target) {
      console.warn('deleteFile: File not found for path:', path);
      return;
    }

    if (target.parentPath === '/home/user/Trash') {
      // Hard delete target and any nested contents
      setFiles(prev => prev.filter(f => f.path !== target.path && !f.path.startsWith(target.path + '/')));
    } else {
      // Move to trash
      const trashPath = `/home/user/Trash/${target.name}`;
      setFiles(prev => prev.map(f => {
        if (f.path === target.path) {
          return {
            ...f,
            path: trashPath,
            parentPath: '/home/user/Trash',
            updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          };
        }
        if (f.path.startsWith(target.path + '/')) {
          const newChildPath = f.path.replace(target.path, trashPath);
          const lastSlash = newChildPath.lastIndexOf('/');
          const newParentPath = lastSlash > 0 ? newChildPath.slice(0, lastSlash) : '/home/user/Trash';
          return {
            ...f,
            path: newChildPath,
            parentPath: newParentPath,
            updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          };
        }
        return f;
      }));
    }
    playSound('close', settings.soundEnabled);
  };

  const restoreFromTrash = (path: string) => {
    if (!path) return;
    const clean = path.trim().replace(/\/+/g, '/').replace(/(.+)\/$/, '$1');
    const target = files.find(f => f.path === clean) || files.find(f => f.name === clean && f.parentPath === '/home/user/Trash');
    if (!target) return;

    const restoredParent = '/home/user/Desktop';
    const restoredPath = `/home/user/Desktop/${target.name}`;

    setFiles(prev => prev.map(f => {
      if (f.path === target.path) {
        return {
          ...f,
          path: restoredPath,
          parentPath: restoredParent,
        };
      }
      if (f.path.startsWith(target.path + '/')) {
        const newChildPath = f.path.replace(target.path, restoredPath);
        const lastSlash = newChildPath.lastIndexOf('/');
        const newParentPath = lastSlash > 0 ? newChildPath.slice(0, lastSlash) : restoredPath;
        return {
          ...f,
          path: newChildPath,
          parentPath: newParentPath,
        };
      }
      return f;
    }));
    playSound('open', settings.soundEnabled);
  };

  const emptyTrash = () => {
    setFiles(prev => prev.filter(f => f.parentPath !== '/home/user/Trash'));
    playSound('close', settings.soundEnabled);
  };

  // Settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    playSound('click', settings.soundEnabled);
  };

  // Notifications
  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    playSound('notify', settings.soundEnabled);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Power
  const shutdownSystem = () => {
    playSound('close', settings.soundEnabled);
    setIsShutDown(true);
  };

  const restartSystem = () => {
    playSound('startup', settings.soundEnabled);
    setIsShutDown(true);
    setTimeout(() => {
      setIsShutDown(false);
      setIsLocked(false);
      addNotification('NovaOS Restarted', 'Kernel parameters refreshed cleanly.', 'info');
    }, 1500);
  };

  const bootSystem = () => {
    playSound('startup', settings.soundEnabled);
    setIsShutDown(false);
  };

  // Events
  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEv: CalendarEvent = {
      ...event,
      id: `evt-${Date.now()}`,
    };
    setEvents(prev => [...prev, newEv]);
    playSound('click', settings.soundEnabled);
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const toggleStartMenu = () => {
    playSound('click', settings.soundEnabled);
    setIsStartOpen(prev => !prev);
    if (isWidgetsOpen) setIsWidgetsOpen(false);
  };

  const toggleWidgets = () => {
    playSound('click', settings.soundEnabled);
    setIsWidgetsOpen(prev => !prev);
    if (isStartOpen) setIsStartOpen(false);
  };

  return (
    <SystemContext.Provider
      value={{
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        updateWindowPosition,
        updateWindowSize,
        files,
        createFile,
        createFolder,
        saveFileContent,
        deleteFile,
        restoreFromTrash,
        emptyTrash,
        getFileByPath,
        getFilesByParent,
        settings,
        updateSettings,
        notifications,
        addNotification,
        clearNotifications,
        isLocked,
        setIsLocked,
        isShutDown,
        shutdownSystem,
        restartSystem,
        bootSystem,
        events,
        addEvent,
        deleteEvent,
        isStartOpen,
        setIsStartOpen,
        toggleStartMenu,
        isWidgetsOpen,
        setIsWidgetsOpen,
        toggleWidgets,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
