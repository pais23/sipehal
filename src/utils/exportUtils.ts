import * as XLSX from 'xlsx';
import { WildlifeReport } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface FlatLogRecord {
  Timestamp: string;
  Tanggal: string;
  Waktu: string;
  Shift: string;
  'Kondisi Cuaca': string;
  'Kondisi Pencahayaan': string;
  'Lokasi Pengamatan': string;
  'Nama/Spesies': string;
  Jumlah: number;
  'Tindak Lanjut': string;
  Reaksi: string;
  'Nama Petugas': string;
  'Catatan Khusus'?: string;
  'ID Laporan'?: string;
}

// Flatten nested report findings to exact Google Sheets table format
export const flattenReports = (reports: WildlifeReport[]): FlatLogRecord[] => {
  const rows: FlatLogRecord[] = [];

  reports.forEach((rep) => {
    rep.temuan.forEach((item) => {
      rows.push({
        Timestamp: rep.timestamp,
        Tanggal: rep.tanggal,
        Waktu: rep.waktu,
        Shift: rep.shift,
        'Kondisi Cuaca': rep.kondisiCuaca,
        'Kondisi Pencahayaan': rep.kondisiPencahayaan,
        'Lokasi Pengamatan': item.lokasiGrid,
        'Nama/Spesies': item.namaSpesies,
        Jumlah: item.jumlah,
        'Tindak Lanjut': item.tindakLanjut || '-',
        Reaksi: item.reaksi || '-',
        'Nama Petugas': rep.namaPetugas,
        'Catatan Khusus': rep.catatanTambahan || '',
        'ID Laporan': rep.id
      });
    });
  });

  return rows;
};

// Export to .XLSX (Microsoft Excel format)
export const exportToExcel = (reports: WildlifeReport[], filename = 'Log_Book_Pemantauan_Hewan_Liar_Bandara.xlsx') => {
  const data = flattenReports(reports);
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Column width auto formatting
  const colWidths = [
    { wch: 22 }, // Timestamp
    { wch: 12 }, // Tanggal
    { wch: 8 },  // Waktu
    { wch: 10 }, // Shift
    { wch: 16 }, // Kondisi Cuaca
    { wch: 18 }, // Kondisi Pencahayaan
    { wch: 18 }, // Lokasi Pengamatan
    { wch: 30 }, // Nama/Spesies
    { wch: 10 }, // Jumlah
    { wch: 40 }, // Tindak Lanjut
    { wch: 40 }, // Reaksi
    { wch: 25 }, // Nama Petugas
    { wch: 30 }, // Catatan Khusus
    { wch: 18 }, // ID Laporan
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Monitoring');

  XLSX.writeFile(workbook, filename);
};

// Export to .CSV (Comma Separated Values)
export const exportToCSV = (reports: WildlifeReport[], filename = 'Log_Book_Pemantauan_Hewan_Liar_Bandara.csv') => {
  const data = flattenReports(reports);
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
