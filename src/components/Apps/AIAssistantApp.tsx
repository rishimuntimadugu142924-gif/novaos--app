import React, { useState, useRef, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { 
  Bot, Send, Sparkles, User, Terminal, Folder, FileText, CheckCircle2, 
  Copy, AlertCircle, Image, Plus, Upload, Paperclip, X, File, FolderPlus 
} from 'lucide-react';
import { askNovaAI } from '../../services/geminiService';
import { buildSystemContextForNova, parseAndExecuteNovaActions, ExecutedActionResult } from '../../services/novaActionExecutor';
import { parseUploadedFileToText } from '../../utils/fileParser';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionResults?: ExecutedActionResult[];
  attachments?: string[];
}

export const AIAssistantApp: React.FC = () => {
  const { 
    files, 
    createFile, 
    createFolder, 
    saveFileContent,
    deleteFile,
    openWindow, 
    addNotification,
    settings,
    updateSettings,
    addEvent
  } = useSystem();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Good day, Administrator. I am Nova, your system intelligence with direct workspace access. You can upload local files, attach workspace documents using the (+) button, or ask me to perform system operations.',
      timestamp: '14:48',
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [attachedPaths, setAttachedPaths] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFilePickerModal, setShowFilePickerModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle uploading files from computer into NovaOS & attaching
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    Array.from(uploadedFiles).forEach((file: File) => {
      parseUploadedFileToText(file).then((content) => {
        const targetPath = `/home/user/Desktop/${file.name}`;
        createFile('/home/user/Desktop', file.name, content);
        addNotification('File Uploaded', `Added '${file.name}' to Desktop and attached to Nova.`, 'success');
        setAttachedPaths(prev => prev.includes(targetPath) ? prev : [...prev, targetPath]);
      });
    });

    setShowAddMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle creating a quick new empty file
  const handleCreateQuickFile = () => {
    const fileName = prompt('Enter name for new file on Desktop:', 'new_document.txt');
    if (!fileName || !fileName.trim()) return;
    const finalName = fileName.trim();
    const targetPath = `/home/user/Desktop/${finalName}`;
    createFile('/home/user/Desktop', finalName, '');
    addNotification('File Created', `Created '${finalName}' on Desktop`, 'success');
    setAttachedPaths(prev => prev.includes(targetPath) ? prev : [...prev, targetPath]);
    setShowAddMenu(false);
  };

  const removeAttachment = (pathToRemove: string) => {
    setAttachedPaths(prev => prev.filter(p => p !== pathToRemove));
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = inputVal.trim();
    if ((!prompt && attachedPaths.length === 0) || isThinking) return;

    let fullPromptText = prompt;
    if (attachedPaths.length > 0) {
      fullPromptText = `[ATTACHED FILES: ${attachedPaths.join(', ')}]\n${prompt || 'Please analyze these attached files.'}`;
    }

    const userMsg: ChatMessage = {
      id: `msg-usr-${Date.now()}`,
      sender: 'user',
      text: prompt || `[Attached ${attachedPaths.length} file(s)]`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachedPaths.length > 0 ? [...attachedPaths] : undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    const currentAttachments = [...attachedPaths];
    setAttachedPaths([]);
    setIsThinking(true);

    try {
      const systemContext = buildSystemContextForNova(files, '/home/user');
      const aiText = await askNovaAI(fullPromptText, systemContext, settings.customApiKey);

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

      const { cleanText, results } = parseAndExecuteNovaActions(aiText, sysActionCtx);

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: cleanText || 'Command processed successfully.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionResults: results.length > 0 ? results : undefined,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ Nova Intelligence Error: ${err.message || 'Failed to connect to Gemini API. Check your API Key in Settings.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleChipClick = (presetPrompt: string) => {
    setInputVal(presetPrompt);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/60 backdrop-blur-2xl text-slate-100 font-sans select-none overflow-hidden relative">
      {/* Hidden File Input for Local File Uploads */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />

      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-5 h-5 bg-white rounded-sm rotate-45 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
            </div>
          </div>
          <div>
            <div className="font-bold text-white tracking-tight flex items-center gap-2">
              <span>Nova Assistant</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded font-mono">v4.2</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              <span>Online • Gemini AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map(msg => (
          <div 
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-medium">
              {msg.sender === 'ai' ? (
                <>
                  <Sparkles size={12} className="text-blue-400" />
                  <span className="text-blue-400 font-bold">Nova AI</span>
                </>
              ) : (
                <>
                  <User size={12} className="text-slate-300" />
                  <span>Administrator</span>
                </>
              )}
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div 
              className={`p-3.5 text-xs leading-relaxed max-w-[88%] shadow-lg ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none'
                  : 'bg-white/5 border border-white/10 rounded-2xl rounded-tl-none text-slate-200'
              }`}
            >
              {/* Render User Attached Badges if present */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mb-2 pb-2 border-b border-white/20 flex flex-wrap gap-1">
                  {msg.attachments.map((att, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-black/30 text-white/90 text-[10px] px-2 py-0.5 rounded-md font-mono border border-white/10">
                      <File size={10} className="text-amber-300" />
                      {att.split('/').pop()}
                    </span>
                  ))}
                </div>
              )}

              <div className="whitespace-pre-wrap">{msg.text}</div>

              {msg.actionResults && msg.actionResults.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> System Actions Executed:
                  </div>
                  <div className="space-y-1">
                    {msg.actionResults.map((res, idx) => (
                      <div 
                        key={idx} 
                        className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center justify-between font-mono ${
                          res.success 
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
                            : 'bg-red-950/40 border-red-500/30 text-red-200'
                        }`}
                      >
                        <span>{res.description}</span>
                        {res.path && (
                          <button 
                            onClick={() => openWindow('notepad', res.path?.split('/').pop() || 'File', { filePath: res.path })}
                            className="text-[10px] bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded text-white font-sans ml-2 transition-colors"
                          >
                            View
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex flex-col items-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-300 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="text-slate-400 text-[11px] ml-1">Analyzing workspace & executing system actions...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips */}
      <div className="px-4 py-2 border-t border-white/5 flex gap-2 overflow-x-auto text-[11px] no-scrollbar">
        <button 
          onClick={() => handleChipClick('Draft a project summary and ask me if I want to save it as a file')}
          className="whitespace-nowrap bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors shrink-0"
        >
          <FileText size={12} className="text-blue-400" />
          <span>Draft Summary</span>
        </button>
        <button 
          onClick={() => handleChipClick('List all files on my Desktop and summarize what is in my workspace')}
          className="whitespace-nowrap bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors shrink-0"
        >
          <Folder size={12} className="text-emerald-400" />
          <span>Scan Workspace</span>
        </button>
        <button 
          onClick={() => handleChipClick('Draft a professional email proposing a project update')}
          className="whitespace-nowrap bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors shrink-0"
        >
          <Sparkles size={12} className="text-purple-400" />
          <span>Draft Email</span>
        </button>
        <button 
          onClick={() => handleChipClick('Write a Python script for fibonacci numbers and ask before saving')}
          className="whitespace-nowrap bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors shrink-0"
        >
          <Terminal size={12} className="text-teal-400" />
          <span>Write Code Script</span>
        </button>
        <button 
          onClick={() => handleChipClick('Change the wallpaper to Cyberpunk Cyan')}
          className="whitespace-nowrap bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors shrink-0"
        >
          <Image size={12} className="text-amber-400" />
          <span>Change Theme Wallpaper</span>
        </button>
      </div>

      {/* Attached Files Bar */}
      {attachedPaths.length > 0 && (
        <div className="px-3 py-1.5 bg-black/40 border-t border-white/10 flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
            <Paperclip size={11} className="text-blue-400" /> Attached ({attachedPaths.length}):
          </span>
          {attachedPaths.map(path => (
            <div key={path} className="inline-flex items-center gap-1.5 bg-blue-950/60 border border-blue-500/30 text-blue-200 text-[11px] px-2 py-0.5 rounded-lg font-mono">
              <File size={11} className="text-blue-400" />
              <span>{path.split('/').pop()}</span>
              <button 
                type="button"
                onClick={() => removeAttachment(path)}
                className="hover:text-red-400 transition-colors ml-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Form with + Button */}
      <div className="p-3 border-t border-white/10 bg-white/5 relative">
        {/* + Action Popover Menu */}
        {showAddMenu && (
          <div className="absolute bottom-16 left-3 w-60 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-2xl z-50 text-xs font-sans space-y-1 animate-in fade-in duration-150">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 py-1">
              Add Files to Nova
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddMenu(false);
                fileInputRef.current?.click();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/10 text-left text-slate-200 transition-colors"
            >
              <Upload size={15} className="text-blue-400" />
              <div>
                <div className="font-semibold">Upload Local File</div>
                <div className="text-[10px] text-slate-400">Import file from computer</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAddMenu(false);
                setShowFilePickerModal(true);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/10 text-left text-slate-200 transition-colors"
            >
              <Paperclip size={15} className="text-amber-400" />
              <div>
                <div className="font-semibold">Attach Workspace File</div>
                <div className="text-[10px] text-slate-400">Select file from NovaOS</div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleCreateQuickFile}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/10 text-left text-slate-200 transition-colors"
            >
              <FolderPlus size={15} className="text-emerald-400" />
              <div>
                <div className="font-semibold">Create New File</div>
                <div className="text-[10px] text-slate-400">Create blank file on Desktop</div>
              </div>
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* + Button */}
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              showAddMenu 
                ? 'bg-blue-600 text-white border border-blue-400 rotate-45' 
                : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10'
            }`}
            title="Add or Attach File"
          >
            <Plus size={18} />
          </button>

          <input 
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={attachedPaths.length > 0 ? "Ask Nova about attached files..." : "Ask Nova anything or instruct system..."}
            disabled={isThinking}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
          />

          <button 
            type="submit"
            disabled={(!inputVal.trim() && attachedPaths.length === 0) || isThinking}
            className="w-9 h-9 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shadow-md shadow-blue-600/30"
          >
            <Send size={15} />
          </button>
        </form>
      </div>

      {/* Modal for selecting workspace file to attach */}
      {showFilePickerModal && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-white/15 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Paperclip size={14} className="text-amber-400" /> Select Workspace File
              </h4>
              <button 
                onClick={() => setShowFilePickerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {files.filter(f => f.type === 'file').map(f => {
                const isAttached = attachedPaths.includes(f.path);
                return (
                  <div 
                    key={f.id}
                    onClick={() => {
                      if (isAttached) {
                        removeAttachment(f.path);
                      } else {
                        setAttachedPaths(prev => [...prev, f.path]);
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono cursor-pointer transition-colors ${
                      isAttached 
                        ? 'bg-blue-600/30 border border-blue-500/50 text-white' 
                        : 'bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <File size={13} className="text-blue-400 shrink-0" />
                      <span className="truncate">{f.path}</span>
                    </div>
                    {isAttached && <CheckCircle2 size={13} className="text-emerald-400 shrink-0 ml-2" />}
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => setShowFilePickerModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded-xl font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
