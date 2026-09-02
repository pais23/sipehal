import React, { useState, useEffect } from 'react';
import { WildlifeReport, ActiveTab } from './types';
import { INITIAL_REPORTS, KNOWN_SPECIES } from './data/initialData';
import { Navbar } from './components/Navbar';
import { ReportForm } from './components/ReportForm';
import { AdminDashboard } from './components/AdminDashboard';
import { LogBookPrintLayout } from './components/LogBookPrintLayout';
import { SplashScreen } from './components/SplashScreen';
import { 
  FileText, ShieldCheck, CheckCircle2, 
  HelpCircle, Sparkles, BookOpen, AlertCircle, Plane
} from 'lucide-react';

const STORAGE_KEY = 'airport_wildlife_reports_db';
const SPECIES_STORAGE_KEY = 'airport_wildlife_species_db';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('form');
  const [reports, setReports] = useState<WildlifeReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load local reports:', e);
    }
    return INITIAL_REPORTS;
  });

  const [availableSpecies, setAvailableSpecies] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SPECIES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return KNOWN_SPECIES;
  });

  const [selectedReportForDetail, setSelectedReportForDetail] = useState<WildlifeReport | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch (e) {
      console.error('Failed to save reports:', e);
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem(SPECIES_STORAGE_KEY, JSON.stringify(availableSpecies));
    } catch {
      // ignore
    }
  }, [availableSpecies]);

  // Handle new report submission from Field Officer
  const handleAddNewReport = (newReport: WildlifeReport) => {
    setReports((prev) => [newReport, ...prev]);
    setToastMessage(`Laporan ${newReport.id} berhasil dicatat per shift ${newReport.shift}!`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Add newly discovered species to autocomplete catalog
  const handleAddNewSpecies = (newSpecies: string) => {
    if (!availableSpecies.includes(newSpecies)) {
      setAvailableSpecies((prev) => [newSpecies, ...prev]);
    }
  };

  // View Logbook detail
  const handleViewReportDetail = (report: WildlifeReport) => {
    setSelectedReportForDetail(report);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#0284C7] selection:text-white">
      
      {/* Animated Airplane Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* Header Navigation */}
      <Navbar 
        activeTab={activeTab} 
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedReportForDetail(null);
        }}
        reportCount={reports.length}
        onReplaySplash={() => setShowSplash(true)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700/60 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#38BDF8] shrink-0" />
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Main Content Area (Mobile-friendly responsive padding) */}
      <main className="flex-1 p-2 sm:p-5 lg:p-7 max-w-7xl w-full mx-auto">
        
        {/* Detail Modal / Fullscreen Print View if a report is selected */}
        {selectedReportForDetail ? (
          <div className="space-y-4">
            <LogBookPrintLayout 
              report={selectedReportForDetail} 
              onBack={() => setSelectedReportForDetail(null)}
            />
          </div>
        ) : (
          <>
            {/* View 1: Form Petugas (Responden) */}
            {activeTab === 'form' && (
              <ReportForm
                onSubmitReport={handleAddNewReport}
                availableSpecies={availableSpecies}
                onAddNewSpecies={handleAddNewSpecies}
              />
            )}

            {/* View 2: Dashboard Admin / Supervisor */}
            {activeTab === 'dashboard' && (
              <AdminDashboard
                reports={reports}
                onViewReportDetail={handleViewReportDetail}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer id="app-footer" className="bg-[#0B1E38] border-t border-[#1A3358] text-[#94A3B8] py-5 px-4 text-center text-xs print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img src="/logo-wilonia.png" alt="WILONIA" className="h-7 w-auto object-contain drop-shadow-md" />
            <span className="font-semibold text-white">
              WILONIA • Wildlife Logbook Inspection InJourney Airports
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Bandar Udara H. AS. Hanandjoeddin • Unit Wildlife Hazard Management
          </p>
        </div>
      </footer>

    </div>
  );
}
