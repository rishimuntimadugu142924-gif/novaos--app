import React, { useState, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Save, FileText, Sparkles, FolderOpen, RotateCcw, Check, Copy } from 'lucide-react';
import { askNovaAI } from '../../services/geminiService';
import { sanitizeTextContent } from '../../utils/fileParser';

export const NotepadApp: React.FC<{ windowProps?: Record<string, any> }> = ({ windowProps }) => {
  const { files, saveFileContent, createFile, settings } = useSystem();

  const filePath = windowProps?.filePath || '/home/user/Desktop/Welcome_to_NovaOS.txt';
  const currentFile = files.find(f => f.path === filePath);

  const [content, setContent] = useState('');
  const [filename, setFilename] = useState(currentFile?.name || 'Untitled.txt');
  const [isSaved, setIsSaved] = useState(true);
  const [isAIWorking, setIsAIWorking] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentFile) {
      const raw = currentFile.content || '';
      const clean = sanitizeTextContent(raw, currentFile.name);
      setContent(clean);
      setFilename(currentFile.name);
      setIsSaved(true);
    }
  }, [filePath, currentFile?.content, currentFile?.name]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    if (currentFile) {
      saveFileContent(currentFile.path, content);
    } else {
      createFile('/home/user/Desktop', filename, content);
    }
    setIsSaved(true);
  };

  const handleAiAction = async (instruction: string) => {
    if (!content.trim()) return;
    setIsAIWorking(true);
    try {
      const response = await askNovaAI(
        `Transform/process this text according to instruction: "${instruction}". Text content: \n\n${content}`,
        'You are Nova, the text editor writing assistant in NovaOS. MULTILINGUAL AUTO-DETECTION MANDATE: Automatically detect the language of the text and instruction, and respond fluently in that exact same language. Return only the output text result.',
        settings.customApiKey
      );
      setContent(response);
      setIsSaved(false);
      setShowAiModal(false);
    } catch (err: any) {
      alert(`AI Assistant Error: ${err.message}`);
    } finally {
      setIsAIWorking(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Metrics
  const lineCount = content.split('\n').length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Editor Top Control Bar */}
      <div className="h-11 border-b border-white/10 bg-white/5 flex items-center justify-between px-3 gap-2">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blue-400" />
          <input 
            type="text" 
            value={filename}
            onChange={(e) => { setFilename(e.target.value); setIsSaved(false); }}
            className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-blue-400 text-xs font-semibold text-slate-200 outline-none px-1 py-0.5"
          />
          {!isSaved && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">
              Unsaved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAiModal(!showAiModal)}
            className="flex items-center gap-1 bg-gradient-to-r from-blue-600/80 to-indigo-600/80 hover:from-blue-500 hover:to-indigo-500 text-white text-xs px-2.5 py-1 rounded-lg border border-blue-400/30 transition-all shadow-md"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span className="hidden sm:inline">AI Helper</span>
          </button>

          <button 
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            title="Copy Text"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>

          <button 
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded-lg transition-colors font-medium shadow-md shadow-blue-600/20"
          >
            <Save size={14} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* AI Assistant Overlay Modal */}
      {showAiModal && (
        <div className="bg-slate-900/90 border-b border-white/10 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-blue-400">
            <span className="flex items-center gap-1"><Sparkles size={14} /> Nova AI Text Enhancer</span>
            <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleAiAction('Summarize this document clearly into key bullet points.')}
              disabled={isAIWorking}
              className="bg-white/10 hover:bg-blue-500/30 border border-white/10 text-slate-200 px-2.5 py-1 rounded-lg"
            >
              Summarize
            </button>
            <button 
              onClick={() => handleAiAction('Fix grammar, improve tone, and enhance clarity.')}
              disabled={isAIWorking}
              className="bg-white/10 hover:bg-blue-500/30 border border-white/10 text-slate-200 px-2.5 py-1 rounded-lg"
            >
              Fix Grammar & Polish
            </button>
            <button 
              onClick={() => handleAiAction('Format this content as clean Markdown or code.')}
              disabled={isAIWorking}
              className="bg-white/10 hover:bg-blue-500/30 border border-white/10 text-slate-200 px-2.5 py-1 rounded-lg"
            >
              Format Code
            </button>
          </div>
          {isAIWorking && (
            <div className="text-amber-400 animate-pulse text-[11px] font-mono">
              Processing document with Gemini 3.6 Flash...
            </div>
          )}
        </div>
      )}

      {/* Text Area & Line Numbers */}
      <div className="flex-1 flex overflow-hidden bg-slate-950 font-mono text-xs">
        {/* Line Numbers */}
        <div className="w-10 bg-black/40 text-slate-600 border-r border-white/5 py-3 text-right pr-2 select-none">
          {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
            <div key={i} className="h-5">{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea 
          value={content}
          onChange={handleContentChange}
          placeholder="Start typing or loading a file..."
          className="flex-1 bg-transparent p-3 text-slate-200 leading-5 resize-none outline-none border-none focus:ring-0 selection:bg-blue-500/30"
          spellCheck={false}
        />
      </div>

      {/* Footer Metrics */}
      <div className="h-7 border-t border-white/10 bg-white/5 flex items-center justify-between px-3 text-[10px] text-slate-400 font-mono">
        <div className="flex gap-3">
          <span>Lines: {lineCount}</span>
          <span>Words: {wordCount}</span>
          <span>Chars: {charCount}</span>
        </div>
        <div className="text-slate-500">
          {currentFile ? currentFile.path : 'Unsaved Local File'}
        </div>
      </div>
    </div>
  );
};
