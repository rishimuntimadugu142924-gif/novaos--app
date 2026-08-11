import { VirtualFile } from '../types';

export const INITIAL_FILES: VirtualFile[] = [
  // Root directories
  {
    id: 'dir-root',
    name: 'root',
    path: '/',
    parentPath: '',
    type: 'folder',
    size: 0,
    createdAt: '2026-08-10 12:00',
    updatedAt: '2026-08-10 12:00',
    readOnly: true,
  },
  {
    id: 'dir-home',
    name: 'home',
    path: '/home',
    parentPath: '/',
    type: 'folder',
    size: 0,
    createdAt: '2026-08-10 12:00',
    updatedAt: '2026-08-10 12:00',
    readOnly: true,
  },
  {
    id: 'dir-user',
    name: 'user',
    path: '/home/user',
    parentPath: '/home',
    type: 'folder',
    size: 0,
    createdAt: '2026-08-10 12:00',
    updatedAt: '2026-08-10 12:00',
    readOnly: true,
  },

  // Main User Folders
  {
    id: 'dir-desktop',
    name: 'Desktop',
    path: '/home/user/Desktop',
    parentPath: '/home/user',
    type: 'folder',
    size: 0,
    createdAt: '2026-08-10 12:00',
    updatedAt: '2026-08-10 12:00',
  },
  {
    id: 'dir-documents',
    name: 'Documents',
    path: '/home/user/Documents',
    parentPath: '/home/user',
    type: 'folder',
    size: 0,
    createdAt: '2026-08-10 12:00',
    updatedAt: '2026-08-10 12:00',
  },
  {
    id: 'dir-projects',
    name: 'Project_X',
    path: '/home/user/Desktop/Project_X',
    parentPath: '/home/user/Desktop',
    type: 'folder',
    size: 0,
    createdAt: '2026-08-10 12:00',
    updatedAt: '2026-08-10 12:00',
  },
  {
    id: 'dir-downloads',
    name: 'Downloads',
    path: '/home/user/Downloads',
    parentPath: '/home/user',
    type: 'folder',
    size: 0,
    createdAt: '2026-08-10 12:00',
    updatedAt: '2026-08-10 12:00',
  },
  {
    id: 'dir-pictures',
    name: 'Pictures',
    path: '/home/user/Pictures',
    parentPath: '/home/user',
    type: 'folder',
    size: 0,
    createdAt: '2026-08-10 12:00',
    updatedAt: '2026-08-10 12:00',
  },
  {
    id: 'dir-trash',
    name: 'Trash',
    path: '/home/user/Trash',
    parentPath: '/home/user',
    type: 'folder',
    size: 0,
    createdAt: '2026-08-10 12:00',
    updatedAt: '2026-08-10 12:00',
  },

  // Desktop Files
  {
    id: 'file-welcome',
    name: 'Welcome_to_NovaOS.txt',
    path: '/home/user/Desktop/Welcome_to_NovaOS.txt',
    parentPath: '/home/user/Desktop',
    type: 'file',
    content: `=========================================
  WELCOME TO NOVA_OS v4.2.0-stable
  Geometric Glassmorphism WebOS
=========================================

Features & Architecture:
- Desktop Environment: Customizable backgrounds, desktop icons, taskbar dock, start menu, calendar widget.
- Window Manager: Draggable, resizable, minimizable, and maximizable app windows with depth stacking.
- Nova Terminal: Run commands like 'ls', 'cat', 'echo', 'sysinfo', or ask AI with 'ai "summarize system"'.
- Text Editor (Notepad): Create and save files directly to virtual storage.
- File Explorer: Browse directories, organize Project_X files, restore or empty trash.
- Nova AI Assistant: Integrated Gemini AI engine for system automation, code generation, and chat.
- Settings: Customize wallpapers, accent colors, sound effects, and API keys.

Logged in as: root@nova (Administrator)
System Status: OPTIMAL
`,
    size: 780,
    createdAt: '2026-08-10 12:00',
    updatedAt: '2026-08-10 12:00',
  },

  // Project_X Files
  {
    id: 'file-project-spec',
    name: 'architecture_spec.md',
    path: '/home/user/Desktop/Project_X/architecture_spec.md',
    parentPath: '/home/user/Desktop/Project_X',
    type: 'file',
    content: `# Project_X System Specs
- Kernel: Nova OS Kernel v4.2.0-stable x64_86
- Architecture: Micro-Kernel Virtualized Runtime
- Render Engine: Glassmorphic Geometric Canvas
- AI Model: Gemini 2.5 Flash System Integration
- Memory Allocation: 16.0 GB Virtual RAM
- Security Mode: Active Sandbox Isolation`,
    size: 310,
    createdAt: '2026-08-10 12:15',
    updatedAt: '2026-08-10 12:15',
  },
  {
    id: 'file-ai-core',
    name: 'ai_core.sh',
    path: '/home/user/Desktop/Project_X/ai_core.sh',
    parentPath: '/home/user/Desktop/Project_X',
    type: 'file',
    content: `#!/bin/bash
# Nova OS AI Core Dispatcher
echo "Initializing Gemini Neural Pipeline..."
echo "Status: 100% Operational"
echo "Ready for system intelligence commands."`,
    size: 165,
    createdAt: '2026-08-10 12:20',
    updatedAt: '2026-08-10 12:20',
  },
  {
    id: 'file-config-sys',
    name: 'config.sys',
    path: '/home/user/Desktop/Project_X/config.sys',
    parentPath: '/home/user/Desktop/Project_X',
    type: 'file',
    content: `THEME=geometric-dark
ACCENT=blue
SOUND_EFFECTS=true
AUTO_SAVE_INTERVAL=300
MAX_BUFFER_LOGS=1000`,
    size: 110,
    createdAt: '2026-08-10 12:25',
    updatedAt: '2026-08-10 12:25',
  },

  // Documents
  {
    id: 'file-notes',
    name: 'Meeting_Notes.txt',
    path: '/home/user/Documents/Meeting_Notes.txt',
    parentPath: '/home/user/Documents',
    type: 'file',
    content: `- Deep Learning Sync: Discussion on Gemini 2.5 Flash deployment.
- Benchmark: 98.4% accuracy on synthetic log classification.
- Action Item: Integrate automatic terminal scripting via Nova AI Assistant.`,
    size: 210,
    createdAt: '2026-08-10 14:00',
    updatedAt: '2026-08-10 14:00',
  },

  // Trash
  {
    id: 'file-deleted-log',
    name: 'old_kernel.log',
    path: '/home/user/Trash/old_kernel.log',
    parentPath: '/home/user/Trash',
    type: 'file',
    content: `[00:01:02] Kernel initializing...
[00:01:03] Loading legacy driver v1.0.0...
[00:01:04] Warning: Deprecated API call in module x86.`,
    size: 140,
    createdAt: '2026-08-09 18:30',
    updatedAt: '2026-08-09 18:30',
  }
];
