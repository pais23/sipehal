import React, { useState } from 'react';
import { AirportGridMap } from './AirportGridMap';
import { GRID_ROWS, GRID_COLS } from '../data/initialData';
import { X, Check, MapPin, Search } from 'lucide-react';

interface GridPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentValue: string;
  onSelect: (gridCode: string) => void;
  title?: string;
}

export const GridPickerModal: React.FC<GridPickerModalProps> = ({
  isOpen,
  onClose,
  currentValue,
  onSelect,
  title = 'Pilih Titik Lokasi Grid Bandara'
}) => {
  const [tempSelection, setTempSelection] = useState<string>(currentValue || 'B3');
  const [filterRow, setFilterRow] = useState<string>('all');

  if (!isOpen) return null;

  const handleCellTap = (code: string) => {
    setTempSelection(code);
  };

  const handleConfirm = () => {
    onSelect(tempSelection);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#2D332F]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl bg-[#2D3A2F] border border-[#4A5D4E] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#071529] border-b border-[#1A3358]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#0E2A54] text-[#38BDF8] flex items-center justify-center border border-[#1E3A66]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{title}</h3>
              <p className="text-xs text-[#94A3B8]">Peta Grid Bandara H. AS. Hanandjoeddin (Baris A-D & Kolom 1-8)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-[#162E52] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3.5 flex-1 bg-slate-900 text-slate-100">
          
          {/* Active selection bar */}
          <div className="flex flex-wrap items-center justify-between bg-slate-800/90 p-3 rounded-xl border border-slate-700 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">Titik Grid Dipilih:</span>
              <span className="font-mono text-base font-black px-3 py-1 bg-sky-500 text-white rounded-lg shadow-sm">
                {tempSelection || 'Belum Dipilih'}
              </span>
            </div>

            {/* Quick row selector for rapid picking */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
              <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Filter Baris:</span>
              <button
                type="button"
                onClick={() => setFilterRow('all')}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${filterRow === 'all' ? 'bg-sky-600 text-white font-bold' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                Semua
              </button>
              {GRID_ROWS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRow(r)}
                  className={`px-2 py-1 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${filterRow === r ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Airport Interactive Map */}
          <AirportGridMap
            mode="picker"
            selectedCell={tempSelection}
            onSelectCell={handleCellTap}
            interactive={true}
          />

          {/* Quick Grid Matrix Keypad for fast touch selection */}
          <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
            <div className="text-[11px] font-semibold text-slate-300 mb-2.5 flex items-center justify-between">
              <span>Pilihan Cepat Koordinat Grid (A1 - D8):</span>
              <span className="text-slate-400 text-[10px] hidden sm:inline">Ketuk kode sel langsung di bawah atau pada peta</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
              {(filterRow === 'all' ? GRID_ROWS : [filterRow as any]).flatMap(row => 
                GRID_COLS.map(col => {
                  const code = `${row}${col}`;
                  const isSelected = tempSelection === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setTempSelection(code)}
                      className={`h-10 text-xs sm:text-sm font-mono font-bold rounded-xl transition-all flex items-center justify-center border cursor-pointer active:scale-95 ${
                        isSelected 
                          ? 'bg-sky-500 text-white border-sky-300 ring-2 ring-sky-400/50 scale-105 z-10 font-black shadow-md' 
                          : 'bg-slate-700/80 text-slate-200 border-slate-600 hover:bg-slate-600 hover:text-white'
                      }`}
                    >
                      {code}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#071529] border-t border-[#1A3358]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#CBD5E1] hover:text-white hover:bg-[#162E52] rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            id="btn-confirm-grid-selection"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-xl shadow-md transition-all active:scale-95 border border-[#38BDF8]/40 cursor-pointer"
          >
            <Check className="w-4 h-4 text-white" />
            Terapkan Lokasi ({tempSelection})
          </button>
        </div>
      </div>
    </div>
  );
};
