import React, { useState, useEffect } from 'react';
import { WildlifeReport, FindingItem, ShiftType, WeatherCondition, LightingCondition } from '../types';
import { KNOWN_SPECIES, ACTION_PRESETS, REACTION_PRESETS } from '../data/initialData';
import { SignaturePad } from './SignaturePad';
import { GridPickerModal } from './GridPickerModal';
import { AirportGridMap } from './AirportGridMap';
import { 
  Plus, Trash2, MapPin, Send, CheckCircle2, Clock, 
  Calendar, Sun, CloudRain, Shield, AlertTriangle, 
  FileText, Sparkles, Map, User, RefreshCw, PlaneTakeoff
} from 'lucide-react';

interface ReportFormProps {
  onSubmitReport: (report: WildlifeReport) => void;
  availableSpecies: string[];
  onAddNewSpecies?: (species: string) => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  onSubmitReport,
  availableSpecies,
  onAddNewSpecies
}) => {
  // Helper to get current date & time
  const now = new Date();
  const currentDateStr = now.toISOString().split('T')[0];
  const currentTimeStr = now.toTimeString().slice(0, 5);

  // Auto-detect current shift based on hour
  const getSuggestedShift = (): ShiftType => {
    const hour = now.getHours();
    if (hour >= 6 && hour < 14) return 'Pagi';
    if (hour >= 14 && hour < 22) return 'Siang';
    return 'Malam';
  };

  // Form State
  const [tanggal, setTanggal] = useState<string>(currentDateStr);
  const [waktu, setWaktu] = useState<string>(currentTimeStr);
  const [shift, setShift] = useState<ShiftType>(getSuggestedShift());
  const [kondisiCuaca, setKondisiCuaca] = useState<WeatherCondition>('Cerah');
  const [kondisiPencahayaan, setKondisiPencahayaan] = useState<LightingCondition>('Terang');
  const [namaPetugas, setNamaPetugas] = useState<string>('');
  const [tandaTangan, setTandaTangan] = useState<string>('');
  const [catatanTambahan, setCatatanTambahan] = useState<string>('');

  // Findings Dynamic Rows
  const [temuan, setTemuan] = useState<FindingItem[]>([
    {
      id: `fnd-${Date.now()}-1`,
      no: 1,
      lokasiGrid: 'B3',
      namaSpesies: '',
      jumlah: 1,
      tindakLanjut: '',
      reaksi: ''
    }
  ]);

  // Modal State for Grid Picker
  const [isGridPickerOpen, setIsGridPickerOpen] = useState<boolean>(false);
  const [activePickingFindingIndex, setActivePickingFindingIndex] = useState<number | null>(null);
  const [showMapOverview, setShowMapOverview] = useState<boolean>(false);

  // Autocomplete Species Suggestions
  const [activeSpeciesDropdownIndex, setActiveSpeciesDropdownIndex] = useState<number | null>(null);

  // UI feedback
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // LocalStorage Auto-Draft persistence
  const DRAFT_KEY = 'airport_wildlife_report_draft';

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.namaPetugas) setNamaPetugas(parsed.namaPetugas);
        if (parsed.temuan && parsed.temuan.length > 0) setTemuan(parsed.temuan);
        if (parsed.catatanTambahan) setCatatanTambahan(parsed.catatanTambahan);
        if (parsed.tandaTangan) setTandaTangan(parsed.tandaTangan);
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  // Save draft on changes
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        namaPetugas,
        temuan,
        catatanTambahan,
        tandaTangan
      }));
    } catch {
      // storage quota or private browsing
    }
  }, [namaPetugas, temuan, catatanTambahan, tandaTangan]);

  // Add new finding row
  const handleAddFindingRow = () => {
    const nextNo = temuan.length + 1;
    setTemuan([
      ...temuan,
      {
        id: `fnd-${Date.now()}-${nextNo}`,
        no: nextNo,
        lokasiGrid: 'D7',
        namaSpesies: '',
        jumlah: 1,
        tindakLanjut: '',
        reaksi: ''
      }
    ]);
  };

  // Remove finding row
  const handleRemoveFindingRow = (index: number) => {
    if (temuan.length <= 1) {
      alert('Laporan harus memiliki minimal satu baris temuan.');
      return;
    }
    const updated = temuan.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      no: idx + 1
    }));
    setTemuan(updated);
  };

  // Update specific finding field
  const handleUpdateFinding = (index: number, field: keyof FindingItem, value: any) => {
    const updated = [...temuan];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setTemuan(updated);
  };

  // Open Grid Picker for specific row
  const handleOpenGridPicker = (index: number) => {
    setActivePickingFindingIndex(index);
    setIsGridPickerOpen(true);
  };

  const handleApplyGridCode = (code: string) => {
    if (activePickingFindingIndex !== null) {
      handleUpdateFinding(activePickingFindingIndex, 'lokasiGrid', code);
    }
    setIsGridPickerOpen(false);
    setActivePickingFindingIndex(null);
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validations
    if (!namaPetugas.trim()) {
      setValidationError('Nama Petugas pelapor wajib diisi.');
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      return;
    }

    if (!tandaTangan) {
      setValidationError('Tanda Tangan digital petugas pada canvas wajib digoreskan.');
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      return;
    }

    // Check findings
    for (let i = 0; i < temuan.length; i++) {
      const f = temuan[i];
      if (!f.lokasiGrid) {
        setValidationError(`Baris No. ${f.no}: Lokasi Grid belum dipilih.`);
        return;
      }
      if (!f.namaSpesies.trim()) {
        setValidationError(`Baris No. ${f.no}: Nama / Spesies Hewan Liar wajib diisi.`);
        return;
      }
      if (!f.jumlah || f.jumlah < 1) {
        setValidationError(`Baris No. ${f.no}: Jumlah hewan minimal 1.`);
        return;
      }
    }

    // Generate unique Report ID
    const reportId = `REP-${tanggal.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newReport: WildlifeReport = {
      id: reportId,
      timestamp: new Date().toISOString(),
      tanggal,
      waktu,
      shift,
      kondisiCuaca,
      kondisiPencahayaan,
      temuan,
      namaPetugas: namaPetugas.trim(),
      tandaTangan,
      catatanTambahan: catatanTambahan.trim(),
      synced: true
    };

    // Save to species dictionary if new
    temuan.forEach(f => {
      if (onAddNewSpecies && f.namaSpesies.trim()) {
        onAddNewSpecies(f.namaSpesies.trim());
      }
    });

    // Clear Draft
    localStorage.removeItem(DRAFT_KEY);

    onSubmitReport(newReport);
    setIsSubmitted(true);

    // Reset Form for next report
    setTimeout(() => {
      setTemuan([
        {
          id: `fnd-${Date.now()}-1`,
          no: 1,
          lokasiGrid: 'B3',
          namaSpesies: '',
          jumlah: 1,
          tindakLanjut: '',
          reaksi: ''
        }
      ]);
      setTandaTangan('');
      setCatatanTambahan('');
      setIsSubmitted(false);
    }, 2800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#4A5D4E] text-[#F1F3F0] p-5 sm:p-7 rounded-2xl shadow-md border border-[#3D4E41]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B6D5F] text-[#F1F3F0] border border-[#7B8C7C]/50 text-xs font-semibold uppercase tracking-wider mb-2">
              <PlaneTakeoff className="w-3.5 h-3.5 text-[#A7F3D0]" />
              SIPEHAL • Wildlife Hazard Log
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Formulir Pemantauan Hewan Liar (SIPEHAL)
            </h1>
            <p className="text-xs sm:text-sm text-[#E2DDD5] mt-1">
              Pengisian berkala per shift inspeksi wilayah operasi sisi udara & perimeter (*Hewan Liar termasuk Burung)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowMapOverview(!showMapOverview)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3D4E41] hover:bg-[#5B6D5F] text-[#F1F3F0] border border-[#5B6D5F]/60 rounded-xl text-xs font-bold transition-all shadow-xs self-stretch sm:self-auto justify-center"
          >
            <Map className="w-4 h-4 text-[#FDE68A]" />
            {showMapOverview ? 'Sembunyikan Peta' : 'Lihat Peta Grid Bandara (8x4)'}
          </button>
        </div>

        {/* Collapsible Airport Map Blueprint Preview */}
        {showMapOverview && (
          <div className="mt-5 pt-5 border-t border-[#5B6D5F]/60 animate-in fade-in duration-200">
            <div className="mb-2 flex items-center justify-between text-xs text-[#E2DDD5]">
              <span className="font-semibold text-white">Peta Grid Bandar Udara H. AS. Hanandjoeddin:</span>
              <span className="text-[#E2DDD5]/80">Kolom 1 - 8 | Baris A - D (Appendix 3.a)</span>
            </div>
            <AirportGridMap 
              mode="readonly" 
              findings={temuan}
              interactive={false}
            />
          </div>
        )}
      </div>

      {/* Success Notification Alert */}
      {isSubmitted && (
        <div className="bg-[#E8EDE7] border-2 border-[#4A5D4E] text-[#2D332F] p-5 rounded-2xl shadow-md flex items-center gap-4 animate-in zoom-in-95 duration-200">
          <CheckCircle2 className="w-8 h-8 text-[#4A5D4E] shrink-0" />
          <div>
            <h4 className="font-bold text-base text-[#2D332F]">Laporan Berhasil Disimpan & Masuk Log Book!</h4>
            <p className="text-xs text-[#5F6B63]">Data telah tercatat ke dalam sistem pemantauan real-time dan siap diekspor ke PDF resmi / Excel.</p>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: HEADER INFORMASI LAPORAN */}
        <div className="bg-white rounded-2xl shadow-xs border border-[#E9E5DE] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F1EEE9]">
            <Calendar className="w-5 h-5 text-[#4A5D4E]" />
            <h2 className="text-base font-bold text-[#2D332F]">1. Header Laporan Pengamatan</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Tanggal */}
            <div>
              <label className="block text-xs font-bold text-[#5F6B63] mb-1">
                Tanggal Pemantauan <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                id="input-tanggal"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FDFCFB] border border-[#E9E5DE] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:border-[#4A5D4E] font-medium text-[#2D332F]"
              />
            </div>

            {/* Waktu */}
            <div>
              <label className="block text-xs font-bold text-[#5F6B63] mb-1">
                Waktu (Jam) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  id="input-waktu"
                  required
                  value={waktu}
                  onChange={(e) => setWaktu(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FDFCFB] border border-[#E9E5DE] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:border-[#4A5D4E] font-medium text-[#2D332F]"
                />
              </div>
            </div>

            {/* Shift */}
            <div>
              <label className="block text-xs font-bold text-[#5F6B63] mb-1">
                Shift Operasi <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-shift"
                value={shift}
                onChange={(e) => setShift(e.target.value as ShiftType)}
                className="w-full px-3 py-2 text-sm bg-[#FDFCFB] border border-[#E9E5DE] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:border-[#4A5D4E] font-bold text-[#2D332F]"
              >
                <option value="Pagi">Shift Pagi (06:00 - 14:00)</option>
                <option value="Siang">Shift Siang (14:00 - 22:00)</option>
                <option value="Malam">Shift Malam (22:00 - 06:00)</option>
              </select>
            </div>

            {/* Kondisi Cuaca */}
            <div>
              <label className="block text-xs font-bold text-[#5F6B63] mb-1">
                Kondisi Cuaca <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-cuaca"
                value={kondisiCuaca}
                onChange={(e) => setKondisiCuaca(e.target.value as WeatherCondition)}
                className="w-full px-3 py-2 text-sm bg-[#FDFCFB] border border-[#E9E5DE] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:border-[#4A5D4E] font-semibold text-[#2D332F]"
              >
                <option value="Cerah">☀️ Cerah</option>
                <option value="Cerah Berawan">🌤️ Cerah Berawan</option>
                <option value="Berawan">☁️ Berawan</option>
                <option value="Hujan Ringan">🌦️ Hujan Ringan</option>
                <option value="Hujan Lebat">🌧️ Hujan Lebat</option>
                <option value="Berkabut">🌫️ Berkabut</option>
                <option value="Angin Kencang">💨 Angin Kencang</option>
              </select>
            </div>

            {/* Kondisi Pencahayaan */}
            <div>
              <label className="block text-xs font-bold text-[#5F6B63] mb-1">
                Kondisi Pencahayaan <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-pencahayaan"
                value={kondisiPencahayaan}
                onChange={(e) => setKondisiPencahayaan(e.target.value as LightingCondition)}
                className="w-full px-3 py-2 text-sm bg-[#FDFCFB] border border-[#E9E5DE] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:border-[#4A5D4E] font-semibold text-[#2D332F]"
              >
                <option value="Terang">💡 Terang (Daylight / Good)</option>
                <option value="Redup">⛅ Redup (Dusk / Dawn / Twilight)</option>
                <option value="Gelap">🌙 Gelap (Night)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: TABEL DETAIL TEMUAN (DYNAMIC ROWS) */}
        <div className="bg-white rounded-2xl shadow-xs border border-[#E9E5DE] p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#F1EEE9]">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#4A5D4E]" />
                <h2 className="text-base font-bold text-[#2D332F]">2. Detail Temuan Hewan Liar</h2>
              </div>
              <p className="text-xs text-[#5F6B63] mt-0.5">
                Bisa menambahkan lebih dari satu temuan hewan per shift pengamatan
              </p>
            </div>

            <button
              type="button"
              id="btn-tambah-baris-temuan"
              onClick={handleAddFindingRow}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 self-stretch sm:self-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              + Tambah Baris Temuan
            </button>
          </div>

          {/* Dynamic Finding Cards / Rows */}
          <div className="space-y-4">
            {temuan.map((finding, idx) => (
              <div
                key={finding.id}
                id={`finding-row-${idx + 1}`}
                className="bg-[#FDFCFB] rounded-xl p-4 sm:p-5 border border-[#E9E5DE] hover:border-[#7B8C7C] transition-all shadow-2xs relative space-y-3"
              >
                {/* Row Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-[#2D332F]">Temuan #{idx + 1}</span>
                  </div>

                  {temuan.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFindingRow(idx)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                      title="Hapus baris ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  )}
                </div>

                {/* Finding Grid Fields */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  
                  {/* Lokasi Grid (Columns 1-16, Rows A-I) with interactive Picker */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-[#5F6B63] mb-1">
                      Lokasi Grid Peta <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-10 rounded-xl bg-[#2D3A2F] text-[#FDE68A] font-mono font-black text-sm flex items-center justify-center border border-[#3D4E41] shadow-inner">
                        {finding.lokasiGrid || '--'}
                      </div>
                      <button
                        type="button"
                        id={`btn-picker-grid-${idx}`}
                        onClick={() => handleOpenGridPicker(idx)}
                        className="flex-1 h-10 px-2.5 bg-[#F1F3F0] hover:bg-[#E9E5DE] text-[#4A5D4E] border border-[#E9E5DE] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
                        <span className="truncate">Pilih Peta Grid</span>
                      </button>
                    </div>
                  </div>

                  {/* Nama / Spesies Hewan Liar (with instant autocomplete) */}
                  <div className="md:col-span-6 relative">
                    <label className="block text-xs font-bold text-[#5F6B63] mb-1">
                      Nama / Spesies Hewan Liar <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id={`input-spesies-${idx}`}
                        required
                        placeholder="Contoh: Burung Kuntul, Biawak, Anjing Liar..."
                        value={finding.namaSpesies}
                        onFocus={() => setActiveSpeciesDropdownIndex(idx)}
                        onChange={(e) => handleUpdateFinding(idx, 'namaSpesies', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E9E5DE] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:border-[#4A5D4E] font-medium text-[#2D332F]"
                      />
                    </div>

                    {/* Autocomplete Dropdown */}
                    {activeSpeciesDropdownIndex === idx && (
                      <div 
                        className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-[#E9E5DE] rounded-xl shadow-lg max-h-48 overflow-y-auto p-1.5 animate-in fade-in-50 duration-100"
                        onMouseLeave={() => setActiveSpeciesDropdownIndex(null)}
                      >
                        <div className="px-2 py-1 text-[10px] font-bold text-[#8A958E] uppercase tracking-wider">
                          Daftar Spesies Standar Bandara:
                        </div>
                        {availableSpecies
                          .filter(s => s.toLowerCase().includes(finding.namaSpesies.toLowerCase()))
                          .map((species) => (
                            <button
                              key={species}
                              type="button"
                              onClick={() => {
                                handleUpdateFinding(idx, 'namaSpesies', species);
                                setActiveSpeciesDropdownIndex(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 text-xs text-[#2D332F] hover:bg-[#F1F3F0] hover:text-[#4A5D4E] rounded-lg transition-colors flex items-center justify-between"
                            >
                              <span>{species}</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Jumlah Hewan Liar */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-[#5F6B63] mb-1">
                      Jumlah (Ekor/Individu) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateFinding(idx, 'jumlah', Math.max(1, (finding.jumlah || 1) - 1))}
                        className="w-10 h-10 rounded-xl bg-[#E9E5DE] hover:bg-[#DDD8CF] text-[#2D332F] font-bold text-base flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        id={`input-jumlah-${idx}`}
                        required
                        value={finding.jumlah}
                        onChange={(e) => handleUpdateFinding(idx, 'jumlah', parseInt(e.target.value) || 1)}
                        className="w-full h-10 px-2 text-center text-sm font-bold bg-white border border-[#E9E5DE] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:border-[#4A5D4E] text-[#2D332F]"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateFinding(idx, 'jumlah', (finding.jumlah || 1) + 1)}
                        className="w-10 h-10 rounded-xl bg-[#E9E5DE] hover:bg-[#DDD8CF] text-[#2D332F] font-bold text-base flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                </div>

                {/* Tindak Lanjut & Reaksi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#E9E5DE]">
                  
                  {/* Tindak Lanjut */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[#5F6B63]">
                        Tindak Lanjut (Reaktif / Proaktif)
                      </label>
                      <span className="text-[10px] text-[#8A958E] italic">Pilihan cepat:</span>
                    </div>
                    <textarea
                      rows={2}
                      id={`textarea-tindak-lanjut-${idx}`}
                      placeholder="Contoh: Pengusiran menggunakan sirene & klakson kendaraan patroli..."
                      value={finding.tindakLanjut}
                      onChange={(e) => handleUpdateFinding(idx, 'tindakLanjut', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E9E5DE] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:border-[#4A5D4E] text-[#2D332F]"
                    />
                    {/* Quick suggestion tags */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {ACTION_PRESETS.slice(0, 3).map((act) => (
                        <button
                          key={act}
                          type="button"
                          onClick={() => handleUpdateFinding(idx, 'tindakLanjut', act)}
                          className="text-[10px] bg-[#F1F3F0] hover:bg-[#E9E5DE] text-[#4A5D4E] px-2 py-0.5 rounded-md border border-[#E9E5DE] transition-colors truncate max-w-[200px]"
                          title={act}
                        >
                          + {act.split(' ')[0]} {act.split(' ')[1]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reaksi Hewan Liar Setelah Tindak Lanjut */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[#5F6B63]">
                        Reaksi Hewan Liar Setelah Tindakan
                      </label>
                      <span className="text-[10px] text-[#8A958E] italic">Pilihan cepat:</span>
                    </div>
                    <textarea
                      rows={2}
                      id={`textarea-reaksi-${idx}`}
                      placeholder="Contoh: Terbang menjauh ke arah luar perimeter bandara..."
                      value={finding.reaksi}
                      onChange={(e) => handleUpdateFinding(idx, 'reaksi', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E9E5DE] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:border-[#4A5D4E] text-[#2D332F]"
                    />
                    {/* Quick suggestion tags */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {REACTION_PRESETS.slice(0, 3).map((rea) => (
                        <button
                          key={rea}
                          type="button"
                          onClick={() => handleUpdateFinding(idx, 'reaksi', rea)}
                          className="text-[10px] bg-[#F1F3F0] hover:bg-[#E9E5DE] text-[#4A5D4E] px-2 py-0.5 rounded-md border border-[#E9E5DE] transition-colors truncate max-w-[200px]"
                          title={rea}
                        >
                          + {rea.split(' ')[0]} {rea.split(' ')[1]}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>

        </div>

        {/* SECTION 3: PETUGAS & TANDA TANGAN DIGITAL */}
        <div className="bg-white rounded-2xl shadow-xs border border-[#E9E5DE] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F1EEE9]">
            <User className="w-5 h-5 text-[#4A5D4E]" />
            <h2 className="text-base font-bold text-[#2D332F]">3. Identitas Petugas & Tanda Tangan Digital</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Nama Petugas & Catatan Tambahan */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5F6B63] mb-1">
                  Nama Lengkap Petugas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-nama-petugas"
                  required
                  placeholder="Contoh: Budi Santoso (Wildlife Unit)"
                  value={namaPetugas}
                  onChange={(e) => setNamaPetugas(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCFB] border border-[#E9E5DE] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:border-[#4A5D4E] font-semibold text-[#2D332F]"
                />
                <p className="text-[11px] text-[#8A958E] mt-1">
                  Mendukung multi-petugas tanpa akun rumit (cukup nama & tanda tangan).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5F6B63] mb-1">
                  Catatan Tambahan Patroli (Opsional)
                </label>
                <textarea
                  rows={3}
                  id="textarea-catatan"
                  placeholder="Catatan kondisi pagar perimeter, genangan air hujan, atau hambatan lainnya..."
                  value={catatanTambahan}
                  onChange={(e) => setCatatanTambahan(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FDFCFB] border border-[#E9E5DE] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:border-[#4A5D4E] text-[#2D332F]"
                />
              </div>
            </div>

            {/* Signature Pad Canvas */}
            <div className="lg:col-span-7">
              <SignaturePad
                value={tandaTangan}
                onChange={setTandaTangan}
                officerName={namaPetugas}
                required={true}
              />
            </div>
          </div>
        </div>

        {/* Validation Error Message Alert */}
        {validationError && (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-in shake duration-200">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submission Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-[#5F6B63] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4A5D4E]"></span>
            Draf formulir tersimpan otomatis di perangkat Anda
          </div>

          <button
            type="submit"
            id="btn-submit-laporan"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md shadow-[#4A5D4E]/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Kirim Laporan Pemantauan Log Book
          </button>
        </div>

      </form>

      {/* Grid Picker Modal */}
      {isGridPickerOpen && activePickingFindingIndex !== null && (
        <GridPickerModal
          isOpen={isGridPickerOpen}
          onClose={() => setIsGridPickerOpen(false)}
          currentValue={temuan[activePickingFindingIndex]?.lokasiGrid || 'H2'}
          onSelect={handleApplyGridCode}
          title={`Pilih Titik Grid untuk Temuan #${activePickingFindingIndex + 1}`}
        />
      )}

    </div>
  );
};
