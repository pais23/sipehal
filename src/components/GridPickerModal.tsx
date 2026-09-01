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
        <div className="flex items-center justify-between px-4 py-3 bg-[#232D25] border-b border-[#3B4A3E]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#4A5D4E]/40 text-[#FDE68A] flex items-center justify-center border border-[#4A5D4E]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F8F7F2] leading-tight">{title}</h3>
              <p className="text-xs text-[#A8B4AB]">Peta Grid Bandara H. AS. Hanandjoeddin (Baris A-D & Kolom 1-8)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#A8B4AB] hover:text-white hover:bg-[#3B4A3E] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1 bg-[#1F2721]">
          
          {/* Active selection bar */}
          <div className="flex flex-wrap items-center justify-between bg-[#28332A] p-3 rounded-xl border border-[#3B4A3E] gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#D1D9D3] font-medium">Titik Grid Dipilih:</span>
              <span className="font-mono text-base font-black px-3 py-0.5 bg-[#D97706] text-white rounded-lg shadow-sm">
                {tempSelection || 'Belum Dipilih'}
              </span>
            </div>

            {/* Quick row selector for rapid picking */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
              <span className="text-[11px] text-[#A8B4AB] mr-1 hidden sm:inline">Filter Baris:</span>
              <button
                type="button"
                onClick={() => setFilterRow('all')}
                className={`px-2 py-0.5 text-xs font-mono rounded ${filterRow === 'all' ? 'bg-[#4A5D4E] text-white font-bold' : 'bg-[#354338] text-[#D1D9D3] hover:bg-[#4A5D4E]'}`}
              >
                Semua
              </button>
              {GRID_ROWS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRow(r)}
                  className={`px-1.5 py-0.5 text-xs font-mono font-bold rounded ${filterRow === r ? 'bg-[#4A5D4E] text-white' : 'bg-[#354338] text-[#D1D9D3] hover:bg-[#4A5D4E]'}`}
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
          <div className="bg-[#28332A] p-2.5 rounded-xl border border-[#3B4A3E]">
            <div className="text-[11px] font-semibold text-[#D1D9D3] mb-2 flex items-center justify-between">
              <span>Pilihan Cepat Koordinat Grid (A1 - D8):</span>
              <span className="text-[#A8B4AB] text-[10px]">Ketuk kode sel langsung di bawah atau pada peta</span>
            </div>

            <div className="grid grid-cols-8 gap-1.5">
              {(filterRow === 'all' ? GRID_ROWS : [filterRow as any]).flatMap(row => 
                GRID_COLS.map(col => {
                  const code = `${row}${col}`;
                  const isSelected = tempSelection === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setTempSelection(code)}
                      className={`h-8 text-xs font-mono font-bold rounded transition-all flex items-center justify-center border ${
                        isSelected 
                          ? 'bg-[#D97706] text-white border-[#FDE68A] ring-2 ring-[#D97706]/50 scale-105 z-10 font-black' 
                          : 'bg-[#232D25] text-[#D1D9D3] border-[#3B4A3E] hover:bg-[#3B4A3E] hover:text-white'
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
        <div className="flex items-center justify-between px-4 py-3 bg-[#232D25] border-t border-[#3B4A3E]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#D1D9D3] hover:text-white hover:bg-[#3B4A3E] rounded-xl transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            id="btn-confirm-grid-selection"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#4A5D4E] hover:bg-[#3B4A3E] rounded-xl shadow-md transition-all active:scale-95 border border-[#617666]"
          >
            <Check className="w-4 h-4 text-[#A7F3D0]" />
            Terapkan Lokasi ({tempSelection})
          </button>
        </div>
      </div>
    </div>
  );
};
