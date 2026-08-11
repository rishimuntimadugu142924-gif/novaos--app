import React, { useState, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Bell, Wifi, Volume2, ShieldCheck, Battery, Calendar as CalendarIcon, CheckCheck, Trash2 } from 'lucide-react';

export const SystemTray: React.FC = () => {
  const { notifications, clearNotifications, toggleWidgets, isWidgetsOpen } = useSystem();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [showNotificationFlyout, setShowNotificationFlyout] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative flex items-center gap-3 text-slate-300">
      {/* Notifications Toggle */}
      <button 
        onClick={() => setShowNotificationFlyout(!showNotificationFlyout)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 transition-colors"
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Battery & Network Status Indicator */}
      <div className="hidden sm:flex flex-col items-end text-right">
        <div className="text-[10px] font-bold text-white leading-none">100%</div>
        <div className="text-[8px] text-emerald-400 font-semibold uppercase">Charging</div>
      </div>
      <div className="w-5 h-5 flex items-center justify-center border border-white/30 rounded-full bg-white/5">
        <div className="w-2 h-2 bg-emerald-400 rounded-full" />
      </div>

      {/* Clock & Calendar Widget Button */}
      <button 
        onClick={toggleWidgets}
        className={`flex flex-col items-end px-2.5 py-1 rounded-xl border transition-colors cursor-pointer ${
          isWidgetsOpen ? 'bg-blue-500/20 border-blue-400/40 text-blue-200' : 'bg-white/5 border-white/5 hover:bg-white/10'
        }`}
      >
        <span className="text-xs font-bold text-white leading-none font-mono">{timeStr}</span>
        <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">{dateStr}</span>
      </button>

      {/* Notifications Flyout Box */}
      {showNotificationFlyout && (
        <div className="absolute bottom-16 right-0 w-80 bg-slate-900/95 backdrop-blur-3xl border border-white/15 rounded-2xl p-4 shadow-2xl z-[999] space-y-3 font-sans text-slate-100">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Bell size={14} className="text-blue-400" /> Notifications
            </span>
            <button 
              onClick={clearNotifications}
              className="text-[10px] text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Trash2 size={12} /> Clear
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">No new notifications</div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs space-y-0.5">
                  <div className="font-semibold text-blue-300 flex justify-between">
                    <span>{notif.title}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{notif.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
