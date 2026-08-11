import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { VirtualFile } from '../../types';
import { parseUploadedFileToText } from '../../utils/fileParser';
import { 
  Folder, 
  FileText, 
  Trash2, 
  ArrowLeft, 
  Plus, 
  FolderPlus, 
  Search, 
  Grid, 
  List, 
  FileCode, 
  HardDrive, 
  Download, 
  Upload, 
  RotateCcw, 
  ExternalLink 
} from 'lucide-react';

export const FileExplorerApp: React.FC<{ windowProps?: Record<string, any> }> = ({ windowProps }) => {
  const { files, createFile, createFolder, deleteFile, restoreFromTrash, emptyTrash, openWindow, addNotification } = useSystem();
  
  const initialPath = windowProps?.initialPath || '/home/user/Desktop';
  const [currentPath, setCurrentPath] = useState<string>(initialPath);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(null);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const isTrashFolder = currentPath === '/home/user/Trash';

  // Get current folder children
  const currentFiles = files.filter(f => {
    if (searchQuery.trim()) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase()) && f.path !== '/';
    }
    return f.parentPath === currentPath;
  });

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    setSelectedFile(null);
  };

  const handleNavigateUp = () => {
    if (currentPath === '/' || currentPath === '') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    const parentPath = '/' + parts.join('/');
    setCurrentPath(parentPath === '' ? '/' : parentPath);
    setSelectedFile(null);
  };

  const handleItemClick = (file: VirtualFile) => {
    setSelectedFile(file);
  };

  const handleItemDoubleClick = (file: VirtualFile) => {
    if (file.type === 'folder') {
      handleNavigate(file.path);
    } else {
      // Open text files in Notepad
      openWindow('notepad', file.name, { filePath: file.path });
    }
  };

  const handleCreateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const name = newItemName.endsWith('.txt') || newItemName.endsWith('.md') || newItemName.endsWith('.sh') 
      ? newItemName.trim() 
      : `${newItemName.trim()}.txt`;
    
    createFile(currentPath, name, '# New Document\n\nCreated in NovaOS File Explorer.');
    setNewItemName('');
    setIsCreatingFile(false);
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    createFolder(currentPath, newItemName.trim());
    setNewItemName('');
    setIsCreatingFolder(false);
  };

  const handleDownloadFile = (file: VirtualFile) => {
    if (!file.content) return;
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    Array.from(uploadedFiles).forEach((file: File) => {
      parseUploadedFileToText(file).then((text) => {
        createFile(currentPath, file.name, text);
        addNotification('File Uploaded', `Uploaded '${file.name}' to ${currentPath}`, 'success');
      });
    });
  };

  // Breadcrumbs
  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <div className="h-full flex flex-col bg-slate-950/70 text-slate-100 font-sans select-none overflow-hidden">
      {/* Navigation & Toolbar */}
      <div className="h-12 border-b border-white/10 bg-white/5 flex items-center justify-between px-3 gap-2">
        <div className="flex items-center gap-1">
          <button 
            onClick={handleNavigateUp}
            disabled={currentPath === '/'}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:pointer-events-none transition-colors text-slate-300"
            title="Go up one directory"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 px-3 py-1 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto max-w-xs md:max-w-md">
            <span 
              onClick={() => handleNavigate('/')} 
              className="hover:text-blue-400 cursor-pointer"
            >
              /
            </span>
            {pathParts.map((part, index) => {
              const fullPath = '/' + pathParts.slice(0, index + 1).join('/');
              return (
                <React.Fragment key={fullPath}>
                  <span className="text-slate-600">/</span>
                  <span 
                    onClick={() => handleNavigate(fullPath)}
                    className="hover:text-blue-400 cursor-pointer whitespace-nowrap"
                  >
                    {part}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 w-32 md:w-44"
            />
          </div>

          {!isTrashFolder ? (
            <>
              <button 
                onClick={() => { setIsCreatingFile(true); setIsCreatingFolder(false); }}
                className="flex items-center gap-1 bg-blue-600/80 hover:bg-blue-600 text-white text-xs px-2.5 py-1 rounded-lg border border-blue-400/30 transition-colors"
                title="New File"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">File</span>
              </button>
              <button 
                onClick={() => { setIsCreatingFolder(true); setIsCreatingFile(false); }}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
                title="New Folder"
              >
                <FolderPlus size={14} />
                <span className="hidden sm:inline">Folder</span>
              </button>
              <label className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-white/10 transition-colors cursor-pointer">
                <Upload size={14} />
                <span className="hidden sm:inline">Upload</span>
                <input type="file" multiple onChange={handleUploadFile} className="hidden" />
              </label>
            </>
          ) : (
            <button 
              onClick={emptyTrash}
              className="flex items-center gap-1 bg-red-600/80 hover:bg-red-600 text-white text-xs px-2.5 py-1 rounded-lg border border-red-400/30 transition-colors"
            >
              <Trash2 size={14} />
              <span>Empty Trash</span>
            </button>
          )}

          <div className="h-4 w-[1px] bg-white/10 mx-1"></div>

          {/* View Toggle */}
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg border border-white/10 ${viewMode === 'grid' ? 'bg-blue-500/30 text-blue-300' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            <Grid size={14} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg border border-white/10 ${viewMode === 'list' ? 'bg-blue-500/30 text-blue-300' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Main Explorer Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-44 border-r border-white/10 bg-white/[0.02] p-3 flex flex-col gap-1 text-xs font-medium text-slate-400">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 px-2">Favorites</div>
          <button 
            onClick={() => handleNavigate('/home/user/Desktop')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left ${currentPath === '/home/user/Desktop' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'hover:bg-white/5 text-slate-300'}`}
          >
            <HardDrive size={14} className="text-blue-400" />
            <span>Desktop</span>
          </button>
          <button 
            onClick={() => handleNavigate('/home/user/Desktop/Project_X')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left ${currentPath === '/home/user/Desktop/Project_X' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'hover:bg-white/5 text-slate-300'}`}
          >
            <Folder size={14} className="text-amber-400" />
            <span>Project_X</span>
          </button>
          <button 
            onClick={() => handleNavigate('/home/user/Documents')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left ${currentPath === '/home/user/Documents' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'hover:bg-white/5 text-slate-300'}`}
          >
            <Folder size={14} className="text-indigo-400" />
            <span>Documents</span>
          </button>
          <button 
            onClick={() => handleNavigate('/home/user/Downloads')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left ${currentPath === '/home/user/Downloads' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'hover:bg-white/5 text-slate-300'}`}
          >
            <Folder size={14} className="text-emerald-400" />
            <span>Downloads</span>
          </button>
          <button 
            onClick={() => handleNavigate('/home/user/Trash')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left ${currentPath === '/home/user/Trash' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'hover:bg-white/5 text-slate-300'}`}
          >
            <Trash2 size={14} className="text-red-400" />
            <span>Trash Bin</span>
          </button>
        </div>

        {/* File Container View */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Inline Item Creation Forms */}
          {(isCreatingFile || isCreatingFolder) && (
            <form 
              onSubmit={isCreatingFile ? handleCreateFileSubmit : handleCreateFolderSubmit}
              className="mb-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex items-center gap-2"
            >
              {isCreatingFile ? <FileText size={18} className="text-blue-400" /> : <Folder size={18} className="text-amber-400" />}
              <input 
                type="text" 
                placeholder={isCreatingFile ? 'Filename (e.g. notes.txt)' : 'Folder name'}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                autoFocus
                className="bg-black/50 border border-white/20 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-blue-400 flex-1"
              />
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded-lg"
              >
                Create
              </button>
              <button 
                type="button" 
                onClick={() => { setIsCreatingFile(false); setIsCreatingFolder(false); }}
                className="bg-white/10 hover:bg-white/20 text-slate-300 text-xs px-3 py-1 rounded-lg"
              >
                Cancel
              </button>
            </form>
          )}

          {currentFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2 py-12">
              <Folder size={40} className="stroke-1 text-slate-600 opacity-50" />
              <span>This folder is empty</span>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {currentFiles.map(file => {
                const isSelected = selectedFile?.id === file.id;
                return (
                  <div 
                    key={file.id}
                    onClick={() => handleItemClick(file)}
                    onDoubleClick={() => handleItemDoubleClick(file)}
                    className={`group relative p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    {/* Quick Delete Hover Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file.path);
                        if (selectedFile?.id === file.id) setSelectedFile(null);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 hover:bg-red-600/90 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title={isTrashFolder ? "Delete Permanently" : "Move to Trash"}
                    >
                      <Trash2 size={13} />
                    </button>

                    <div className="w-12 h-12 flex items-center justify-center mb-2">
                      {file.type === 'folder' ? (
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Folder size={22} className="text-amber-400 fill-amber-400/20" />
                        </div>
                      ) : file.name.endsWith('.sh') ? (
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <FileCode size={22} className="text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl border border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <FileText size={22} className="text-blue-400" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-200 line-clamp-1 break-all w-full">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {file.type === 'folder' ? 'Folder' : `${file.size} B`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 border-b border-white/10 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Size</th>
                    <th className="py-2.5 px-4">Modified</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {currentFiles.map(file => {
                    const isSelected = selectedFile?.id === file.id;
                    return (
                      <tr 
                        key={file.id}
                        onClick={() => handleItemClick(file)}
                        onDoubleClick={() => handleItemDoubleClick(file)}
                        className={`group cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-500/20 text-blue-200' : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <td className="py-2 px-4 flex items-center gap-2">
                          {file.type === 'folder' ? (
                            <Folder size={16} className="text-amber-400" />
                          ) : (
                            <FileText size={16} className="text-blue-400" />
                          )}
                          <span className="font-medium">{file.name}</span>
                        </td>
                        <td className="py-2 px-4 text-slate-400">
                          {file.type === 'folder' ? 'Directory' : 'File'}
                        </td>
                        <td className="py-2 px-4 text-slate-400 font-mono text-[11px]">
                          {file.type === 'folder' ? '-' : `${file.size} B`}
                        </td>
                        <td className="py-2 px-4 text-slate-500 font-mono text-[11px]">
                          {file.updatedAt}
                        </td>
                        <td className="py-2 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFile(file.path);
                              if (selectedFile?.id === file.id) setSelectedFile(null);
                            }}
                            className="p-1 rounded hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title={isTrashFolder ? "Delete Permanently" : "Move to Trash"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Selected Item Detail / Action Status Bar */}
      {selectedFile && (
        <div className="h-10 border-t border-white/10 bg-white/5 flex items-center justify-between px-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300 truncate">
            <span className="font-semibold text-blue-400">{selectedFile.name}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-mono text-[11px]">{selectedFile.path}</span>
          </div>

          <div className="flex items-center gap-2">
            {selectedFile.type === 'file' && (
              <>
                <button 
                  onClick={() => openWindow('notepad', selectedFile.name, { filePath: selectedFile.path })}
                  className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded text-[11px]"
                >
                  <ExternalLink size={12} />
                  <span>Edit in Notepad</span>
                </button>
                <button 
                  onClick={() => handleDownloadFile(selectedFile)}
                  className="p-1 rounded hover:bg-white/10 text-slate-300"
                  title="Download File"
                >
                  <Download size={14} />
                </button>
              </>
            )}

            {isTrashFolder ? (
              <button 
                onClick={() => {
                  restoreFromTrash(selectedFile.path);
                  setSelectedFile(null);
                }}
                className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px]"
              >
                <RotateCcw size={12} />
                <span>Restore</span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  deleteFile(selectedFile.path);
                  setSelectedFile(null);
                }}
                className="p-1.5 rounded hover:bg-red-500/20 text-red-400 flex items-center gap-1 border border-red-500/30"
                title="Move to Trash"
              >
                <Trash2 size={14} />
                <span className="text-[11px] font-medium">Trash</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
