import React, { useRef, useState } from 'react';
import { WildlifeReport } from '../types';
import { AirportGridMap } from './AirportGridMap';
import { Printer, Download, ArrowLeft, Check, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

interface LogBookPrintLayoutProps {
  report: WildlifeReport;
  onBack?: () => void;
  isSingleView?: boolean;
}

export const LogBookPrintLayout: React.FC<LogBookPrintLayoutProps> = ({
  report,
  onBack,
  isSingleView = true
}) => {
  const printRef = useRef<HTMLDivElement | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Robust PDF Generation using html-to-image + jsPDF with full-width landscape canvas
  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsExportingPdf(true);
    setExportSuccess(false);

    try {
      // 1. Convert DOM node to PNG image data URL with high fidelity
      const dataUrl = await toPng(printRef.current, {
        quality: 1,
        backgroundColor: '#ffffff',
        pixelRatio: 2.2,
        cacheBust: true,
        style: {
          margin: '0',
          transform: 'none'
        }
      });

      // 2. Measure natural proportions
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Gagal memuat gambar screenshot untuk PDF'));
      });

      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const aspectRatio = imgHeight / imgWidth;

      // 3. Guaranteed Full-Fit on Standard A4 Landscape (297mm x 210mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = 297; // mm
      const pageHeight = 210; // mm
      const margin = 5; // 5mm margin on outer edges

      const maxAvailableWidth = pageWidth - (margin * 2); // 287mm
      const maxAvailableHeight = pageHeight - (margin * 2); // 200mm

      // Calculate width & height to ensure ALL content (header to signature) fits in 1 page
      let finalWidth = maxAvailableWidth;
      let finalHeight = maxAvailableWidth * aspectRatio;

      if (finalHeight > maxAvailableHeight) {
        finalHeight = maxAvailableHeight;
        finalWidth = maxAvailableHeight / aspectRatio;
      }

      // Center precisely on the A4 Landscape page
      const posX = (pageWidth - finalWidth) / 2;
      const posY = (pageHeight - finalHeight) / 2;

      pdf.addImage(dataUrl, 'PNG', posX, posY, finalWidth, finalHeight, undefined, 'FAST');
      pdf.save(`LOGBOOK_HEWAN_LIAR_${report.tanggal}_${report.shift}_${report.id}.pdf`);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback to browser print if export engine encounters client issues
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleBrowserPrint = () => {
    window.focus();
    window.print();
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Action Toolbar (Hidden during actual print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#2D3A2F] text-white p-3 sm:p-4 rounded-xl border border-[#3B4A3E] shadow-md print:hidden">
        <div className="flex items-center space-x-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 hover:bg-[#3B4A3E] rounded-lg text-[#D1D9D3] hover:text-white transition-colors cursor-pointer"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h3 className="font-bold text-sm text-[#F8F7F2]">Format Resmi Log Book Sesuai Standar</h3>
            <p className="text-xs text-[#A8B4AB]">ID Laporan: {report.id} | {report.tanggal} ({report.shift})</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleBrowserPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#232D25] hover:bg-[#3B4A3E] text-[#D1D9D3] border border-[#3B4A3E] rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak / Print
          </button>

          <button
            type="button"
            id="btn-download-pdf-single"
            disabled={isExportingPdf}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white rounded-lg shadow-sm transition-all disabled:opacity-50 border border-[#617666] cursor-pointer"
          >
            {exportSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                PDF Berhasil Diunduh
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-[#A7F3D0]" />
                {isExportingPdf ? 'Membuat File PDF...' : 'Download PDF Log Book'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* OFFICIAL LOG BOOK DOCUMENT CONTAINER */}
      <div className="overflow-x-auto bg-[#E9E5DE] p-2 sm:p-6 rounded-2xl flex justify-center shadow-inner print-container print:p-0 print:bg-white">
        <div 
          ref={printRef}
          id="official-logbook-document"
          className="bg-white text-black p-4 sm:p-5 w-[1140px] shadow-2xl border-2 border-black font-sans print:shadow-none print:border-none print:m-0 print:p-2"
          style={{ boxSizing: 'border-box' }}
        >
          {/* 1. DOCUMENT HEADER (Identical to reference template) */}
          <div className="text-center mb-2.5 pb-1 border-b border-black/20">
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider font-sans leading-tight text-black">
              LOG BOOK
            </h1>
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide mt-0.5 text-black">
              PEMANTAUAN HEWAN LIAR DI WILAYAH OPERASI BANDARA
            </h2>
            <p className="text-[10px] font-bold text-black mt-0.5">
              (*Hewan Liar termasuk Burung)
            </p>
          </div>

          {/* 2. TOP SECTION: LEFT META INFO + CENTER/RIGHT AIRPORT GRID MAP */}
          <div className="flex items-start gap-4 mb-2.5">
            
            {/* Left Meta Info block (Structured Table with No-Wrap for perfect single-line alignment) */}
            <div className="w-[300px] shrink-0 text-xs font-bold uppercase pt-0.5 text-black font-sans">
              <table className="w-full text-[10.5px] uppercase border-collapse">
                <tbody>
                  <tr>
                    <td className="py-0.5 w-36 font-black text-black whitespace-nowrap">TANGGAL</td>
                    <td className="py-0.5 w-3 text-center font-bold">:</td>
                    <td className="py-0.5 font-bold text-black whitespace-nowrap">{report.tanggal}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 w-36 font-black text-black whitespace-nowrap">WAKTU</td>
                    <td className="py-0.5 w-3 text-center font-bold">:</td>
                    <td className="py-0.5 font-bold text-black whitespace-nowrap">{report.waktu}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 w-36 font-black text-black whitespace-nowrap">SHIFT</td>
                    <td className="py-0.5 w-3 text-center font-bold">:</td>
                    <td className="py-0.5 font-bold text-black whitespace-nowrap">{report.shift}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 w-36 font-black text-black whitespace-nowrap">KONDISI CUACA</td>
                    <td className="py-0.5 w-3 text-center font-bold">:</td>
                    <td className="py-0.5 font-bold text-black whitespace-nowrap">{report.kondisiCuaca}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 w-36 font-black text-black whitespace-nowrap">KONDISI PENCAHAYAAN</td>
                    <td className="py-0.5 w-3 text-center font-bold">:</td>
                    <td className="py-0.5 font-bold text-black whitespace-nowrap">{report.kondisiPencahayaan}</td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-2 text-[9.5px] font-sans font-extrabold text-black uppercase tracking-wide leading-snug border-t border-black/30 mt-2">
                SESUAIKAN DENGAN GRID MAP<br />
                MASING-MASING BANDARA
              </div>
            </div>

            {/* Right: Grid Map Layout */}
            <div className="flex-1 min-w-0">
              <AirportGridMap
                mode="markers"
                findings={report.temuan}
                interactive={false}
                className="border-2 border-black shadow-xs"
              />
            </div>

          </div>

          {/* 3. FINDINGS DATA TABLE (Exact 6 columns matching reference image) */}
          <div className="mb-2">
            <table className="w-full border-collapse border-2 border-black text-[10px]">
              <thead>
                <tr className="bg-white font-black uppercase text-center border-b-2 border-black text-black">
                  <th className="border-2 border-black p-1.5 w-10">NO</th>
                  <th className="border-2 border-black p-1.5 w-28">LOKASI PENGAMATAN</th>
                  <th className="border-2 border-black p-1.5 w-48">NAMA/SPESIES HEWAN LIAR</th>
                  <th className="border-2 border-black p-1.5 w-24">JUMLAH HEWAN LIAR</th>
                  <th className="border-2 border-black p-1.5">
                    TINDAK LANJUT<br />
                    <span className="font-normal text-[8.5px] normal-case">(dapat meliputi tindakan reaktif dan proaktif)</span>
                  </th>
                  <th className="border-2 border-black p-1.5 w-60">
                    REAKSI HEWAN LIAR SETELAH DILAKUKAN TINDAK LANJUT
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.temuan.map((f, i) => (
                  <tr key={f.id || i} className="border-b border-black text-black">
                    <td className="border border-black p-1 text-center font-bold">{f.no || i + 1}</td>
                    <td className="border border-black p-1 text-center font-mono font-black text-[11px] bg-slate-50/50">
                      {f.lokasiGrid}
                    </td>
                    <td className="border border-black p-1 font-semibold">
                      {f.namaSpesies}
                    </td>
                    <td className="border border-black p-1 text-center font-bold">
                      {f.jumlah}
                    </td>
                    <td className="border border-black p-1 text-[9.5px] leading-tight">
                      {f.tindakLanjut || '-'}
                    </td>
                    <td className="border border-black p-1 text-[9.5px] leading-tight">
                      {f.reaksi || '-'}
                    </td>
                  </tr>
                ))}

                {/* Blank rows if findings are few, matching traditional logbook sheets */}
                {report.temuan.length < 2 && Array.from({ length: 2 - report.temuan.length }).map((_, idx) => (
                  <tr key={`blank-${idx}`} className="border-b border-black h-7 text-black">
                    <td className="border border-black p-1 text-center">{report.temuan.length + idx + 1}</td>
                    <td className="border border-black p-1 text-center"></td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1 text-center"></td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. FOOTER: PETUGAS & TANDA TANGAN (Matching bottom-left placement) */}
          <div className="pt-0.5 text-[10px] font-sans text-black">
            <div className="text-left w-72 uppercase font-bold">
              <p className="font-extrabold text-[11px]">PETUGAS</p>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="w-24">NAMA</span>
                <span>:</span>
                <span className="font-bold text-[11px]">{report.namaPetugas || '-'}</span>
              </div>
              
              <div className="flex items-start gap-2 mt-1">
                <span className="w-24">TANDA TANGAN</span>
                <span>:</span>
                <div className="w-40 h-11 border-b border-black flex items-center justify-center -mt-1">
                  {report.tandaTangan ? (
                    <img 
                      src={report.tandaTangan} 
                      alt="Tanda Tangan Petugas" 
                      className="max-h-10 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[9px] text-slate-400 italic font-normal normal-case">
                      (Belum ada tanda tangan)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {report.catatanTambahan && (
              <div className="mt-1 text-[9px] text-slate-700 italic border-t border-slate-200 pt-0.5">
                * Catatan: {report.catatanTambahan}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

