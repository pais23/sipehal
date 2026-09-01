import { WildlifeReport } from '../types';

// Official Grid System for Bandar Udara H. AS. Hanandjoeddin (Appendix 3.a)
export const GRID_ROWS = ['A', 'B', 'C', 'D'] as const;
export const GRID_COLS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const AIRPORT_INFO = {
  name: 'Bandar Udara H. AS. Hanandjoeddin',
  codeIATA: 'TJQ',
  codeICAO: 'WIKT',
  location: 'Tanjung Pandan, Belitung, Kepulauan Bangka Belitung',
  gridSystem: '8 Kolom (1-8) x 4 Baris (A-D)',
  documentRef: 'APPENDIX 3. a. - GRID MAP BANDAR UDARA H. AS. HANANDJOEDDIN',
  gmName: 'Hernindya Arie Setiawan',
  gmNik: '20241022',
  docRevision: '00',
  docDate: '31/10/2024'
};

export const KNOWN_SPECIES: string[] = [
  'Burung Kuntul (Egretta sp.)',
  'Burung Layang-layang (Hirundinidae)',
  'Burung Gereja (Passer montanus)',
  'Burung Tekukur (Spilopelia chinensis)',
  'Burung Elang / Raptor (Accipitridae)',
  'Burung Cangak Abu (Ardea cinerea)',
  'Burung Trinil Semak (Tringa glareola)',
  'Burung Belibis (Dendrocygna sp.)',
  'Biawak Air (Varanus salvator)',
  'Anjing Liar (Canis lupus familiaris)',
  'Kucing Liar (Felis catus)',
  'Ular Sanca Kembang (Malayopython reticulatus)',
  'Ular Kobra Jawa (Naja sputatrix)',
  'Tikus Lapangan (Rattus exulans)',
  'Kelelawar / Codot (Chiroptera)',
  'Monyet Ekor Panjang (Macaca fascicularis)'
];

export const ACTION_PRESETS: string[] = [
  'Pengusiran menggunakan sirene & klakson kendaraan patroli',
  'Pengusiran menggunakan pyrotechnic / flare bird scaring',
  'Pengusiran menggunakan acoustic bird repellent / laser',
  'Penangkapan manual dengan jaring / rescue handler',
  'Pemasangan perangkat pengusir / bird spike & netting',
  'Patroli pengawasan intensif & FOD check',
  'Koordinasi dengan Unit Air Traffic Control (ATC)'
];

export const REACTION_PRESETS: string[] = [
  'Terbang menjauh ke arah luar perimeter (Utara/Selatan)',
  'Terbang ke area pepohonan di luar pagar bandara',
  'Lari menjauh menuju drainase / semak-semak perimeter',
  'Tertangkap hidup dan diamankan untuk relokasi aman',
  'Mati akibat tabrakan / insiden, bangkai dievakuasi',
  'Agresif dan berpindah ke sisi taxiway'
];

export const INITIAL_REPORTS: WildlifeReport[] = [];
