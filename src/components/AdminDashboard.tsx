import React, { useState, useMemo } from 'react';
import { WildlifeReport, HeatmapData } from '../types';
import { AirportGridMap } from './AirportGridMap';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';
import { 
  Search, Filter, Download, Eye, Calendar, 
  MapPin, Flame, BarChart3, PieChart, RefreshCw, 
  FileSpreadsheet, FileText, CheckCircle2, ChevronRight,
  TrendingUp, Users, ShieldAlert, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';

interface AdminDashboardProps {
  reports: WildlifeReport[];
  onViewReportDetail: (report: WildlifeReport) => void;
  onDeleteReport?: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reports,
  onViewReportDetail,
  onDeleteReport
}) => {
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [filterSpecies, setFilterSpecies] = useState<string>('all');
  const [filterGrid, setFilterGrid] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  
  // View Toggle: Table vs Heatmap vs Trend Analytics
  const [activeView, setActiveView] = useState<'table' | 'heatmap' | 'charts'>('table');

  // Heatmap Aggregation Data Calculation
  const heatmapData = useMemo<HeatmapData>(() => {
    const data: HeatmapData = {};

    reports.forEach((rep) => {
      rep.temuan.forEach((f) => {
        if (!f.lokasiGrid) return;
        const grid = f.lokasiGrid.toUpperCase();
        if (!data[grid]) {
          data[grid] = {
            count: 0,
            findingsCount: 0,
            species: {}
          };
        }
        data[grid].count += 1;
        data[grid].findingsCount += f.jumlah || 1;
        data[grid].species[f.namaSpesies] = (data[grid].species[f.namaSpesies] || 0) + (f.jumlah || 1);
      });
    });

    return data;
  }, [reports]);

  // Statistics Summary
  const stats = useMemo(() => {
    const totalReports = reports.length;
    let totalAnimalsCount = 0;
    const speciesCounter: { [key: string]: number } = {};
    const gridCounter: { [key: string]: number } = {};

    reports.forEach((r) => {
      r.temuan.forEach((f) => {
        const qty = f.jumlah || 1;
        totalAnimalsCount += qty;
        
        if (f.namaSpesies) {
          speciesCounter[f.namaSpesies] = (speciesCounter[f.namaSpesies] || 0) + qty;
        }
        if (f.lokasiGrid) {
          gridCounter[f.lokasiGrid] = (gridCounter[f.lokasiGrid] || 0) + qty;
        }
      });
    });

    // Top Species
    let topSpecies = 'Belum ada data';
    let topSpeciesCount = 0;
    Object.entries(speciesCounter).forEach(([sp, cnt]) => {
      if (cnt > topSpeciesCount) {
        topSpecies = sp;
        topSpeciesCount = cnt;
      }
    });

    // Top Hotspot Grid
    let topGrid = 'Belum ada data';
    let topGridCount = 0;
    Object.entries(gridCounter).forEach(([gr, cnt]) => {
      if (cnt > topGridCount) {
        topGrid = gr;
        topGridCount = cnt;
      }
    });

    return {
      totalReports,
      totalAnimalsCount,
      topSpecies,
      topSpeciesCount,
      topGrid,
      topGridCount,
      speciesCounter,
      gridCounter
    };
  }, [reports]);

  // Distinct species list for filter dropdown
  const uniqueSpeciesList = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => r.temuan.forEach((f) => {
      if (f.namaSpesies) set.add(f.namaSpesies);
    }));
    return Array.from(set);
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      // Search term matching across report metadata & findings
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesHeader = 
          rep.id.toLowerCase().includes(term) ||
          rep.namaPetugas.toLowerCase().includes(term) ||
          rep.tanggal.includes(term) ||
          rep.shift.toLowerCase().includes(term);

        const matchesFinding = rep.temuan.some(f => 
          f.namaSpesies.toLowerCase().includes(term) ||
          f.lokasiGrid.toLowerCase().includes(term) ||
          (f.tindakLanjut && f.tindakLanjut.toLowerCase().includes(term)) ||
          (f.reaksi && f.reaksi.toLowerCase().includes(term))
        );

        if (!matchesHeader && !matchesFinding) return false;
      }

      // Shift filter
      if (filterShift !== 'all' && rep.shift !== filterShift) {
        return false;
      }

      // Start & End Date
      if (filterStartDate && rep.tanggal < filterStartDate) return false;
      if (filterEndDate && rep.tanggal > filterEndDate) return false;

      // Species filter
      if (filterSpecies !== 'all') {
        const hasSpecies = rep.temuan.some(f => f.namaSpesies === filterSpecies);
        if (!hasSpecies) return false;
      }

      // Grid location filter
      if (filterGrid !== 'all') {
        const hasGrid = rep.temuan.some(f => f.lokasiGrid.toUpperCase() === filterGrid.toUpperCase());
        if (!hasGrid) return false;
      }

      return true;
    });
  }, [reports, searchTerm, filterShift, filterSpecies, filterGrid, filterStartDate, filterEndDate]);

  // Export handlers
  const handleExportExcel = () => {
    const fileName = `Monitoring_Hewan_Liar_Bandara_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportToExcel(filteredReports, fileName);
  };

  const handleExportCSV = () => {
    const fileName = `Monitoring_Hewan_Liar_Bandara_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(filteredReports, fileName);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. TOP KPI SUMMARY STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Reports */}
        <div className="bg-white p-5 rounded-2xl border border-[#E9E5DE] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">Total Laporan Shift</p>
            <h3 className="text-2xl font-black text-[#2D332F] mt-1 font-mono">{stats.totalReports}</h3>
            <p className="text-[11px] text-[#4A5D4E] font-semibold mt-0.5">Semua shift tercatat</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E8EDE7] text-[#4A5D4E] flex items-center justify-center border border-[#DCE4DC]">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Total Wildlife Count */}
        <div className="bg-white p-5 rounded-2xl border border-[#E9E5DE] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">Total Hewan Terpantau</p>
            <h3 className="text-2xl font-black text-[#D97706] mt-1 font-mono">{stats.totalAnimalsCount}</h3>
            <p className="text-[11px] text-[#8A958E] font-semibold mt-0.5">Ekor / Individu total</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center border border-[#FDE68A]">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Top Species */}
        <div className="bg-white p-5 rounded-2xl border border-[#E9E5DE] shadow-xs flex items-center justify-between">
          <div className="pr-2 truncate">
            <p className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">Spesies Terbanyak</p>
            <h3 className="text-sm sm:text-base font-black text-[#2D332F] mt-1 truncate" title={stats.topSpecies}>
              {stats.topSpecies}
            </h3>
            <p className="text-[11px] text-[#D97706] font-semibold mt-0.5">{stats.topSpeciesCount} temuan</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E8EDE7] text-[#5B6D5F] flex items-center justify-center border border-[#DCE4DC] shrink-0">
            <PieChart className="w-6 h-6" />
          </div>
        </div>

        {/* Top Hotspot Grid */}
        <div className="bg-white p-5 rounded-2xl border border-[#E9E5DE] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">Titik Hotspot Paling Rawan</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1 font-mono">
              Grid {stats.topGrid}
            </h3>
            <p className="text-[11px] text-rose-500 font-semibold mt-0.5">{stats.topGridCount} kali sighting</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
            <Flame className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. FILTER & TOOLBAR CARD */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E9E5DE] shadow-xs space-y-4">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-[#F1EEE9]">
          {/* Search bar */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-[#8A958E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-search-reports"
              placeholder="Cari ID, Petugas, Lokasi (B3/C6), Spesies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#FDFCFB] border border-[#E9E5DE] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:border-[#4A5D4E] text-[#2D332F]"
            />
          </div>

          {/* View Toggles & Export buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            
            {/* View Mode Selector */}
            <div className="flex bg-[#F1F3F0] p-1 rounded-xl border border-[#E9E5DE]">
              <button
                type="button"
                id="btn-view-table"
                onClick={() => setActiveView('table')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeView === 'table' ? 'bg-white text-[#2D332F] shadow-xs' : 'text-[#5F6B63] hover:text-[#2D332F]'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Tabel Data ({filteredReports.length})
              </button>

              <button
                type="button"
                id="btn-view-heatmap"
                onClick={() => setActiveView('heatmap')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeView === 'heatmap' ? 'bg-white text-[#2D332F] shadow-xs' : 'text-[#5F6B63] hover:text-[#2D332F]'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-[#D97706]" />
                Peta Heatmap Grid
              </button>

              <button
                type="button"
                id="btn-view-charts"
                onClick={() => setActiveView('charts')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeView === 'charts' ? 'bg-white text-[#2D332F] shadow-xs' : 'text-[#5F6B63] hover:text-[#2D332F]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                Grafik Tren
              </button>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-export-excel"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
                title="Export ke file Excel (.xlsx) persis format Google Sheets"
              >
                <Download className="w-3.5 h-3.5 text-[#A7F3D0]" />
                Excel (.xlsx)
              </button>

              <button
                type="button"
                id="btn-export-csv"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#5B6D5F] hover:bg-[#4A5D4E] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
                title="Export ke format CSV"
              >
                <FileText className="w-3.5 h-3.5" />
                CSV
              </button>
            </div>

          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {/* Shift Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#5F6B63] mb-1">Filter Shift:</label>
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FDFCFB] border border-[#E9E5DE] rounded-lg text-[#2D332F] font-medium"
            >
              <option value="all">Semua Shift</option>
              <option value="Pagi">Pagi (06:00-14:00)</option>
              <option value="Siang">Siang (14:00-22:00)</option>
              <option value="Malam">Malam (22:00-06:00)</option>
            </select>
          </div>

          {/* Species Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#5F6B63] mb-1">Filter Spesies:</label>
            <select
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FDFCFB] border border-[#E9E5DE] rounded-lg text-[#2D332F] font-medium truncate"
            >
              <option value="all">Semua Spesies</option>
              {uniqueSpeciesList.map((sp) => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>

          {/* Grid Location Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#5F6B63] mb-1">Filter Titik Grid:</label>
            <input
              type="text"
              placeholder="Semua (misal: H2)"
              value={filterGrid === 'all' ? '' : filterGrid}
              onChange={(e) => setFilterGrid(e.target.value.trim() ? e.target.value.trim() : 'all')}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FDFCFB] border border-[#E9E5DE] rounded-lg text-[#2D332F] font-mono uppercase font-bold"
            />
          </div>

          {/* Date Start */}
          <div>
            <label className="block text-[11px] font-bold text-[#5F6B63] mb-1">Dari Tanggal:</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FDFCFB] border border-[#E9E5DE] rounded-lg text-[#2D332F]"
            />
          </div>

          {/* Date End */}
          <div>
            <label className="block text-[11px] font-bold text-[#5F6B63] mb-1">Sampai Tanggal:</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FDFCFB] border border-[#E9E5DE] rounded-lg text-[#2D332F]"
            />
          </div>
        </div>

        {/* Active Filter Clear Chips */}
        {(filterShift !== 'all' || filterSpecies !== 'all' || filterGrid !== 'all' || filterStartDate || filterEndDate || searchTerm) && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#F1EEE9] text-xs text-[#5F6B63]">
            <span>Filter Aktif:</span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterShift('all');
                setFilterSpecies('all');
                setFilterGrid('all');
                setFilterStartDate('');
                setFilterEndDate('');
              }}
              className="text-[#4A5D4E] hover:text-[#3B4A3E] font-bold underline text-xs"
            >
              Reset Semua Filter
            </button>
          </div>
        )}

      </div>

      {/* 3. VIEW 1: INTERACTIVE HEATMAP VIEW */}
      {activeView === 'heatmap' && (
        <div className="bg-white rounded-2xl p-5 border border-[#E9E5DE] shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#2D332F] flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#D97706]" />
                Visualisasi Sebaran Hotspot Temuan Hewan (Grid 16 x 9)
              </h3>
              <p className="text-xs text-[#5F6B63]">
                Warna merah/oranye mengindikasikan intensitas kemunculan hewan yang tinggi di area runway dan perimeter
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-rose-600 rounded"></span> Tinggi (&ge;5)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-amber-500 rounded"></span> Sedang (3-4)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-emerald-600 rounded"></span> Rendah (1-2)
              </span>
            </div>
          </div>

          <AirportGridMap
            mode="heatmap"
            heatmapData={heatmapData}
            onSelectCell={(code) => {
              setFilterGrid(code);
              setActiveView('table');
            }}
          />
        </div>
      )}

      {/* 4. VIEW 2: TREND CHARTS & ANALYTICS */}
      {activeView === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          
          {/* Top Species Breakdown */}
          <div className="bg-white rounded-2xl p-5 border border-[#E9E5DE] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#2D332F] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#4A5D4E]" />
              Komposisi Spesies Hewan Terpantau
            </h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {Object.entries(stats.speciesCounter)
                .sort((a, b) => Number(b[1]) - Number(a[1]))
                .map(([species, count]) => {
                  const numCount = Number(count);
                  const percent = Math.round((numCount / (stats.totalAnimalsCount || 1)) * 100);
                  return (
                    <div key={species} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-[#2D332F]">
                        <span className="truncate max-w-[280px]">{species}</span>
                        <span className="font-mono">{numCount} ekor ({percent}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#E9E5DE] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#4A5D4E] rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Top Grid Hotspots Breakdown */}
          <div className="bg-white rounded-2xl p-5 border border-[#E9E5DE] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#2D332F] flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#D97706]" />
              Titik Grid Paling Sering Terjadi Temuan
            </h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {Object.entries(stats.gridCounter)
                .sort((a, b) => Number(b[1]) - Number(a[1]))
                .slice(0, 8)
                .map(([grid, count]) => {
                  const numCount = Number(count);
                  const percent = Math.round((numCount / (stats.totalAnimalsCount || 1)) * 100);
                  return (
                    <div key={grid} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-[#2D332F]">
                        <span className="font-mono font-bold text-rose-600">Grid {grid}</span>
                        <span className="font-mono">{numCount} sighting ({percent}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#E9E5DE] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#D97706] to-rose-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

        </div>
      )}

      {/* 5. VIEW 3: DATA MONITORING TABLE (MATCHING EXISTING GOOGLE SHEETS) */}
      <div className="bg-white rounded-2xl border border-[#E9E5DE] shadow-xs overflow-hidden">
        
        <div className="p-4 sm:p-5 bg-[#FDFCFB] border-b border-[#E9E5DE] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#2D332F] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#4A5D4E]" />
              Daftar Rekap Seluruh Laporan Masuk
            </h3>
            <p className="text-xs text-[#5F6B63] mt-0.5">
              Urut dari yang paling baru • Menampilkan {filteredReports.length} dari {reports.length} laporan
            </p>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileText className="w-12 h-12 text-[#8A958E] mx-auto mb-3 opacity-40" />
            <h4 className="text-sm font-bold text-[#2D332F]">Tidak ada laporan yang sesuai filter</h4>
            <p className="text-xs text-[#5F6B63] mt-1">Coba ganti kata kunci pencarian atau reset filter tanggal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F7F2] text-[#5F6B63] font-bold uppercase text-[11px] tracking-wider border-b border-[#E9E5DE]">
                  <th className="py-3 px-4">Timestamp & ID</th>
                  <th className="py-3 px-3">Tanggal / Waktu</th>
                  <th className="py-3 px-3">Shift</th>
                  <th className="py-3 px-3">Cuaca & Cahaya</th>
                  <th className="py-3 px-3">Temuan (Grid, Spesies, Qty)</th>
                  <th className="py-3 px-3">Petugas Pelapor</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EEE9]">
                {filteredReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-[#F8F7F2]/80 transition-colors">
                    
                    {/* Timestamp & ID */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-[#2D332F]">{rep.id}</div>
                      <div className="text-[10px] text-[#8A958E]">
                        {new Date(rep.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Tanggal & Waktu */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-[#2D332F]">{rep.tanggal}</div>
                      <div className="text-[11px] text-[#5F6B63]">{rep.waktu} WIB</div>
                    </td>

                    {/* Shift */}
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        rep.shift === 'Pagi' 
                          ? 'bg-[#E8EDE7] text-[#4A5D4E]' 
                          : rep.shift === 'Siang'
                          ? 'bg-[#FEF3C7] text-[#D97706]'
                          : 'bg-[#2D3A2F] text-[#F1F3F0]'
                      }`}>
                        {rep.shift}
                      </span>
                    </td>

                    {/* Cuaca & Pencahayaan */}
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-[#2D332F]">{rep.kondisiCuaca}</div>
                      <div className="text-[10px] text-[#5F6B63]">{rep.kondisiPencahayaan}</div>
                    </td>

                    {/* Temuan items list */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-1.5 max-w-sm">
                        {rep.temuan.map((f, i) => (
                          <div key={f.id || i} className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-mono font-black bg-[#2D3A2F] text-[#FDE68A] px-1.5 py-0.5 rounded text-[10px] border border-[#3D4E41]">
                              {f.lokasiGrid}
                            </span>
                            <span className="font-semibold text-[#2D332F]">{f.namaSpesies}</span>
                            <span className="text-[#D97706] font-bold bg-[#FEF3C7] px-1.5 py-0.2 rounded-full text-[10px]">({f.jumlah}x)</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Petugas */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-[#2D332F]">{rep.namaPetugas}</div>
                      <div className="text-[10px] text-[#4A5D4E] flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Bertanda tangan
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          id={`btn-view-report-${rep.id}`}
                          onClick={() => onViewReportDetail(rep)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F1F3F0] hover:bg-[#E9E5DE] text-[#4A5D4E] rounded-lg text-xs font-bold transition-colors border border-[#E9E5DE]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Log Book PDF
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
