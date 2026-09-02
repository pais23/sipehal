import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Sparkles, ChevronRight, Plane, ShieldCheck, MapPin } from 'lucide-react';
import { AIRPORT_INFO } from '../data/initialData';

interface SplashScreenProps {
  onFinish?: () => void;
  forceShow?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Inisialisasi Sistem Runway & Grid...');

  useEffect(() => {
    // Smooth progress increment from 0 to 100% over 2.8s
    const startTime = Date.now();
    const duration = 2800; // 2.8 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 30) {
        setStatusText('Inisialisasi Sistem Runway & Grid Bandara...');
      } else if (pct < 65) {
        setStatusText('Memuat Matriks Grid 8x4 Wilayah Operasi TJQ...');
      } else if (pct < 90) {
        setStatusText('Sinkronisasi Data Pemantauan Sisi Udara (Airside)...');
      } else {
        setStatusText('Sistem Siap Digunakan');
      }

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          handleClose();
        }, 400);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    if (onFinish) {
      setTimeout(onFinish, 400);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="app-splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-[#0B1526] via-[#0F1E36] to-[#070D18] text-white overflow-hidden select-none"
        >
          {/* 1. ATMOSPHERIC BACKGROUND */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Soft Ambient Radial Lights */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-sky-500/15 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[700px] h-[220px] bg-blue-600/10 rounded-full blur-3xl" />

            {/* Grid Matrix pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px]" />
          </div>

          {/* 2. TOP HEADER HUD */}
          <div className="relative z-20 px-4 sm:px-8 pt-6 sm:pt-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-sky-400 shadow-md">
                <Compass className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-widest text-white uppercase font-mono">
                    TJQ / WIKT
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-950/90 border border-sky-500/50 text-[10px] font-mono text-sky-300 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                    AIRSIDE ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium hidden sm:block">
                  {AIRPORT_INFO.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs font-mono text-slate-300">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">SAFETY & WILDLIFE CONTROL</span>
              <span className="sm:hidden">WHMS TJQ</span>
            </div>
          </div>

          {/* 3. CENTER CONTENT: BRAND TITLE & AIRPLANE PROGRESS BAR */}
          <div className="relative z-20 px-4 max-w-2xl mx-auto w-full flex flex-col items-center text-center my-auto">

            {/* Luminous Clean White Logo Card (Ensures All Multi-Colors & Dark Subtitle Pop 100%) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 max-w-xs sm:max-w-md w-full flex items-center justify-center p-4 sm:p-5 bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.4)] border border-white/90"
            >
              <img
                src="/logo-wilonia.png"
                alt="WILONIA Logo"
                className="w-full max-h-16 sm:max-h-22 object-contain"
              />
            </motion.div>

            {/* Main Airport Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-2xl font-black tracking-tight text-white font-sans"
            >
              BANDAR UDARA H. AS. HANANDJOEDDIN
            </motion.h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              Wildlife Logbook Inspection InJourney Airports
            </p>

            {/* ==============================================================
                AIRPLANE FOLLOWING PROGRESS BAR (KONSEP PESAWAT TERBANG KECIL)
                ============================================================== */}
            <div className="w-full mt-8 sm:mt-10 px-2 sm:px-4">

              {/* Waypoint Markers Above Flight Line */}
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2 px-1">
                <span className="flex items-center gap-1 font-bold text-sky-300">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  RWY 18 (START)
                </span>
                <span className="text-slate-500">CLIMB OUT • 180°</span>
                <span className="flex items-center gap-1 font-bold text-emerald-300">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  AIRBORNE TJQ
                </span>
              </div>

              {/* Progress Track Corridor */}
              <div className="relative w-full h-12 flex items-center">

                {/* Background dashed airway track */}
                <div className="w-full bg-slate-900 h-3.5 rounded-full border border-slate-700/80 overflow-hidden relative shadow-inner">
                  {/* Dashed runway center markings */}
                  <div className="absolute inset-0 flex items-center justify-between px-2 opacity-30">
                    {[...Array(12)].map((_, i) => (
                      <span key={i} className="w-3 h-0.5 bg-white/70 rounded-xs" />
                    ))}
                  </div>

                  {/* Dynamic Progress Bar (Contrail trailing behind the plane) */}
                  <div
                    className="h-full bg-gradient-to-r from-sky-600 via-sky-400 to-emerald-400 rounded-full transition-all duration-75 relative shadow-[0_0_14px_rgba(56,189,248,0.6)]"
                    style={{ width: `${progress}%` }}
                  >
                    {/* Glowing highlight at the head of the trail */}
                    <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/90 blur-[1px] rounded-r-full" />
                  </div>
                </div>

                {/* ==========================================================
                    CLEAR AIRPLANE ICON (FLIES AT THE TIP OF THE PROGRESS BAR)
                    ========================================================== */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-75 flex items-center justify-center z-30"
                  style={{ left: `${Math.max(4, Math.min(96, progress))}%` }}
                >
                  {/* Jet Engine Contrail / Vapor Trail behind airplane */}
                  <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex items-center">
                    <div className="w-8 h-2 bg-gradient-to-l from-emerald-400 via-sky-400/80 to-transparent rounded-l-full blur-[1px]" />
                    <div className="w-3 h-3 -ml-1 rounded-full bg-white/70 blur-[1px] animate-ping" />
                  </div>

                  {/* Distinct High-Clarity Commercial Airplane (Side/3D Isometric Profile Facing Right) */}
                  <div className="relative w-12 h-10 flex items-center justify-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                    <svg
                      viewBox="0 0 64 36"
                      className="w-full h-full"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Vertical Tail Fin (Stabilizer) */}
                      <path
                        d="M 6 18 L 14 3 L 20 3 L 17 18 Z"
                        fill="#0284C7"
                        stroke="#0369A1"
                        strokeWidth="1"
                      />
                      {/* Tail Fin Accent Stripe */}
                      <path d="M 12 6 L 18 6 L 17 10 L 11 10 Z" fill="#F59E0B" />

                      {/* Rear Horizontal Stabilizer (Far Wing) */}
                      <path d="M 10 17 L 4 14 L 8 14 L 14 17 Z" fill="#64748B" />

                      {/* Main Fuselage Body (Aerodynamic Airplane Silhouette) */}
                      <path
                        d="M 6 18 C 6 14, 16 12, 42 12 C 54 12, 62 16, 62 18 C 62 20, 54 24, 42 24 C 16 24, 6 22, 6 18 Z"
                        fill="#FFFFFF"
                        stroke="#0F172A"
                        strokeWidth="1.2"
                      />

                      {/* Aerodynamic Nose Cone */}
                      <path
                        d="M 54 14 C 58 15, 62 16.5, 62 18 C 62 19.5, 58 21, 54 22 Z"
                        fill="#E2E8F0"
                      />

                      {/* Cockpit Windshield (Glass) */}
                      <path
                        d="M 50 14 C 54 14, 57 15.5, 58 17 L 52 17 Z"
                        fill="#0284C7"
                        stroke="#0F172A"
                        strokeWidth="0.8"
                      />

                      {/* Livery Speed Stripe (Airline Green & Gold) */}
                      <path d="M 16 19 L 52 19 L 50 21 L 14 21 Z" fill="#0284C7" />
                      <path d="M 14 21 L 48 21 L 46 22 L 12 22 Z" fill="#F59E0B" />

                      {/* Passenger Cabin Windows */}
                      <circle cx="26" cy="16" r="1" fill="#1E293B" />
                      <circle cx="30" cy="16" r="1" fill="#1E293B" />
                      <circle cx="34" cy="16" r="1" fill="#1E293B" />
                      <circle cx="38" cy="16" r="1" fill="#1E293B" />
                      <circle cx="42" cy="16" r="1" fill="#1E293B" />
                      <circle cx="46" cy="16" r="1" fill="#1E293B" />

                      {/* Main Swept Wing (Foreground) */}
                      <path
                        d="M 30 18 L 18 31 L 24 32 L 40 21 Z"
                        fill="#E2E8F0"
                        stroke="#1E293B"
                        strokeWidth="1"
                      />
                      {/* Wingtip Winglet */}
                      <polygon points="18,31 16,27 19,27 20,32" fill="#0284C7" />

                      {/* Jet Engine Turbofan Mounted Under Wing */}
                      <rect x="26" y="24" width="10" height="4" rx="2" fill="#334155" stroke="#0F172A" strokeWidth="0.8" />
                      <circle cx="36" cy="26" r="1.5" fill="#38BDF8" />
                      {/* Engine Intake Glow */}
                      <line x1="26" y1="24" x2="26" y2="28" stroke="#F59E0B" strokeWidth="1" />
                    </svg>
                  </div>
                </div>

              </div>

              {/* Status and Percentage Display */}
              <div className="flex justify-between items-center text-xs font-mono mt-2">
                <span className="text-slate-400 flex items-center gap-1.5 text-[11px] sm:text-xs truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shrink-0"></span>
                  <span className="truncate">{statusText}</span>
                </span>
                <span className="font-black text-sky-400 text-sm shrink-0 ml-2">
                  {progress}%
                </span>
              </div>

            </div>

            {/* Skip Button */}
            <button
              type="button"
              id="btn-skip-splash"
              onClick={handleClose}
              className="mt-6 sm:mt-8 text-xs font-bold text-white px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-2 shadow-lg backdrop-blur-xs cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Buka Log Book</span>
              <ChevronRight className="w-4 h-4 text-sky-300" />
            </button>

          </div>

          {/* 4. FOOTER NOTE */}
          <div className="relative z-20 pb-4 text-center text-[10px] text-slate-500 font-mono">
            Appendix 3.a • Sisi Udara Bandar Udara H. AS. Hanandjoeddin (TJQ)
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};
