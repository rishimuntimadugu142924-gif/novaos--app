import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { WallpaperPreset } from '../../types';
import { Palette, Volume2, Key, Lock, RotateCcw, ShieldCheck, Check, Sparkles } from 'lucide-react';

export const SettingsApp: React.FC = () => {
  const { settings, updateSettings, addNotification } = useSystem();

  const [customKey, setCustomKey] = useState(settings.customApiKey);
  const [wallpaperInput, setWallpaperInput] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  const presets: { id: WallpaperPreset; name: string; gradient: string }[] = [
    { 
      id: 'indigo-radial', 
      name: 'Indigo Radial (Geometric)', 
      gradient: 'radial-gradient(circle at top left, #1e1b4b 0%, #020617 60%)' 
    },
    { 
      id: 'emerald-nebula', 
      name: 'Emerald Nebula', 
      gradient: 'radial-gradient(circle at top left, #064e3b 0%, #020617 60%)' 
    },
    { 
      id: 'obsidian-crimson', 
      name: 'Obsidian Crimson', 
      gradient: 'radial-gradient(circle at top left, #4c0519 0%, #020617 60%)' 
    },
    { 
      id: 'cyberpunk-cyan', 
      name: 'Cyberpunk Cyan', 
      gradient: 'radial-gradient(circle at top left, #164e63 0%, #020617 60%)' 
    },
    { 
      id: 'solar-gold', 
      name: 'Solar Amber', 
      gradient: 'radial-gradient(circle at top left, #451a03 0%, #020617 60%)' 
    },
  ];

  const handleSaveApiKey = () => {
    updateSettings({ customApiKey: customKey });
    setKeySaved(true);
    addNotification('API Key Updated', 'Custom Gemini API key saved to local workspace.', 'success');
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleResetSystem = () => {
    if (confirm('Are you sure you want to reset all NovaOS local virtual files and settings to defaults?')) {
      localStorage.removeItem('nova_os_files');
      localStorage.removeItem('nova_os_settings');
      window.location.reload();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950/70 text-slate-100 font-sans select-none overflow-y-auto p-5 space-y-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>System Settings</span>
          <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-mono">Preferences</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Configure desktop aesthetics, system sounds, security, and Gemini AI connectivity.</p>
      </div>

      {/* Wallpaper & Background Customization */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
          <Palette size={18} />
          <span>Desktop Wallpaper & Theme</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {presets.map(p => {
            const isSelected = settings.wallpaper === p.id;
            return (
              <div 
                key={p.id}
                onClick={() => updateSettings({ wallpaper: p.id })}
                className={`group cursor-pointer rounded-xl border p-3 flex flex-col justify-between h-24 relative overflow-hidden transition-all ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-500/40' : 'border-white/10 hover:border-white/25'
                }`}
                style={{ background: p.gradient }}
              >
                <div className="text-xs font-semibold text-white z-10">{p.name}</div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white z-10">
                    <Check size={12} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom Image URL */}
        <div className="pt-2 flex gap-2">
          <input 
            type="text" 
            placeholder="Or enter custom image URL (https://...)" 
            value={wallpaperInput}
            onChange={(e) => setWallpaperInput(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-400"
          />
          <button 
            onClick={() => { if (wallpaperInput.trim()) updateSettings({ wallpaper: wallpaperInput.trim() }); }}
            className="bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 rounded-xl border border-white/10"
          >
            Apply URL
          </button>
        </div>
      </div>

      {/* Audio & Sound Effects */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400">
            <Volume2 size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">System Sound Synthesizer</div>
            <div className="text-xs text-slate-400">Play web-synthesized audio feedback for window events & notifications</div>
          </div>
        </div>

        <button 
          onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          className={`w-12 h-6 rounded-full transition-colors relative p-0.5 border border-white/10 ${
            settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-800'
          }`}
        >
          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
            settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>

      {/* Gemini API Key Configuration */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
          <Key size={18} />
          <span>Gemini AI API Key Management</span>
        </div>
        <p className="text-xs text-slate-400">
          NovaOS uses the injected GEMINI_API_KEY environment variable by default. Optionally override with your personal Gemini API key below:
        </p>

        <div className="flex gap-2">
          <input 
            type="password" 
            placeholder="AIzaSy... (Leave empty to use default system key)" 
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-amber-400 font-mono"
          />
          <button 
            onClick={handleSaveApiKey}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-4 py-2 rounded-xl transition-colors font-semibold flex items-center gap-1"
          >
            {keySaved ? <Check size={14} /> : <Sparkles size={14} />}
            <span>{keySaved ? 'Saved' : 'Save Key'}</span>
          </button>
        </div>
      </div>

      {/* System Reset & Data Purge */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center text-red-400">
            <RotateCcw size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Reset System Workspace</div>
            <div className="text-xs text-slate-400">Clear all local storage virtual files and restore initial desktop state</div>
          </div>
        </div>

        <button 
          onClick={handleResetSystem}
          className="bg-red-600/80 hover:bg-red-600 text-white text-xs px-3.5 py-2 rounded-xl border border-red-400/30 font-semibold transition-colors"
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
};
