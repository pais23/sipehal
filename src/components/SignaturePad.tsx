import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Check, PenTool } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface SignaturePadProps {
  value?: string; // Base64 data URL
  onChange: (signatureBase64: string) => void;
  officerName?: string;
  required?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  value,
  onChange,
  officerName = '',
  required = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(Boolean(value));
  
  // Store vector strokes in ref so they survive any react re-renders
  const strokesRef = useRef<Point[][]>([]);
  const currentStrokeRef = useRef<Point[]>([]);
  const isPointerDownRef = useRef(false);

  // Redraw all strokes cleanly onto the canvas
  const redrawStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const targetWidth = Math.floor(rect.width * dpr);
    const targetHeight = Math.floor(rect.height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // If we have vector strokes, draw them
    if (strokesRef.current.length > 0 || currentStrokeRef.current.length > 0) {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Draw all completed strokes
      strokesRef.current.forEach((stroke) => {
        if (stroke.length === 0) return;
        if (stroke.length === 1) {
          ctx.beginPath();
          ctx.arc(stroke[0].x, stroke[0].y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#0f172a';
          ctx.fill();
          return;
        }

        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          const midX = (stroke[i - 1].x + stroke[i].x) / 2;
          const midY = (stroke[i - 1].y + stroke[i].y) / 2;
          ctx.quadraticCurveTo(stroke[i - 1].x, stroke[i - 1].y, midX, midY);
        }
        const last = stroke[stroke.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      });

      // Draw current active stroke
      if (currentStrokeRef.current.length > 0) {
        const stroke = currentStrokeRef.current;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          const midX = (stroke[i - 1].x + stroke[i].x) / 2;
          const midY = (stroke[i - 1].y + stroke[i].y) / 2;
          ctx.quadraticCurveTo(stroke[i - 1].x, stroke[i - 1].y, midX, midY);
        }
        ctx.stroke();
      }
    } else if (value) {
      // Draw from existing value image
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const currentCtx = canvasRef.current.getContext('2d');
        if (!currentCtx) return;
        currentCtx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = value;
    }

    ctx.restore();
  }, [value]);

  // Initial setup & resize handling
  useEffect(() => {
    redrawStrokes();

    const handleResize = () => {
      redrawStrokes();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawStrokes]);

  // Sync state if external value changes
  useEffect(() => {
    if (value) {
      setHasContent(true);
      if (strokesRef.current.length === 0) {
        redrawStrokes();
      }
    } else if (strokesRef.current.length === 0) {
      setHasContent(false);
    }
  }, [value, redrawStrokes]);

  // Helper to extract canvas coordinates from pointer event
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Pointer Event Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }

    isPointerDownRef.current = true;
    setIsDrawing(true);
    setHasContent(true);

    const pt = getCoordinates(e);
    currentStrokeRef.current = [pt];
    redrawStrokes();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    const pt = getCoordinates(e);
    currentStrokeRef.current.push(pt);
    redrawStrokes();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // safe fallback
      }

      if (currentStrokeRef.current.length > 0) {
        strokesRef.current.push([...currentStrokeRef.current]);
      }
      currentStrokeRef.current = [];
      redrawStrokes();

      // Export high quality transparent signature PNG
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
      setHasContent(true);
    }
  };

  const handlePointerCancel = () => {
    isPointerDownRef.current = false;
    setIsDrawing(false);
    currentStrokeRef.current = [];
    redrawStrokes();
  };

  // Clear / Reset signature
  const handleClear = () => {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    isPointerDownRef.current = false;
    setIsDrawing(false);
    setHasContent(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width * dpr, rect.height * dpr);
      }
    }
    
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-semibold text-[#2D332F] flex items-center gap-1.5">
          <PenTool className="w-4 h-4 text-[#4A5D4E]" />
          Tanda Tangan Digital Petugas
          {required && <span className="text-rose-500">*</span>}
        </label>

        <button
          type="button"
          id="btn-clear-signature"
          onClick={handleClear}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#5F6B63] hover:text-rose-600 bg-[#F1F3F0] hover:bg-rose-50 px-2.5 py-1 rounded-md border border-[#E9E5DE] hover:border-rose-200 transition-colors"
        >
          <Eraser className="w-3.5 h-3.5" />
          Hapus / Ulangi
        </button>
      </div>

      {/* Signature Canvas Box */}
      <div 
        ref={containerRef}
        className="relative w-full h-44 sm:h-48 bg-[#FDFCFB] border-2 border-dashed border-[#D6CEC4] rounded-xl overflow-hidden shadow-inner focus-within:border-[#4A5D4E] focus-within:ring-2 focus-within:ring-[#4A5D4E]/20"
      >
        {/* Canvas Element with touch-action: none for mobile finger signing */}
        <canvas
          ref={canvasRef}
          id="canvas-signature-pad"
          className="w-full h-full cursor-crosshair touch-none select-none block"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        />

        {/* Baseline / Watermark Guide */}
        <div className="absolute bottom-6 left-6 right-6 border-b border-[#D6CEC4] pointer-events-none flex items-center justify-between text-[11px] text-[#8A958E]">
          <span className="bg-[#FDFCFB]/90 px-1.5 font-mono">Tanda Tangan di atas garis ini</span>
          {officerName && (
            <span className="bg-[#FDFCFB]/90 px-1.5 font-semibold text-[#2D332F] truncate max-w-[200px]">
              ( {officerName} )
            </span>
          )}
        </div>

        {/* Empty State Prompt */}
        {!hasContent && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-[#8A958E] gap-1">
            <PenTool className="w-6 h-6 stroke-1 text-[#D6CEC4]" />
            <p className="text-xs text-[#8A958E] font-medium">Goreskan tanda tangan memakai jari, stylus, atau mouse</p>
          </div>
        )}

        {/* Signed Status Indicator */}
        {hasContent && (
          <div className="absolute top-2 right-2 pointer-events-none bg-[#E8EDE7] border border-[#DCE4DC] text-[#4A5D4E] px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 shadow-xs">
            <Check className="w-3.5 h-3.5 text-[#4A5D4E]" />
            Tanda Tangan Tersimpan
          </div>
        )}
      </div>

      <p className="text-[11px] text-[#5F6B63]">
        * Mendukung sentuhan layar HP/tablet (finger touch & stylus pen) serta trackpad/mouse PC secara otomatis.
      </p>
    </div>
  );
};
