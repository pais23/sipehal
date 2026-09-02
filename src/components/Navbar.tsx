import React, { useState, useEffect } from 'react';
import { ActiveTab } from '../types';
import { Plane, FileEdit, LayoutDashboard, BookOpen, Wifi, WifiOff, Sparkles, PlaneTakeoff } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  reportCount: number;
  onReplaySplash?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  reportCount,
  onReplaySplash
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header id="app-navbar" className="bg-white/95 backdrop-blur-md text-slate-800 border-b border-slate-200/80 sticky top-0 z-40 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-18">

          {/* WILONIA Brand & Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <button
              type="button"
              onClick={onReplaySplash}
              title="Klik untuk melihat animasi pembuka WILONIA"
              className="h-9 sm:h-12 flex items-center justify-center hover:scale-105 transition-transform group cursor-pointer focus:outline-hidden shrink-0"
            >
              <img
                src="/logo-wilonia.png"
                alt="Logo WILONIA"
                className="h-full w-auto max-h-8 sm:max-h-11 object-contain"
              />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="inline-block px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80 text-[9px] sm:text-[10px] font-mono font-bold shrink-0">
                  TJQ • WIKT
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 hidden md:block truncate">
                Wildlife Logbook Inspection InJourney Airports • Bandara H. AS. Hanandjoeddin
              </p>
            </div>
          </div>

          {/* Navigation Role Tabs & Status */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Navigation Role Tabs */}
            <nav className="flex items-center bg-slate-100/90 p-1 rounded-xl sm:rounded-2xl border border-slate-200/80">
              {/* Tab 1: Form Petugas */}
              <button
                type="button"
                id="nav-tab-form"
                onClick={() => onSelectTab('form')}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <FileEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden xs:inline">Form</span> Petugas
              </button>

              {/* Tab 2: Dashboard Admin */}
              <button
                type="button"
                id="nav-tab-dashboard"
                onClick={() => onSelectTab('dashboard')}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
                  activeTab === 'dashboard'
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Dashboard</span>
                {reportCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    activeTab === 'dashboard' ? 'bg-[#0284C7] text-white' : 'bg-slate-300 text-slate-800'
                  }`}>
                    {reportCount}
                  </span>
                )}
              </button>
            </nav>

            {/* Online / Offline Sync Badge */}
            <div className="hidden lg:flex items-center">
              <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {isOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px]">Real-time Sync</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-[11px]">Mode Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
