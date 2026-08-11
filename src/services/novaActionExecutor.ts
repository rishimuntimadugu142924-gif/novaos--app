import { VirtualFile, AppId, SystemSettings } from '../types';
import { sanitizeTextContent } from '../utils/fileParser';

export interface ExecutedActionResult {
  type: string;
  description: string;
  path?: string;
  success: boolean;
}

export interface SystemActionContext {
  files: VirtualFile[];
  createFile: (parentPath: string, name: string, content?: string) => VirtualFile;
  createFolder: (parentPath: string, name: string) => VirtualFile;
  saveFileContent: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  openWindow: (appId: AppId, title?: string, props?: Record<string, any>) => void;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  updateSettings?: (newSettings: Partial<SystemSettings>) => void;
  addEvent?: (event: { title: string; time: string; location: string; category?: string }) => void;
}

export function buildSystemContextForNova(
  files: VirtualFile[], 
  currentPath: string = '/home/user',
  extraContext?: string
): string {
  const fileInventory = files.map(f => {
    if (f.type === 'folder') {
      return `[DIR]  ${f.path}`;
    } else {
      const sanitized = sanitizeTextContent(f.content || '', f.name);
      const contentStr = sanitized
        ? (sanitized.length > 3000 ? sanitized.slice(0, 3000) + '\n... [truncated]' : sanitized) 
        : '(empty)';
      return `[FILE] ${f.path} (${f.size || 0} bytes)\n--- CONTENT START ---\n${contentStr}\n--- CONTENT END ---`;
    }
  }).join('\n\n');

  return `You are Nova, the central All-Rounder AI System Intelligence powering NovaOS.
You are an autonomous, versatile AI agent with full read, write, execution, and control access across the entire virtual operating system workspace.

ALL-ROUNDER AI OS CAPABILITIES:
- Full File System Management (create, read, update, delete files & folders, parse uploaded documents like DOCX/TXT/JSON).
- Direct App Orchestration (open, close, and switch applications including Notepad Pro, Terminal, File Explorer, System Info, and Settings).
- Code & Text Generation (write code, debug scripts, craft documents, summarize files).
- System & Theme Customization (adjust wallpapers, configure settings, manage notifications).
- Multilingual Communication (auto-detect user language and speak fluently in any global language).

MULTILINGUAL AUTO-DETECTION MANDATE:
- Automatically detect the user's input language (e.g. English, Spanish, French, German, Hindi, Japanese, Chinese, Arabic, Portuguese, Italian, Russian, Korean, etc.).
- Respond fluently, naturally, and accurately in the EXACT SAME LANGUAGE as the user's input.
- Keep system action JSON blocks (\`\`\`nova-action) intact, but write all surrounding conversational explanations, summaries, and messages in the detected language.

STRICT FILE & NOTEPAD CREATION RULE:
- NEVER create a file on disk or open Notepad automatically unless the user explicitly requested you to create or save a file.
- When generating text, code, or answers, provide the response directly in conversation FIRST.
- Offer to save it as a file or open it in Notepad Pro, but do NOT execute file creation actions unless the user explicitly asked to create or save a file.

CURRENT WORKSPACE DIRECTORY: ${currentPath}

REAL-TIME VIRTUAL FILE SYSTEM INVENTORY (WITH FULL FILE CONTENTS):
${fileInventory}

OPERATIONAL MANDATE & ACTION SPECIFICATION:
When the user asks you to:
1. Read or analyze files -> Reference the actual file contents provided above.
2. Create or write new files -> Include a "create_file" action in a \`\`\`nova-action block with full content.
3. Edit or update existing files -> Include an "edit_file" or "create_file" action.
4. Delete files or folders -> Include a "delete_file" action.
5. Create folders -> Include a "create_folder" action.
6. Open files or apps -> Include "open_file" or "open_app" actions.
7. Manage calendar or settings -> Include "add_event" or "change_wallpaper" actions.

FORMAT FOR EXECUTING ACTIONS:
Output your conversational response, and include a JSON code block with language "nova-action":

\`\`\`nova-action
{
  "actions": [
    {
      "type": "create_file",
      "path": "/home/user/Desktop/new_document.txt",
      "content": "Hello World! Created by Nova AI."
    },
    {
      "type": "open_file",
      "path": "/home/user/Desktop/new_document.txt"
    }
  ]
}
\`\`\`

SUPPORTED ACTION OBJECTS:
- { "type": "create_file", "path": "/full/path/to/file.ext", "content": "..." }
- { "type": "edit_file", "path": "/full/path/to/file.ext", "content": "..." }
- { "type": "delete_file", "path": "/full/path/to/file.ext" }
- { "type": "create_folder", "path": "/full/path/to/directory" }
- { "type": "open_file", "path": "/full/path/to/file.ext" } (Opens the file directly in Notepad Pro)
- { "type": "open_app", "app": "explorer" | "terminal" | "notepad" | "settings" | "sysinfo" | "trash" }
- { "type": "add_event", "title": "Meeting Title", "time": "15:30", "location": "Room A" }
- { "type": "change_wallpaper", "wallpaper": "indigo-radial" | "emerald-nebula" | "cyberpunk-cyan" | "obsidian-crimson" | "solar-gold" }

Always ensure paths are absolute (starting with /home/user/...). Be helpful, precise, and execute user requests immediately!
${extraContext || ''}`;
}

