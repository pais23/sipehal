import React, { useRef, useState } from 'react';
import { WildlifeReport } from '../types';
import { AirportGridMap } from './AirportGridMap';
import { Printer, Download, ArrowLeft, Check } from 'lucide-react';
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
        pixelRatio: 2.5,
        cacheBust: true,
        style: {
          margin: '0',
          transform: 'none',
          border: 'none',
          boxShadow: 'none'
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
      const margin = 6; // 6mm margin on outer edges for clean, borderless output

      const maxAvailableWidth = pageWidth - (margin * 2); // 285mm
      const maxAvailableHeight = pageHeight - (margin * 2); // 198mm

      // Calculate width & height to ensure ALL content fits gracefully on 1 page
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

      {/* OFFICIAL LOG BOOK DOCUMENT CONTAINER (Borderless canvas for clean export) */}
      <div className="overflow-x-auto bg-[#E9E5DE] p-2 sm:p-6 rounded-2xl flex justify-center shadow-inner print-container print:p-0 print:bg-white">
        <div
          ref={printRef}
          id="official-logbook-document"
          className="bg-white text-black p-6 sm:p-7 w-[1080px] shadow-xl font-sans print:shadow-none print:border-none print:m-0 print:p-4"
          style={{ boxSizing: 'border-box' }}
        >
          {/* 1. DOCUMENT HEADER (Identical to reference template) */}
          <div className="text-center mb-3 pb-1.5 border-b border-black/30">
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider font-sans leading-tight text-black">
              LOG BOOK
            </h1>
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide mt-0.5 text-black">
              PEMANTAUAN HEWAN LIAR DI WILAYAH OPERASI BANDARA
            </h2>
            <p className="text-[10.5px] font-bold text-slate-800 mt-0.5">
              (*Hewan Liar termasuk Burung)
            </p>
          </div>

          {/* 2. TOP SECTION: LEFT META INFO + CENTER/RIGHT AIRPORT GRID MAP */}
          <div className="flex items-stretch gap-4 mb-3">

            {/* Left Meta Info block (Structured Table with crisp proportional font) */}
            <div className="w-[300px] shrink-0 font-sans flex flex-col justify-between py-0.5">
              <table className="w-full text-xs uppercase border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 w-36 font-black text-black whitespace-nowrap text-[11px] sm:text-[11.5px]">TANGGAL</td>
                    <td className="py-1 w-3 text-center font-bold text-black">:</td>
                    <td className="py-1 font-bold text-black whitespace-nowrap text-[11.5px]">{report.tanggal}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 w-36 font-black text-black whitespace-nowrap text-[11px] sm:text-[11.5px]">WAKTU</td>
                    <td className="py-1 w-3 text-center font-bold text-black">:</td>
                    <td className="py-1 font-bold text-black whitespace-nowrap text-[11.5px] font-mono">{report.waktu}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 w-36 font-black text-black whitespace-nowrap text-[11px] sm:text-[11.5px]">SHIFT</td>
                    <td className="py-1 w-3 text-center font-bold text-black">:</td>
                    <td className="py-1 font-bold text-black whitespace-nowrap text-[11.5px]">{report.shift}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 w-36 font-black text-black whitespace-nowrap text-[11px] sm:text-[11.5px]">KONDISI CUACA</td>
                    <td className="py-1 w-3 text-center font-bold text-black">:</td>
                    <td className="py-1 font-bold text-black whitespace-nowrap text-[11.5px]">{report.kondisiCuaca}</td>
                  </tr>
                  <tr>
                    <td className="py-1 w-36 font-black text-black whitespace-nowrap text-[11px] sm:text-[11.5px]">KONDISI PENCAHAYAAN</td>
                    <td className="py-1 w-3 text-center font-bold text-black">:</td>
                    <td className="py-1 font-bold text-black whitespace-nowrap text-[11.5px]">{report.kondisiPencahayaan}</td>
                  </tr>
                </tbody>
              </table>

              {/* <div className="pt-2 text-[9.5px] font-sans font-black text-black uppercase tracking-wide leading-snug border-t border-black/40 mt-1.5">
                SESUAIKAN DENGAN GRID MAP<br />
                MASING-MASING BANDARA
              </div> */}
            </div>

            {/* Right: Grid Map Layout (Compact and proportional) */}
            <div className="flex-1 min-w-0">
              <AirportGridMap
                mode="markers"
                findings={report.temuan}
                interactive={false}
                compact={true}
                className="border border-black shadow-none rounded-none"
              />
            </div>

          </div>

          {/* 3. FINDINGS DATA TABLE (Clear, readable, proportional explanations) */}
          <div className="mb-3">
            <table className="w-full border-collapse border border-black text-[11px]">
              <thead>
                <tr className="bg-slate-100/90 font-black uppercase text-center border-b border-black text-black">
                  <th className="border border-black py-2 px-1 w-10 text-[11px]">NO</th>
                  <th className="border border-black py-2 px-1.5 w-24 text-[11px]">LOKASI PENGAMATAN</th>
                  <th className="border border-black py-2 px-2 w-44 text-[11px]">NAMA/SPESIES HEWAN LIAR</th>
                  <th className="border border-black py-2 px-1.5 w-20 text-[11px]">JUMLAH HEWAN LIAR</th>
                  <th className="border border-black py-2 px-2 text-[11px]">
                    TINDAK LANJUT<br />
                    <span className="font-normal text-[9px] normal-case text-slate-700">(dapat meliputi tindakan reaktif dan proaktif)</span>
                  </th>
                  <th className="border border-black py-2 px-2 w-64 text-[11px]">
                    REAKSI HEWAN LIAR SETELAH DILAKUKAN TINDAK LANJUT
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.temuan.map((f, i) => (
                  <tr key={f.id || i} className="border-b border-black text-black">
                    <td className="border border-black py-2 px-1 text-center font-bold text-[11.5px]">{f.no || i + 1}</td>
                    <td className="border border-black py-2 px-1.5 text-center font-mono font-black text-[12.5px] bg-slate-50/70">
                      {f.lokasiGrid}
                    </td>
                    <td className="border border-black py-2 px-2 font-bold text-[11.5px]">
                      {f.namaSpesies}
                    </td>
                    <td className="border border-black py-2 px-1 text-center font-black text-[12px]">
                      {f.jumlah}
                    </td>
                    <td className="border border-black py-2 px-2.5 text-[11.5px] leading-relaxed text-black">
                      {f.tindakLanjut || '-'}
                    </td>
                    <td className="border border-black py-2 px-2.5 text-[11.5px] leading-relaxed text-black">
                      {f.reaksi || '-'}
                    </td>
                  </tr>
                ))}

                {/* Blank rows if findings are few, matching traditional logbook sheets */}
                {report.temuan.length < 2 && Array.from({ length: 2 - report.temuan.length }).map((_, idx) => (
                  <tr key={`blank-${idx}`} className="border-b border-black h-8 text-black">
                    <td className="border border-black py-2 px-1 text-center font-bold text-[11.5px]">{report.temuan.length + idx + 1}</td>
                    <td className="border border-black py-2 px-1 text-center"></td>
                    <td className="border border-black py-2 px-1"></td>
                    <td className="border border-black py-2 px-1 text-center"></td>
                    <td className="border border-black py-2 px-1"></td>
                    <td className="border border-black py-2 px-1"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. FOOTER: PETUGAS & TANDA TANGAN */}
          <div className="pt-1 text-[11.5px] font-sans text-black">
            <div className="text-left w-80 uppercase font-bold">
              <p className="font-black text-[12px] tracking-wide">PETUGAS</p>

              <div className="flex items-center gap-2 mt-1">
                <span className="w-24 text-[11.5px] font-bold">NAMA</span>
                <span>:</span>
                <span className="font-black text-[12px]">{report.namaPetugas || '-'}</span>
              </div>

              <div className="flex items-start gap-2 mt-1.5">
                <span className="w-24 text-[11.5px] font-bold">TANDA TANGAN</span>
                <span>:</span>
                <div className="w-44 h-12 border-b border-black flex items-center justify-center -mt-1">
                  {report.tandaTangan ? (
                    <img
                      src={report.tandaTangan}
                      alt="Tanda Tangan Petugas"
                      className="max-h-11 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[9.5px] text-slate-400 italic font-normal normal-case">
                      (Belum ada tanda tangan)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {report.catatanTambahan && (
              <div className="mt-2 text-[10.5px] text-slate-700 italic border-t border-slate-200 pt-1">
                * Catatan: {report.catatanTambahan}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

