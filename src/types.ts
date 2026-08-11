import React from 'react';

export type AppId = 'explorer' | 'terminal' | 'notepad' | 'ai' | 'settings' | 'sysinfo' | 'trash';

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  iconName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  props?: Record<string, any>;
}

export interface VirtualFile {
  id: string;
  name: string;
  path: string;
  parentPath: string;
  type: 'file' | 'folder';
  content?: string;
  size: number; // bytes
  createdAt: string;
  updatedAt: string;
  readOnly?: boolean;
  icon?: string;
}

export type WallpaperPreset = 'indigo-radial' | 'emerald-nebula' | 'obsidian-crimson' | 'cyberpunk-cyan' | 'solar-gold';

export interface SystemSettings {
  wallpaper: WallpaperPreset | string;
  accentColor: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'cyan';
  glassOpacity: number;
  soundEnabled: boolean;
  customApiKey: string;
  userName: string;
  userRole: string;
  widgetsVisible: boolean;
  pinCode: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export interface TerminalCommand {
  command: string;
  output: string | React.ReactNode;
  type?: 'input' | 'output' | 'error' | 'ai';
  timestamp: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  category: 'work' | 'personal' | 'ai' | 'sync';
}