export function parseAndExecuteNovaActions(
  aiText: string,
  sysContext: SystemActionContext
): { cleanText: string; results: ExecutedActionResult[] } {
  const results: ExecutedActionResult[] = [];
  let textToClean = aiText;

  // 1. Extract JSON ```nova-action blocks
  const jsonBlockRegex = /```nova-action\s*([\s\S]*?)\s*```/gi;
  let match;

  while ((match = jsonBlockRegex.exec(aiText)) !== null) {
    const rawJson = match[1];
    try {
      const parsed = JSON.parse(rawJson);
      const actionsList = Array.isArray(parsed) ? parsed : (parsed.actions || [parsed]);

      for (const act of actionsList) {
        executeSingleAction(act, sysContext, results);
      }
    } catch (err: any) {
      console.error('Failed to parse nova-action JSON:', err);
    }
  }

  // Remove the JSON code blocks from the displayed text
  textToClean = textToClean.replace(/```nova-action\s*[\s\S]*?```/gi, '').trim();

  // 2. Fallback: Parse inline tags e.g. [ACTION:OPEN_APP app="terminal"] or [ACTION:CREATE_FILE path="..." content="..."]
  const tagRegex = /\[ACTION:(CREATE_FILE|EDIT_FILE|DELETE_FILE|CREATE_FOLDER|OPEN_FILE|OPEN_APP)\s+([^\]]+)\]/gi;
  let tagMatch;

  while ((tagMatch = tagRegex.exec(aiText)) !== null) {
    const actionType = tagMatch[1].toLowerCase();
    const attrString = tagMatch[2];

    const pathMatch = attrString.match(/path="([^"]+)"/i);
    const contentMatch = attrString.match(/content="([^"]+)"/i);
    const appMatch = attrString.match(/app="([^"]+)"/i);

    const actObj: any = { type: actionType };
    if (pathMatch) actObj.path = pathMatch[1];
    if (contentMatch) actObj.content = contentMatch[1];
    if (appMatch) actObj.app = appMatch[1];

    executeSingleAction(actObj, sysContext, results);
  }

  textToClean = textToClean.replace(/\[ACTION:[^\]]+\]/g, '').trim();

  return {
    cleanText: textToClean || (results.length > 0 ? 'Action(s) executed successfully.' : ''),
    results,
  };
}

