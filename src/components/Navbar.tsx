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
    <header id="app-navbar" className="bg-[#4A5D4E] text-[#F1F3F0] border-b border-[#3D4E41] sticky top-0 z-40 shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Airplane Logo & Title */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onReplaySplash}
              title="Klik untuk melihat animasi pembuka pesawat"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#F1F3F0] to-[#E2DDD5] flex items-center justify-center text-[#232D25] shadow-md border border-white/60 hover:scale-105 transition-transform group cursor-pointer"
            >
              <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D3830] fill-[#4A5D4E]/20 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[#F1F3F0] flex items-center gap-1.5 font-sans">
                  SIPEHAL
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#5B6D5F] text-[#F1F3F0] border border-[#7B8C7C]/40 text-[10px] font-mono font-bold">
                  TJQ • SISI UDARA
                </span>
              </div>
              <p className="text-[11px] text-[#E2DDD5] hidden xs:block">
                Sistem Pemantauan Hewan Liar • Bandara H. AS. Hanandjoeddin
              </p>
            </div>
          </div>

          {/* Navigation Role Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-[#3D4E41]/80 p-1 rounded-xl border border-[#5B6D5F]/50">
            {/* Tab 1: Form Petugas */}
            <button
              type="button"
              id="nav-tab-form"
              onClick={() => onSelectTab('form')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'form'
                  ? 'bg-[#F1F3F0] text-[#4A5D4E] shadow-sm'
                  : 'text-[#E2DDD5] hover:text-white hover:bg-[#5B6D5F]/40'
              }`}
            >
              <FileEdit className="w-4 h-4" />
              <span className="hidden sm:inline">Isi Form</span> Petugas
            </button>

            {/* Tab 2: Dashboard Admin */}
            <button
              type="button"
              id="nav-tab-dashboard"
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 relative ${
                activeTab === 'dashboard'
                  ? 'bg-[#F1F3F0] text-[#4A5D4E] shadow-sm'
                  : 'text-[#E2DDD5] hover:text-white hover:bg-[#5B6D5F]/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span> Admin
              {reportCount > 0 && (
                <span className="ml-1 px-2 py-0.2 bg-[#D97706] text-white rounded-full text-[10px] font-mono font-bold">
                  {reportCount}
                </span>
              )}
            </button>
          </nav>

          {/* Online / Offline Sync Badge */}
          <div className="hidden md:flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
              isOnline 
                ? 'bg-[#5B6D5F] text-[#F1F3F0] border-[#7B8C7C]/60' 
                : 'bg-[#92400E]/80 text-[#FEF3C7] border-[#B45309]'
            }`}>
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#A7F3D0] animate-pulse"></span>
                  <span>Real-time Sync</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-[#FDE68A]" />
                  <span>Mode Offline</span>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
