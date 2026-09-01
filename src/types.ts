export type ShiftType = 'Pagi' | 'Siang' | 'Malam';

export type WeatherCondition = 
  | 'Cerah' 
  | 'Cerah Berawan' 
  | 'Berawan' 
  | 'Hujan Ringan' 
  | 'Hujan Lebat' 
  | 'Berkabut' 
  | 'Angin Kencang';

export type LightingCondition = 'Terang' | 'Redup' | 'Gelap';

export interface FindingItem {
  id: string;
  no: number;
  lokasiGrid: string; // e.g. "H2", "C7"
  namaSpesies: string;
  kategoriSpesies?: 'Burung' | 'Mamalia' | 'Reptil' | 'Lainnya';
  jumlah: number;
  tindakLanjut: string;
  reaksi: string;
}

export interface WildlifeReport {
  id: string;
  timestamp: string; // ISO format
  tanggal: string;   // YYYY-MM-DD
  waktu: string;     // HH:mm
  shift: ShiftType | string;
  kondisiCuaca: WeatherCondition | string;
  kondisiPencahayaan: LightingCondition;
  temuan: FindingItem[];
  namaPetugas: string;
  tandaTangan: string; // Base64 data URL
  catatanTambahan?: string;
  synced?: boolean;
}

export interface GridCell {
  col: number;  // 1 - 8 (Bandara H. AS. Hanandjoeddin)
  row: string;  // A - D
  code: string; // "B3", "C6", etc.
}

export interface HeatmapData {
  [gridCode: string]: {
    count: number;
    findingsCount: number;
    species: { [speciesName: string]: number };
  };
}

export type ActiveTab = 'form' | 'dashboard' | 'analytics' | 'logbook';