function executeSingleAction(
  act: any,
  sysContext: SystemActionContext,
  results: ExecutedActionResult[]
) {
  if (!act || !act.type) return;

  const {
    files,
    createFile,
    createFolder,
    saveFileContent,
    deleteFile,
    openWindow,
    addNotification,
    updateSettings,
    addEvent,
  } = sysContext;

  try {
    switch (act.type) {
      case 'create_file': {
        if (!act.path) break;
        const lastSlash = act.path.lastIndexOf('/');
        const parentPath = lastSlash > 0 ? act.path.slice(0, lastSlash) : '/home/user/Desktop';
        const name = lastSlash >= 0 ? act.path.slice(lastSlash + 1) : act.path;

        createFile(parentPath, name, act.content || '');
        addNotification('File Created by Nova', `Created '${name}' in ${parentPath}`, 'success');
        results.push({
          type: 'create_file',
          description: `Created file: ${act.path}`,
          path: act.path,
          success: true,
        });
        break;
      }

      case 'edit_file': {
        if (!act.path) break;
        const existing = files.find(f => f.path === act.path);
        if (existing) {
          saveFileContent(act.path, act.content || '');
          addNotification('File Updated by Nova', `Updated content of '${existing.name}'`, 'info');
          results.push({
            type: 'edit_file',
            description: `Updated file: ${act.path}`,
            path: act.path,
            success: true,
          });
        } else {
          // If file doesn't exist, create it
          const lastSlash = act.path.lastIndexOf('/');
          const parentPath = lastSlash > 0 ? act.path.slice(0, lastSlash) : '/home/user/Desktop';
          const name = lastSlash >= 0 ? act.path.slice(lastSlash + 1) : act.path;
          createFile(parentPath, name, act.content || '');
          addNotification('File Created by Nova', `Created '${name}'`, 'success');
          results.push({
            type: 'create_file',
            description: `Created file: ${act.path}`,
            path: act.path,
            success: true,
          });
        }
        break;
      }

      case 'delete_file': {
        if (!act.path) break;
        deleteFile(act.path);
        addNotification('File Removed by Nova', `Moved '${act.path}' to Trash`, 'warning');
        results.push({
          type: 'delete_file',
          description: `Deleted: ${act.path}`,
          path: act.path,
          success: true,
        });
        break;
      }

      case 'create_folder': {
        if (!act.path) break;
        const lastSlash = act.path.lastIndexOf('/');
        const parentPath = lastSlash > 0 ? act.path.slice(0, lastSlash) : '/home/user/Desktop';
        const name = lastSlash >= 0 ? act.path.slice(lastSlash + 1) : act.path;

        createFolder(parentPath, name);
        addNotification('Folder Created by Nova', `Created directory '${name}'`, 'success');
        results.push({
          type: 'create_folder',
          description: `Created directory: ${act.path}`,
          path: act.path,
          success: true,
        });
        break;
      }

      case 'open_file': {
        if (!act.path) break;
        const file = files.find(f => f.path === act.path);
        const fileName = file ? file.name : act.path.split('/').pop() || 'File';
        openWindow('notepad', fileName, { filePath: act.path });
        results.push({
          type: 'open_file',
          description: `Opened in Notepad Pro: ${act.path}`,
          path: act.path,
          success: true,
        });
        break;
      }

      case 'open_app': {
        const appId = act.app as AppId;
        if (appId) {
          openWindow(appId);
          results.push({
            type: 'open_app',
            description: `Launched App: ${appId}`,
            success: true,
          });
        }
        break;
      }

      case 'add_event': {
        if (addEvent && act.title) {
          addEvent({
            title: act.title,
            time: act.time || '12:00',
            location: act.location || 'Nova Space',
            category: 'ai',
          });
          addNotification('Event Scheduled', `Added '${act.title}' to system calendar`, 'success');
          results.push({
            type: 'add_event',
            description: `Scheduled Calendar Event: ${act.title} at ${act.time || '12:00'}`,
            success: true,
          });
        }
        break;
      }

      case 'change_wallpaper': {
        if (updateSettings && act.wallpaper) {
          updateSettings({ wallpaper: act.wallpaper });
          addNotification('Theme Updated', `NovaOS wallpaper changed to '${act.wallpaper}'`, 'info');
          results.push({
            type: 'change_wallpaper',
            description: `Changed wallpaper to: ${act.wallpaper}`,
            success: true,
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (err: any) {
    console.error(`Error executing action ${act.type}:`, err);
    results.push({
      type: act.type,
      description: `Failed to perform ${act.type}: ${err.message}`,
      success: false,
    });
  }
}
