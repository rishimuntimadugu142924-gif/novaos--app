import React, { useState, useRef, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { TerminalCommand } from '../../types';
import { askNovaAI } from '../../services/geminiService';
import { buildSystemContextForNova, parseAndExecuteNovaActions } from '../../services/novaActionExecutor';

export const TerminalApp: React.FC = () => {
  const { 
    files, 
    createFile, 
    createFolder, 
    saveFileContent,
    deleteFile, 
    getFileByPath, 
    getFilesByParent, 
    settings, 
    updateSettings,
    addNotification,
    addEvent,
    openWindow 
  } = useSystem();

  const [currentDir, setCurrentDir] = useState('/home/user');
  const [history, setHistory] = useState<TerminalCommand[]>([
    {
      command: 'sysinfo',
      output: (
        <div className="text-slate-300 space-y-1">
          <div className="font-bold text-blue-400">NovaOS Kernel v4.2.0-stable x64_86</div>
          <div className="text-slate-400">Memory: 16.0 GB Virtual RAM | Storage: 512 GB SSD</div>
          <div className="text-emerald-400">AI Intelligence Pipeline: Active (Gemini 2.5 Flash)</div>
          <div className="text-slate-500">Type <span className="text-amber-400 font-semibold">'help'</span> or <span className="text-amber-400 font-semibold">'ai "your question"'</span> to begin.</div>
        </div>
      ),
      type: 'output',
      timestamp: '12:00',
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isProcessingAI]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = inputVal.trim();
    if (!rawCmd) return;

    setInputVal('');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append raw input command to terminal
    const newEntry: TerminalCommand = {
      command: rawCmd,
      output: null,
      type: 'input',
      timestamp,
    };

    setHistory(prev => [...prev, newEntry]);

    // Command parser
    const parts = rawCmd.match(/(?:[^\s"]+|"[^"]*")+/g) || [rawCmd];
    const cmd = parts[0]?.toLowerCase();
    const args = parts.slice(1).map(a => a.replace(/^"|"$/g, ''));

    let outputResult: React.ReactNode = null;

    if (cmd === 'clear') {
      setHistory([]);
      return;
    } else if (cmd === 'help') {
      outputResult = (
        <div className="space-y-1 text-slate-300">
          <div className="text-blue-400 font-bold mb-1">Available NovaOS Commands:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
            <div><span className="text-emerald-400 font-bold">ls [path]</span> - List directory contents</div>
            <div><span className="text-emerald-400 font-bold">cd &lt;dir&gt;</span> - Change current directory</div>
            <div><span className="text-emerald-400 font-bold">pwd</span> - Print working directory</div>
            <div><span className="text-emerald-400 font-bold">cat &lt;file&gt;</span> - Display file contents</div>
            <div><span className="text-emerald-400 font-bold">touch &lt;file&gt;</span> - Create empty text file</div>
            <div><span className="text-emerald-400 font-bold">mkdir &lt;dir&gt;</span> - Create directory</div>
            <div><span className="text-emerald-400 font-bold">rm &lt;file&gt;</span> - Delete file or folder</div>
            <div><span className="text-emerald-400 font-bold">echo &lt;text&gt;</span> - Output text string</div>
            <div><span className="text-emerald-400 font-bold">ai "&lt;query&gt;"</span> - Query Gemini System AI</div>
            <div><span className="text-emerald-400 font-bold">sysinfo</span> - View OS telemetry</div>
            <div><span className="text-emerald-400 font-bold">date / whoami</span> - System status info</div>
            <div><span className="text-emerald-400 font-bold">clear</span> - Clear terminal buffer</div>
          </div>
        </div>
      );
    } else if (cmd === 'pwd') {
      outputResult = <div className="text-blue-300 font-mono">{currentDir}</div>;
    } else if (cmd === 'whoami') {
      outputResult = <div className="text-emerald-400 font-mono">root@nova (Administrator)</div>;
    } else if (cmd === 'date') {
      outputResult = <div className="text-slate-300 font-mono">{new Date().toString()}</div>;
    } else if (cmd === 'sysinfo') {
      outputResult = (
        <div className="text-slate-300 space-y-1 font-mono text-xs">
          <div>OS Kernel: NovaOS Kernel v4.2.0-stable x64_86</div>
          <div>CPU: Nova Neural-9 Virtual Chip (8 Cores @ 3.8 GHz)</div>
          <div>Memory: 16384 MB DDR5 (Used: 3420 MB)</div>
          <div>Disk: 512 GB SSD (Available: 412 GB)</div>
          <div>Uptime: 0 days, 4 hours, 12 minutes</div>
          <div className="text-emerald-400">Gemini AI Bridge: Connected & Operational</div>
        </div>
      );
    } else if (cmd === 'ls') {
      const targetPath = args[0] 
        ? (args[0].startsWith('/') ? args[0] : `${currentDir}/${args[0]}`.replace(/\/+/g, '/')) 
        : currentDir;

      const children = getFilesByParent(targetPath);
      if (children.length === 0) {
        outputResult = <div className="text-slate-500 italic">Directory is empty or path not found.</div>;
      } else {
        outputResult = (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 font-mono text-xs">
            {children.map(item => (
              <span key={item.id} className={item.type === 'folder' ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                {item.type === 'folder' ? `d-- ${item.name}/` : `-rw ${item.name}`}
              </span>
            ))}
          </div>
        );
      }
    } else if (cmd === 'cd') {
      const target = args[0];
      if (!target || target === '~' || target === '/home/user') {
        setCurrentDir('/home/user');
      } else if (target === '..') {
        if (currentDir !== '/') {
          const parts = currentDir.split('/').filter(Boolean);
          parts.pop();
          setCurrentDir('/' + parts.join('/'));
        }
      } else {
        const fullPath = target.startsWith('/') ? target : `${currentDir}/${target}`.replace(/\/+/g, '/');
        const dir = getFileByPath(fullPath);
        if (dir && dir.type === 'folder') {
          setCurrentDir(fullPath);
        } else {
          outputResult = <div className="text-red-400 font-mono">cd: no such directory: {target}</div>;
        }
      }
    } else if (cmd === 'cat') {
      const filename = args[0];
      if (!filename) {
        outputResult = <div className="text-red-400 font-mono">cat: missing filename</div>;
      } else {
        const fullPath = filename.startsWith('/') ? filename : `${currentDir}/${filename}`.replace(/\/+/g, '/');
        const file = getFileByPath(fullPath);
        if (file && file.type === 'file') {
          outputResult = <pre className="text-slate-200 font-mono whitespace-pre-wrap">{file.content || '(empty file)'}</pre>;
        } else {
          outputResult = <div className="text-red-400 font-mono">cat: {filename}: No such file</div>;
        }
      }
    } else if (cmd === 'touch') {
      const filename = args[0];
      if (!filename) {
        outputResult = <div className="text-red-400 font-mono">touch: missing filename</div>;
      } else {
        createFile(currentDir, filename, '');
        outputResult = <div className="text-emerald-400 font-mono">Created file '{filename}' in {currentDir}</div>;
      }
    } else if (cmd === 'mkdir') {
      const dirname = args[0];
      if (!dirname) {
        outputResult = <div className="text-red-400 font-mono">mkdir: missing directory name</div>;
      } else {
        createFolder(currentDir, dirname);
        outputResult = <div className="text-emerald-400 font-mono">Created directory '{dirname}' in {currentDir}</div>;
      }
    } else if (cmd === 'rm') {
      const filename = args[0];
      if (!filename) {
        outputResult = <div className="text-red-400 font-mono">rm: missing target</div>;
      } else {
        const fullPath = filename.startsWith('/') ? filename : `${currentDir}/${filename}`.replace(/\/+/g, '/');
        deleteFile(fullPath);
        outputResult = <div className="text-amber-400 font-mono">Moved '{filename}' to Trash Bin</div>;
      }
    } else if (cmd === 'echo') {
      const str = args.join(' ');
      outputResult = <div className="text-slate-200 font-mono">{str}</div>;
    } else if (cmd === 'ai') {
      const promptQuery = args.join(' ');
      if (!promptQuery) {
        outputResult = <div className="text-red-400 font-mono">ai: missing query prompt. Usage: ai "your question"</div>;
      } else {
        setIsProcessingAI(true);
        try {
          const sysContextPrompt = buildSystemContextForNova(files, currentDir, 'Keep response concise, direct, technical, and formatted cleanly for a shell terminal output. MULTILINGUAL AUTO-DETECTION MANDATE: Automatically detect the user input language and respond fluently, naturally, and accurately in that exact same language.');
          const aiResponse = await askNovaAI(
            promptQuery,
            sysContextPrompt,
            settings.customApiKey
          );

          const sysActionCtx = {
            files,
            createFile,
            createFolder,
            saveFileContent,
            deleteFile,
            openWindow,
            addNotification,
            updateSettings,
            addEvent
          };

          const { cleanText, results } = parseAndExecuteNovaActions(aiResponse, sysActionCtx);

          setHistory(prev => [
            ...prev,
            {
              command: `ai "${promptQuery}"`,
              output: (
                <div className="space-y-1">
                  <div className="text-emerald-400 text-[11px] font-bold">🤖 Nova AI System Intelligence:</div>
                  <div className="text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">{cleanText}</div>
                  {results.length > 0 && (
                    <div className="pt-1.5 space-y-0.5 border-t border-white/10">
                      {results.map((r, i) => (
                        <div key={i} className="text-emerald-300 font-mono text-[11px]">
                          [+] Action Executed: {r.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ),
              type: 'ai',
              timestamp,
            }
          ]);
        } catch (err: any) {
          setHistory(prev => [
            ...prev,
            {
              command: `ai "${promptQuery}"`,
              output: <div className="text-red-400 font-mono">AI Error: {err.message || 'Failed to connect to Gemini'}</div>,
              type: 'error',
              timestamp,
            }
          ]);
        } finally {
          setIsProcessingAI(false);
        }
        return;
      }
    } else {
      outputResult = <div className="text-red-400 font-mono">command not found: {cmd}. Type 'help' for available commands.</div>;
    }

    if (outputResult) {
      setHistory(prev => [
        ...prev,
        {
          command: rawCmd,
          output: outputResult,
          type: 'output',
          timestamp,
        }
      ]);
    }
  };

  return (
    <div 
      onClick={() => inputRef.current?.focus()}
      className="h-full bg-slate-950 text-slate-100 font-mono p-4 flex flex-col justify-between overflow-y-auto select-text text-xs leading-relaxed"
    >
      <div className="space-y-3">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            {item.type === 'input' ? (
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">root@nova</span>
                <span className="text-slate-500">:</span>
                <span className="text-blue-400 font-semibold">{currentDir}</span>
                <span className="text-slate-400">$</span>
                <span className="text-slate-200 font-medium">{item.command}</span>
              </div>
            ) : (
              <div className="pl-2 border-l border-white/10">{item.output}</div>
            )}
          </div>
        ))}

        {isProcessingAI && (
          <div className="flex items-center gap-2 text-amber-400 animate-pulse font-mono">
            <span>Searching system registries... Querying Gemini AI pipeline...</span>
          </div>
        )}

        {/* Active Command Input Line */}
        <form onSubmit={handleCommand} className="flex items-center gap-2 pt-1">
          <span className="text-emerald-400 font-bold">root@nova</span>
          <span className="text-slate-500">:</span>
          <span className="text-blue-400 font-semibold">{currentDir}</span>
          <span className="text-slate-400">$</span>
          <input 
            ref={inputRef}
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isProcessingAI}
            className="flex-1 bg-transparent border-none outline-none text-slate-100 font-mono text-xs focus:ring-0"
            autoFocus
          />
        </form>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
