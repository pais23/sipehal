import React, { useState, useMemo } from 'react';
import { GRID_ROWS, GRID_COLS, AIRPORT_INFO } from '../data/initialData';
import { FindingItem, HeatmapData } from '../types';
import { MapPin, ZoomIn, ZoomOut, RotateCcw, Flame, Layers, Eye, Compass } from 'lucide-react';

interface AirportGridMapProps {
  mode?: 'picker' | 'heatmap' | 'markers' | 'readonly';
  selectedCell?: string; // e.g. "B3", "C6"
  onSelectCell?: (cellCode: string) => void;
  findings?: FindingItem[];
  heatmapData?: HeatmapData;
  highlightCells?: string[];
  className?: string;
  interactive?: boolean;
  showLegend?: boolean;
  compact?: boolean;
}

export const AirportGridMap: React.FC<AirportGridMapProps> = ({
  mode = 'picker',
  selectedCell,
  onSelectCell,
  findings = [],
  heatmapData,
  highlightCells = [],
  className = '',
  interactive = true,
  showLegend = true,
  compact = false
}) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Layer visibility toggles
  const [showPerimeter, setShowPerimeter] = useState<boolean>(true);
  const [showEvacRoutes, setShowEvacRoutes] = useState<boolean>(true);
  const [showFacilities, setShowFacilities] = useState<boolean>(true);

  // Map finding markers by cell
  const findingsByCell = useMemo(() => {
    const map = new Map<string, FindingItem[]>();
    findings.forEach(f => {
      if (f.lokasiGrid) {
        const key = f.lokasiGrid.toUpperCase().trim();
        const existing = map.get(key) || [];
        existing.push(f);
        map.set(key, existing);
      }
    });
    return map;
  }, [findings]);

  // Calculate maximum sightings for heatmap normalization
  const maxHeatmapCount = useMemo(() => {
    if (!heatmapData) return 1;
    let max = 1;
    Object.values(heatmapData).forEach((entry) => {
      const d = entry as { count: number; findingsCount: number };
      if (d && typeof d.findingsCount === 'number' && d.findingsCount > max) {
        max = d.findingsCount;
      }
    });
    return max;
  }, [heatmapData]);

  // Handle cell click
  const handleCellClick = (cellCode: string) => {
    if (interactive && onSelectCell) {
      onSelectCell(cellCode);
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.8));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className={`relative bg-white rounded-xl overflow-hidden border border-black/70 select-none shadow-sm ${className}`}>
      
      {/* Top Map Control Bar (Hidden in print mode) */}
      {interactive && (
        <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#232D25] text-white text-xs border-b border-[#3B4A3E] print:hidden gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#A7F3D0] flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              BANDAR UDARA H. AS. HANANDJOEDDIN (GRID 8 × 4)
            </span>
            {mode === 'picker' && selectedCell && (
              <span className="bg-[#D97706] text-white px-2 py-0.5 rounded font-mono font-bold text-[11px] shadow-xs">
                Titik: {selectedCell}
              </span>
            )}
            {mode === 'heatmap' && (
              <span className="bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 rounded font-medium flex items-center gap-1 text-[11px]">
                <Flame className="w-3.5 h-3.5 text-[#D97706]" /> Sebaran Hotspot
              </span>
            )}
          </div>

          {/* Controls: Layers & Zoom */}
          <div className="flex items-center space-x-2">
            {/* Layer Toggles */}
            <div className="hidden sm:flex items-center space-x-1 text-[10px] bg-[#1B241D] p-1 rounded-lg border border-[#354338]">
              <button
                type="button"
                onClick={() => setShowPerimeter(!showPerimeter)}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors ${showPerimeter ? 'bg-rose-900/60 text-rose-200 border border-rose-700' : 'text-slate-400'}`}
                title="Toggle Batas Pagar Perimeter"
              >
                Pagar
              </button>
              <button
                type="button"
                onClick={() => setShowEvacRoutes(!showEvacRoutes)}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors ${showEvacRoutes ? 'bg-amber-900/60 text-amber-200 border border-amber-700' : 'text-slate-400'}`}
                title="Toggle Jalur Evakuasi Darurat"
              >
                Jalur Darurat
              </button>
              <button
                type="button"
                onClick={() => setShowFacilities(!showFacilities)}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors ${showFacilities ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700' : 'text-slate-400'}`}
                title="Toggle Fasilitas Bandara"
              >
                Fasilitas
              </button>
            </div>

            {/* Zoom buttons */}
            <div className="flex items-center space-x-1 bg-[#1B241D] px-1.5 py-0.5 rounded-lg border border-[#354338]">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 hover:bg-[#3B4A3E] rounded text-[#D1D9D3] hover:text-white transition-colors"
                title="Perkecil (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] text-[#A8B4AB] px-1 min-w-[32px] text-center">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 hover:bg-[#3B4A3E] rounded text-[#D1D9D3] hover:text-white transition-colors"
                title="Perbesar (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetView}
                className="p-1 hover:bg-[#3B4A3E] rounded text-[#D1D9D3] hover:text-white transition-colors"
                title="Reset Posisi"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Canvas / Stage (8 Columns x 4 Rows Aspect Ratio) */}
      <div 
        className={`relative w-full overflow-hidden bg-[#2A342C] flex items-center justify-center ${compact ? 'p-0.5' : 'p-1 sm:p-2'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className={`relative transition-transform duration-75 origin-center w-full ${compact ? 'aspect-[2.35/1]' : 'aspect-[2.1/1]'} bg-[#1a2818] border ${compact ? 'border-black/60' : 'border-2 border-black'} shadow-sm`}
          style={{
            transform: interactive ? `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` : undefined
          }}
        >
          {/* Main Map Box */}
          <div className="relative w-full h-full overflow-hidden flex flex-col">
            
            {/* SVG Background Layer: Faithful Aerodrome Blueprint of H. AS. Hanandjoeddin */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1600 800" 
              preserveAspectRatio="none"
            >
              {/* Satellite Background Simulation (Belitung Airfield Terrain) */}
              <defs>
                {/* Grass & Forest Texture Gradient */}
                <linearGradient id="terrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2e4228" />
                  <stop offset="35%" stopColor="#3d5234" />
                  <stop offset="70%" stopColor="#2f452a" />
                  <stop offset="100%" stopColor="#253820" />
                </linearGradient>

                {/* Cleared Airfield Ground Gradient */}
                <linearGradient id="clearedGround" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4a5f42" />
                  <stop offset="50%" stopColor="#546b4c" />
                  <stop offset="100%" stopColor="#415539" />
                </linearGradient>

                {/* Asphalt Runway Gradient */}
                <linearGradient id="asphaltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#374151" />
                  <stop offset="50%" stopColor="#1F2937" />
                  <stop offset="100%" stopColor="#374151" />
                </linearGradient>

                {/* Sand / Soil Clearing */}
                <radialGradient id="soilPond" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="85%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#854d0e" />
                </radialGradient>
              </defs>

              {/* Base terrain */}
              <rect width="1600" height="800" fill="url(#terrainGrad)" />

              {/* Natural Forest & Land patches (Surrounding Belitung landscape) */}
              <g opacity="0.35" fill="#1b2e16">
                <circle cx="150" cy="120" r="140" />
                <circle cx="350" cy="100" r="160" />
                <circle cx="650" cy="130" r="130" />
                <circle cx="1100" cy="110" r="180" />
                <circle cx="1450" cy="140" r="170" />
                <circle cx="200" cy="720" r="160" />
                <circle cx="500" cy="700" r="180" />
                <circle cx="1250" cy="680" r="190" />
                <circle cx="1520" cy="710" r="170" />
              </g>

              {/* Cleared Airfield Strip Area (Row B & C, Cols 1 to 8) */}
              <polygon 
                points="110,260 1490,270 1510,540 1280,540 1220,620 920,620 860,530 110,510" 
                fill="url(#clearedGround)" 
                stroke="#607658" 
                strokeWidth="2" 
                opacity="0.95"
              />

              {/* Open Sand / Soil Clearing in South-West (Cols 2-4, Row C-D) */}
              <path 
                d="M 280 430 Q 380 410, 520 440 Q 640 470, 580 620 Q 450 640, 320 590 Z" 
                fill="#8a9e7f" 
                opacity="0.45"
              />

              {/* 1. RUNWAY (LANDASAN PACU) - Across Cols 1 to 8 in Rows B & C */}
              {/* Runway Shoulder / Graded Strip */}
              <rect x="130" y="340" width="1340" height="76" fill="#475543" stroke="#2c3a28" strokeWidth="1.5" rx="4" />
              
              {/* Main Asphalt Runway 18/36 (or 15/33) */}
              <rect x="150" y="352" width="1300" height="52" fill="url(#asphaltGrad)" stroke="#111827" strokeWidth="2" />

              {/* Runway Centerline (Dashed White Markings) */}
              <line x1="220" y1="378" x2="1380" y2="378" stroke="#ffffff" strokeWidth="3" strokeDasharray="30 22" />

              {/* West Threshold Markings (Col 1-2) */}
              <g fill="#ffffff">
                <rect x="160" y="356" width="6" height="44" />
                <rect x="172" y="358" width="28" height="4" />
                <rect x="172" y="366" width="28" height="4" />
                <rect x="172" y="374" width="28" height="4" />
                <rect x="172" y="382" width="28" height="4" />
                <rect x="172" y="390" width="28" height="4" />
                <text x="210" y="383" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="sans-serif">18</text>
              </g>

              {/* East Threshold Markings (Col 7-8) */}
              <g fill="#ffffff">
                <rect x="1434" y="356" width="6" height="44" />
                <rect x="1400" y="358" width="28" height="4" />
                <rect x="1400" y="366" width="28" height="4" />
                <rect x="1400" y="374" width="28" height="4" />
                <rect x="1400" y="382" width="28" height="4" />
                <rect x="1400" y="390" width="28" height="4" />
                <text x="1382" y="383" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="sans-serif">36</text>
              </g>

              {/* Blast Pads / Overruns */}
              <g stroke="#eab308" strokeWidth="2.5" fill="none">
                <path d="M 130 354 L 148 378 L 130 402" />
                <path d="M 1470 354 L 1452 378 L 1470 402" />
              </g>

              {/* 2. TAXIWAYS & APRON COMPLEX (Cols 5-7, Row C) */}
              {/* Taxiway Links from Runway to Apron */}
              <path d="M 980 404 L 980 455 L 1260 455 L 1260 404" fill="none" stroke="#2b3827" strokeWidth="26" />
              <path d="M 980 404 L 980 455 L 1260 455 L 1260 404" fill="none" stroke="#374151" strokeWidth="20" />
              <path d="M 980 404 L 980 455 L 1260 455 L 1260 404" fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="8 6" />

              {/* Main Apron (Aircraft Parking Stand in Grid C6 - C7) */}
              <rect x="940" y="445" width="340" height="75" fill="#475569" stroke="#1e293b" strokeWidth="2" rx="2" />
              
              {/* Apron Aircraft Parking Spots */}
              <g stroke="#facc15" strokeWidth="1.8" fill="none">
                <circle cx="990" cy="485" r="16" />
                <circle cx="1060" cy="485" r="16" />
                <circle cx="1130" cy="485" r="16" />
                <circle cx="1200" cy="485" r="16" />
                <line x1="970" y1="485" x2="1220" y2="485" strokeDasharray="6 4" />
              </g>

              {/* 3. AIRPORT BUILDINGS & TERMINALS (Row C & D, Cols 5-7) */}
              {/* Terminal Building (⑥ in C6-C7) */}
              <rect x="1000" y="525" width="160" height="38" fill="#b91c1c" stroke="#450a0a" strokeWidth="2" rx="3" />
              <text x="1080" y="548" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
                TERMINAL TJQ
              </text>

              {/* Tower ATC (⑤ in C6) */}
              <rect x="965" y="525" width="28" height="28" fill="#7c3aed" stroke="#3b0764" strokeWidth="1.8" rx="2" />
              <text x="979" y="543" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                ATC
              </text>

              {/* Gedung Teknisi & BMKG (② & ③ in C6) */}
              <rect x="920" y="525" width="38" height="24" fill="#0284c7" stroke="#075985" strokeWidth="1.5" />
              <text x="939" y="541" fill="#ffffff" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
                TEK
              </text>

              {/* Cargo & AVSEC (⑦ & ⑧ in C7) */}
              <rect x="1170" y="525" width="60" height="26" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
              <text x="1200" y="542" fill="#ffffff" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
                CARGO
              </text>

              {/* PKP-PK / ARFF Station (① in D2 / C2) */}
              <rect x="220" y="475" width="45" height="28" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1.8" rx="2" />
              <text x="242" y="493" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                PKP-PK
              </text>

              {/* Sumber Air / Kolam Air Reservoir (in D2 & D4) */}
              <ellipse cx="205" cy="485" rx="14" ry="10" fill="url(#soilPond)" stroke="#1e3a8a" strokeWidth="1.5" />
              <ellipse cx="610" cy="505" rx="18" ry="12" fill="url(#soilPond)" stroke="#1e3a8a" strokeWidth="1.5" />

              {/* 4. EMERGENCY & EVACUATION ROADS (YELLOW & GREEN LINES) */}
              {showEvacRoutes && (
                <g fill="none">
                  {/* Akses Jalur Utama Penanggulangan Keadaan Darurat (Solid Yellow Line) */}
                  <path 
                    d="M 240 505 L 340 515 L 610 525 L 860 535 L 940 565 L 1050 575 L 1230 565 L 1380 640 L 1480 750" 
                    stroke="#facc15" 
                    strokeWidth="4.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  <path 
                    d="M 240 505 L 340 515 L 610 525 L 860 535 L 940 565 L 1050 575 L 1230 565 L 1380 640 L 1480 750" 
                    stroke="#000000" 
                    strokeWidth="1.2" 
                    strokeDasharray="4 4" 
                  />

                  {/* Akses Alternatif Jalur Evakuasi (Yellow-Green dashed) */}
                  <path 
                    d="M 340 515 L 420 560 L 580 575 L 820 570 L 920 600" 
                    stroke="#84cc16" 
                    strokeWidth="3.5" 
                    strokeDasharray="6 4" 
                  />

                  {/* Akses Masuk Emergency (Red with Arrow) */}
                  <path 
                    d="M 1260 560 L 1360 480 L 1430 480" 
                    stroke="#ef4444" 
                    strokeWidth="3" 
                    strokeDasharray="5 3" 
                  />

                  {/* Batas Tanggung Jawab PKP-PK (Cyan / Blue Dashed) */}
                  <path 
                    d="M 180 520 L 320 535 L 640 545 L 880 550 L 1240 550" 
                    stroke="#38bdf8" 
                    strokeWidth="2.5" 
                    strokeDasharray="8 5" 
                  />
                </g>
              )}

              {/* 5. AIRPORT PERIMETER FENCE (BATAS PAGAR - RED THICK LINE) */}
              {showPerimeter && (
                <g fill="none">
                  {/* Outer security perimeter enclosing Runway & Facilities */}
                  <polygon 
                    points="115,280 1485,290 1485,465 1290,465 1280,565 910,565 900,475 115,460" 
                    stroke="#dc2626" 
                    strokeWidth="4" 
                    strokeLinejoin="miter" 
                  />
                  <polygon 
                    points="115,280 1485,290 1485,465 1290,465 1280,565 910,565 900,475 115,460" 
                    stroke="#fef08a" 
                    strokeWidth="1.2" 
                    strokeDasharray="8 6" 
                  />
                </g>
              )}

              {/* 6. SPECIAL MARKERS: STAGING AREAS, ISOLATED AREA, ARP, RENDEZVOUS */}
              {showFacilities && (
                <g>
                  {/* Staging Area Markers (Yellow circle with cross) in B3, C3, C6, C7 */}
                  {/* Staging Area B3 / C3 */}
                  <g transform="translate(480, 425)">
                    <circle cx="0" cy="0" r="10" fill="#facc15" stroke="#000000" strokeWidth="1.5" />
                    <line x1="-7" y1="0" x2="7" y2="0" stroke="#000000" strokeWidth="2" />
                    <line x1="0" y1="-7" x2="0" y2="7" stroke="#000000" strokeWidth="2" />
                  </g>
                  {/* Staging Area C5/C6 */}
                  <g transform="translate(900, 435)">
                    <circle cx="0" cy="0" r="10" fill="#facc15" stroke="#000000" strokeWidth="1.5" />
                    <line x1="-7" y1="0" x2="7" y2="0" stroke="#000000" strokeWidth="2" />
                    <line x1="0" y1="-7" x2="0" y2="7" stroke="#000000" strokeWidth="2" />
                  </g>
                  {/* Staging Area C7 */}
                  <g transform="translate(1275, 435)">
                    <circle cx="0" cy="0" r="10" fill="#facc15" stroke="#000000" strokeWidth="1.5" />
                    <line x1="-7" y1="0" x2="7" y2="0" stroke="#000000" strokeWidth="2" />
                    <line x1="0" y1="-7" x2="0" y2="7" stroke="#000000" strokeWidth="2" />
                  </g>

                  {/* Isolated Parking Area (Red Circle with black border) in B5/B6 */}
                  <g transform="translate(980, 310)">
                    <circle cx="0" cy="0" r="12" fill="#ef4444" stroke="#000000" strokeWidth="2.5" />
                    <circle cx="0" cy="0" r="5" fill="#000000" />
                  </g>

                  {/* Aerodrome Reference Point (ARP Target Symbol) in C5 */}
                  <g transform="translate(800, 430)">
                    <circle cx="0" cy="0" r="8" fill="none" stroke="#ef4444" strokeWidth="2" />
                    <circle cx="0" cy="0" r="3" fill="#ef4444" />
                    <line x1="-12" y1="0" x2="12" y2="0" stroke="#ef4444" strokeWidth="1.5" />
                    <line x1="0" y1="-12" x2="0" y2="12" stroke="#ef4444" strokeWidth="1.5" />
                  </g>

                  {/* Rendezvous Point (Red Triangle) in C6 */}
                  <g transform="translate(1010, 435)">
                    <polygon points="0,-9 9,7 -9,7" fill="#dc2626" stroke="#ffffff" strokeWidth="1" />
                  </g>

                  {/* Numbered Legend Badges ① - ⑧ matching Appendix 3.a/3.c */}
                  {/* ① PKP-PK */}
                  <g transform="translate(242, 460)">
                    <circle cx="0" cy="0" r="8" fill="#dc2626" stroke="#ffffff" strokeWidth="1.2" />
                    <text x="0" y="3.5" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">1</text>
                  </g>
                  {/* ② Gedung Teknisi */}
                  <g transform="translate(930, 510)">
                    <circle cx="0" cy="0" r="8" fill="#eab308" stroke="#ffffff" strokeWidth="1.2" />
                    <text x="0" y="3.5" fill="#000000" fontSize="9" fontWeight="900" textAnchor="middle">2</text>
                  </g>
                  {/* ③ Meteorologi */}
                  <g transform="translate(950, 510)">
                    <circle cx="0" cy="0" r="8" fill="#16a34a" stroke="#ffffff" strokeWidth="1.2" />
                    <text x="0" y="3.5" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">3</text>
                  </g>
                  {/* ④ Kantor Tata Usaha */}
                  <g transform="translate(980, 510)">
                    <circle cx="0" cy="0" r="8" fill="#ec4899" stroke="#ffffff" strokeWidth="1.2" />
                    <text x="0" y="3.5" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">4</text>
                  </g>
                  {/* ⑤ Tower */}
                  <g transform="translate(1005, 510)">
                    <circle cx="0" cy="0" r="8" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.2" />
                    <text x="0" y="3.5" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">5</text>
                  </g>
                  {/* ⑥ Terminal */}
                  <g transform="translate(1060, 510)">
                    <circle cx="0" cy="0" r="8" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.2" />
                    <text x="0" y="3.5" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">6</text>
                  </g>
                  {/* ⑦ AVSEC */}
                  <g transform="translate(1160, 510)">
                    <circle cx="0" cy="0" r="8" fill="#2563eb" stroke="#ffffff" strokeWidth="1.2" />
                    <text x="0" y="3.5" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">7</text>
                  </g>
                  {/* ⑧ Cargo */}
                  <g transform="translate(1210, 510)">
                    <circle cx="0" cy="0" r="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.2" />
                    <text x="0" y="3.5" fill="#000000" fontSize="9" fontWeight="900" textAnchor="middle">8</text>
                  </g>
                </g>
              )}

              {/* 7. COMPASS ROSE (Top-Left in Grid A1) */}
              <g transform="translate(130, 95)">
                <circle cx="0" cy="0" r="24" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
                <line x1="0" y1="-22" x2="0" y2="22" stroke="#000000" strokeWidth="1.2" />
                <line x1="-22" y1="0" x2="22" y2="0" stroke="#000000" strokeWidth="1.2" />
                {/* North arrow */}
                <path d="M 0 -22 L 5 0 L -5 0 Z" fill="#000000" />
                <path d="M 0 22 L 4 0 L -4 0 Z" fill="#9ca3af" />
                <path d="M 22 0 L 0 4 L 0 -4 Z" fill="#9ca3af" />
                <path d="M -22 0 L 0 4 L 0 -4 Z" fill="#9ca3af" />
                <text x="0" y="-26" fill="#000000" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">U</text>
                <text x="0" y="34" fill="#000000" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">S</text>
                <text x="-28" y="3.5" fill="#000000" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">B</text>
                <text x="28" y="3.5" fill="#000000" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">T</text>
              </g>

              {/* 8. SCALE BAR (0, 0.15, 0.3, 0.6, 0.9, 1.2 KM) in D6 - D8 */}
              <g transform="translate(1080, 740)">
                <rect x="0" y="0" width="360" height="24" fill="#000000" rx="3" opacity="0.85" />
                <g fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="sans-serif">
                  <text x="15" y="16">0</text>
                  <text x="60" y="16">0,15</text>
                  <text x="115" y="16">0,3</text>
                  <text x="180" y="16">0,6</text>
                  <text x="245" y="16">0,9</text>
                  <text x="310" y="16">1,2 KM</text>
                </g>
                {/* Alternating black/white scale ticks */}
                <rect x="15" y="4" width="45" height="3" fill="#ffffff" />
                <rect x="60" y="4" width="55" height="3" fill="#9ca3af" />
                <rect x="115" y="4" width="65" height="3" fill="#ffffff" />
                <rect x="180" y="4" width="65" height="3" fill="#9ca3af" />
                <rect x="245" y="4" width="65" height="3" fill="#ffffff" />
              </g>

            </svg>

            {/* GRID OVERLAY TABLE (8 Columns x 4 Rows) */}
            <div className="absolute inset-0 flex flex-col pointer-events-auto">
              
              {/* TOP HEADER ROW: Columns 1..8 */}
              <div className={`flex ${compact ? 'h-[8.5%]' : 'h-[7%]'} w-full bg-white text-black font-sans font-extrabold ${compact ? 'text-[10px]' : 'text-[11px] sm:text-xs'} border-b-2 border-black`}>
                {/* Top-Left Corner Cell */}
                <div className="w-[4%] flex items-center justify-center border-r-2 border-black bg-slate-100 text-[9px]">
                  #
                </div>

                {/* Columns 1 to 8 */}
                {GRID_COLS.map((col) => (
                  <div 
                    key={`top-col-${col}`} 
                    className="flex-1 flex items-center justify-center border-r border-black/80 font-bold bg-white text-black"
                  >
                    {col}
                  </div>
                ))}

                {/* Top-Right Corner Cell */}
                <div className="w-[4%] flex items-center justify-center border-l-2 border-black bg-slate-100 text-[9px]">
                  #
                </div>
              </div>

              {/* GRID BODY: 4 Rows (A, B, C, D) */}
              <div className="flex-1 flex flex-col w-full">
                {GRID_ROWS.map((row) => (
                  <div key={`row-${row}`} className="flex-1 flex w-full border-b border-black/70">
                    
                    {/* Left Row Header (A..D) */}
                    <div className={`w-[4%] bg-white text-black font-sans font-extrabold ${compact ? 'text-[10px]' : 'text-xs sm:text-sm'} flex items-center justify-center border-r-2 border-black`}>
                      {row}
                    </div>

                    {/* 8 Columns in this Row */}
                    {GRID_COLS.map((col) => {
                      const cellCode = `${row}${col}`;
                      const isSelected = selectedCell === cellCode;
                      const isHovered = hoveredCell === cellCode;
                      const isHighlighted = highlightCells.includes(cellCode);
                      const cellFindings = findingsByCell.get(cellCode) || [];
                      const hasFindings = cellFindings.length > 0;
                      const heatInfo = heatmapData?.[cellCode];
                      const heatCount = heatInfo?.findingsCount || 0;

                      // Heatmap color calculation
                      let heatBgStyle = 'transparent';
                      if (mode === 'heatmap' && heatCount > 0) {
                        const intensity = Math.min(heatCount / maxHeatmapCount, 1);
                        if (intensity > 0.65) {
                          heatBgStyle = `rgba(239, 68, 68, ${0.5 + intensity * 0.4})`; // Red
                        } else if (intensity > 0.35) {
                          heatBgStyle = `rgba(245, 158, 11, ${0.45 + intensity * 0.4})`; // Amber
                        } else {
                          heatBgStyle = `rgba(234, 179, 8, ${0.35 + intensity * 0.4})`; // Yellow
                        }
                      }

                      return (
                        <div
                          key={cellCode}
                          id={`grid-cell-${cellCode}`}
                          onClick={() => handleCellClick(cellCode)}
                          onMouseEnter={() => setHoveredCell(cellCode)}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`flex-1 relative border-r border-black/40 flex items-center justify-center transition-all duration-100 ${
                            interactive ? 'cursor-pointer' : 'cursor-default'
                          } ${
                            isSelected 
                              ? 'bg-amber-400/50 ring-2 ring-amber-500 ring-inset z-20 shadow-md' 
                              : isHovered && interactive
                              ? 'bg-emerald-300/40 ring-1 ring-emerald-500 z-10'
                              : isHighlighted
                              ? 'bg-amber-300/40 ring-1 ring-amber-500'
                              : ''
                          }`}
                          style={{
                            backgroundColor: isSelected ? undefined : heatBgStyle !== 'transparent' ? heatBgStyle : undefined
                          }}
                        >
                          {/* Corner Coordinate watermark label for ultra clear reference */}
                          <span className={`absolute top-0.5 left-1 font-mono ${compact ? 'text-[8px]' : 'text-[9px]'} font-bold text-white/50 pointer-events-none drop-shadow-xs`}>
                            {cellCode}
                          </span>

                          {/* Selected Active Marker */}
                          {isSelected && (
                            <div className="flex flex-col items-center justify-center animate-bounce z-30 pointer-events-none">
                              <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-rose-600 fill-rose-500 drop-shadow-md" />
                              <span className="bg-black text-white font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded shadow -mt-1">
                                {cellCode}
                              </span>
                            </div>
                          )}

                          {/* Mode: Markers on Grid (for specific report logbook) */}
                          {(mode === 'markers' || mode === 'readonly') && hasFindings && !isSelected && (
                            <div className={`flex flex-col items-center justify-center z-20 pointer-events-none ${compact ? 'scale-75' : 'scale-90 sm:scale-100'}`}>
                              <div className="relative flex items-center justify-center">
                                <div className={`${compact ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 sm:w-7 sm:h-7 text-xs'} rounded-full bg-rose-600 text-white font-bold flex items-center justify-center shadow-lg ring-2 ring-white`}>
                                  {cellFindings[0].no}
                                </div>
                                {cellFindings.length > 1 && (
                                  <span className="absolute -top-1 -right-2 bg-amber-400 text-black font-black text-[9px] px-1 rounded-full border border-black shadow">
                                    +{cellFindings.length - 1}
                                  </span>
                                )}
                              </div>
                              <span className={`bg-black/90 text-white ${compact ? 'text-[8px] px-1 py-0.2 max-w-[70px]' : 'text-[9px] px-1.5 py-0.5 max-w-[80px]'} rounded truncate text-center font-bold mt-0.5 shadow-md border border-white/30`}>
                                {cellFindings[0].namaSpesies.split(' ')[0]} ({cellFindings.reduce((acc, curr) => acc + curr.jumlah, 0)})
                              </span>
                            </div>
                          )}

                          {/* Mode: Heatmap Count Badge */}
                          {mode === 'heatmap' && heatCount > 0 && !isSelected && (
                            <div className="flex flex-col items-center justify-center z-10 pointer-events-none">
                              <span className={`font-mono font-black text-xs sm:text-sm px-2 py-0.5 rounded-full shadow-md border ${
                                heatCount >= 5 
                                  ? 'bg-rose-600 text-white border-rose-200 ring-2 ring-rose-400' 
                                  : heatCount >= 3 
                                  ? 'bg-amber-500 text-black border-amber-200 ring-1 ring-amber-300' 
                                  : 'bg-emerald-600 text-white border-emerald-200'
                              }`}>
                                {heatCount}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Right Row Header (A..D) */}
                    <div className={`w-[4%] bg-white text-black font-sans font-extrabold ${compact ? 'text-[10px]' : 'text-xs sm:text-sm'} flex items-center justify-center border-l-2 border-black`}>
                      {row}
                    </div>
                  </div>
                ))}
              </div>

              {/* BOTTOM FOOTER ROW: Columns 1..8 */}
              <div className={`flex ${compact ? 'h-[8.5%]' : 'h-[7%]'} w-full bg-white text-black font-sans font-extrabold ${compact ? 'text-[10px]' : 'text-[11px] sm:text-xs'} border-t-2 border-black`}>
                {/* Bottom-Left Corner */}
                <div className="w-[4%] flex items-center justify-center border-r-2 border-black bg-slate-100 text-[9px]">
                  #
                </div>

                {/* Columns 1 to 8 */}
                {GRID_COLS.map((col) => (
                  <div 
                    key={`bottom-col-${col}`} 
                    className="flex-1 flex items-center justify-center border-r border-black/80 font-bold bg-white text-black"
                  >
                    {col}
                  </div>
                ))}

                {/* Bottom-Right Corner */}
                <div className="w-[4%] flex items-center justify-center border-l-2 border-black bg-slate-100 text-[9px]">
                  #
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Official Map Legend / Keterangan (Identical to Appendix 3.a) */}
      {showLegend && (
        <div className={`${compact ? 'p-1.5' : 'p-3'} bg-[#FBFBFA] border-t border-black/60 text-black font-sans`}>
          <div className={`font-extrabold ${compact ? 'text-[9px] mb-1' : 'text-xs mb-1.5'} uppercase text-black flex items-center justify-between`}>
            <span>KETERANGAN FASILITAS & JALUR OPERASI:</span>
            {hoveredCell && (
              <span className="font-mono text-xs bg-black text-white px-2 py-0.5 rounded font-bold">
                Grid: {hoveredCell} {heatmapData?.[hoveredCell] ? `(${heatmapData[hoveredCell].findingsCount} temuan)` : ''}
              </span>
            )}
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-4 ${compact ? 'gap-x-2 gap-y-0.5 text-[8.5px] leading-tight' : 'gap-2 text-[10px] leading-tight'}`}>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'w-3 h-3 text-[7.5px]' : 'w-4 h-4 text-[9px]'} rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0`}>1</span>
                <span className="truncate">PKP-PK (ARFF)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'w-3 h-3 text-[7.5px]' : 'w-4 h-4 text-[9px]'} rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center shrink-0`}>2</span>
                <span className="truncate">Gedung Teknisi</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'w-3 h-3 text-[7.5px]' : 'w-4 h-4 text-[9px]'} rounded-full bg-green-600 text-white font-bold flex items-center justify-center shrink-0`}>3</span>
                <span className="truncate">Meteorologi (BMKG)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'w-3 h-3 text-[7.5px]' : 'w-4 h-4 text-[9px]'} rounded-full bg-pink-600 text-white font-bold flex items-center justify-center shrink-0`}>4</span>
                <span className="truncate">Kantor Tata Usaha</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'w-3 h-3 text-[7.5px]' : 'w-4 h-4 text-[9px]'} rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0`}>5</span>
                <span className="truncate">Tower (ATC)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'w-3 h-3 text-[7.5px]' : 'w-4 h-4 text-[9px]'} rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center shrink-0`}>6</span>
                <span className="truncate">Terminal Penumpang</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'w-3 h-3 text-[7.5px]' : 'w-4 h-4 text-[9px]'} rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0`}>7</span>
                <span className="truncate">AVSEC</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'w-3 h-3 text-[7.5px]' : 'w-4 h-4 text-[9px]'} rounded-full bg-amber-600 text-black font-bold flex items-center justify-center shrink-0`}>8</span>
                <span className="truncate">Cargo</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} rounded-full bg-red-600 border border-black inline-block shrink-0`}></span>
                <span className="truncate">Isolated Area</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'w-2.5 h-2.5 text-[7px]' : 'w-3.5 h-3.5 text-[8px]'} rounded-full bg-yellow-400 border border-black flex items-center justify-center font-bold shrink-0`}>+</span>
                <span className="truncate">Staging Area</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'text-[8px]' : 'text-[10px]'} text-red-600 font-bold shrink-0`}>▲</span>
                <span className="truncate">Rendezvous Point</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'text-[8px]' : 'text-[10px]'} text-blue-600 shrink-0`}>💧</span>
                <span className="truncate">Sumber Air / Kolam</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'w-3 h-0.5' : 'w-4 h-1'} bg-red-600 inline-block shrink-0`}></span>
                <span className="truncate">Pagar Bandara</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'w-3 h-0.5' : 'w-4 h-1'} bg-yellow-400 border-b border-black inline-block shrink-0`}></span>
                <span className="truncate">Jalur Utama Darurat</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'w-3 h-0.5' : 'w-4 h-1'} bg-lime-500 border-b border-dashed border-black inline-block shrink-0`}></span>
                <span className="truncate">Akses Evakuasi</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`${compact ? 'w-3 h-0.5' : 'w-4 h-1'} bg-sky-400 border-b border-dashed border-black inline-block shrink-0`}></span>
                <span className="truncate">Batas Tanggung Jawab</span>
              </div>
            </div>
          </div>

          {mode === 'picker' && interactive && (
            <div className="mt-2 text-[10px] text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200 font-medium">
              💡 <strong>Petunjuk Petugas:</strong> Klik salah satu kotak grid (contoh: <code>B3</code>, <code>C6</code>, <code>D2</code>) untuk langsung memasukkan koordinat lokasi temuan hewan liar ke formulir laporan.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
