import React from 'react';
import { useSystem } from '../../context/SystemContext';
import { Bell, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications, clearNotifications } = useSystem();

  // Show top 3 most recent notifications from the last 10 seconds
  const recentToasts = notifications.slice(0, 3);

  if (recentToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9990] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none font-sans">
      {recentToasts.map((toast) => (
        <div 
          key={toast.id}
          className="pointer-events-auto bg-slate-900/90 backdrop-blur-2xl border border-blue-500/30 text-white rounded-2xl p-3.5 shadow-2xl flex items-start gap-3 animate-in slide-in-from-top-4 duration-300"
        >
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
            {toast.type === 'error' ? (
              <AlertCircle size={16} className="text-red-400" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <Info size={16} className="text-blue-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-white truncate">{toast.title}</h4>
              <span className="text-[9px] text-slate-400 font-mono shrink-0">{toast.timestamp}</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
