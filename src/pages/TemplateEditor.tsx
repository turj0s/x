import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { toast } from 'sonner';
import { ArrowLeft, Download, Plus, Trash2, Type, Bold, Italic } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Template {
  id: string;
  title: string;
  background_image_url: string;
}

interface TextBox {
  id: string;
  x: number; // percent 0..100
  y: number; // percent 0..100
  w: number; // percent width
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  bg: string; // background color to cover template text ('transparent' or hex)
}

const uid = () => Math.random().toString(36).slice(2, 10);

const STORAGE_KEY = (id: string) => `cv-overlay:${id}`;

const FONTS = ['Inter', 'Georgia', 'Times New Roman', 'Courier New', 'Arial'];
const COLORS = ['#111111', '#333333', '#555555', '#1E40AF', '#B91C1C', '#047857', '#B45309', '#FFFFFF'];

const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [boxes, setBoxes] = useState<TextBox[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  // Load template + saved boxes whenever template id changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      setBoxes([]);
      setSelectedId(null);
      setImgSize(null);
      const { data, error } = await supabase
        .from('events')
        .select('id, title, background_image_url')
        .eq('id', id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast.error('Template not found');
        navigate('/');
        return;
      }
      setTemplate(data as Template);
      try {
        const raw = localStorage.getItem(STORAGE_KEY(data.id));
        const parsed: TextBox[] = raw ? JSON.parse(raw) : [];
        setBoxes(parsed.map((b) => ({ bg: '#FFFFFF', ...b })));
      } catch {
        setBoxes([]);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, navigate]);

  // Autosave per-template
  useEffect(() => {
    if (!id || loading) return;
    const t = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY(id), JSON.stringify(boxes)); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [boxes, id, loading]);

  const selected = boxes.find((b) => b.id === selectedId) || null;

  const addBox = () => {
    const nb: TextBox = {
      id: uid(),
      x: 30,
      y: 20,
      w: 40,
      text: 'Double-click to edit',
      fontSize: 16,
      fontFamily: 'Inter',
      color: '#111111',
      bold: false,
      italic: false,
      align: 'left',
      bg: '#FFFFFF',
    };
    setBoxes((p) => [...p, nb]);
    setSelectedId(nb.id);
  };

  const patchBox = (bid: string, patch: Partial<TextBox>) =>
    setBoxes((p) => p.map((b) => (b.id === bid ? { ...b, ...patch } : b)));

  const removeBox = (bid: string) => {
    setBoxes((p) => p.filter((b) => b.id !== bid));
    if (selectedId === bid) setSelectedId(null);
  };

  const onPointerDownBox = (e: React.PointerEvent, b: TextBox) => {
    if ((e.target as HTMLElement).getAttribute('contenteditable') === 'true') return;
    if (!paperRef.current) return;
    setSelectedId(b.id);
    const rect = paperRef.current.getBoundingClientRect();
    dragRef.current = {
      id: b.id,
      startX: (e.clientX / rect.width) * 100,
      startY: (e.clientY / rect.height) * 100,
      origX: b.x,
      origY: b.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMoveBox = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || !paperRef.current) return;
    const rect = paperRef.current.getBoundingClientRect();
    const dx = (e.clientX / rect.width) * 100 - d.startX;
    const dy = (e.clientY / rect.height) * 100 - d.startY;
    patchBox(d.id, {
      x: Math.max(0, Math.min(95, d.origX + dx)),
      y: Math.max(0, Math.min(98, d.origY + dy)),
    });
  };
  const onPointerUpBox = () => { dragRef.current = null; };

  const exportPdf = async () => {
    if (!paperRef.current || !imgSize) return;
    setExporting(true);
    setSelectedId(null);
    (document.activeElement as HTMLElement | null)?.blur();
    await new Promise((r) => setTimeout(r, 80));
    try {
      const canvas = await html2canvas(paperRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const orientation = imgSize.w > imgSize.h ? 'landscape' : 'portrait';
      const pdf = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      pdf.addImage(imgData, 'JPEG', (pageW - w) / 2, (pageH - h) / 2, w, h);
      pdf.save(`${(template?.title || 'cv').replace(/\s+/g, '_')}.pdf`);
      toast.success('PDF downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Could not export PDF');
    } finally {
      setExporting(false);
    }
  };

  const resetBoxes = () => {
    if (!window.confirm('Remove all text boxes on this template?')) return;
    setBoxes([]);
    setSelectedId(null);
  };

  if (loading || !template) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex h-screen items-center justify-center text-[#1A1A1A] text-2xl">
          Loading editor...
        </div>
      </div>
    );
  }

  const paperWidth = 800;
  const paperHeight = imgSize ? (paperWidth * imgSize.h) / imgSize.w : 1130;

  return (
    <>
      <SEOHead title={`Edit ${template.title}`} description="Edit CV template in real time and download as PDF." />
      <div className="min-h-screen bg-[#EDEDED]">
        <Navbar />
        <div className="pt-20 md:pt-24 flex flex-col lg:flex-row gap-4 lg:gap-6 px-3 md:px-6 pb-10">
          {/* Toolbar */}
          <aside className="lg:w-72 w-full bg-white border border-black p-4 lg:sticky lg:top-24 h-fit space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[11px] uppercase tracking-wider hover:opacity-70"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <h2 className="text-[11px] uppercase tracking-wider font-medium">{template.title}</h2>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Add text on top of the template. Drag to move, double-click to edit.
            </p>

            <button
              onClick={addBox}
              className="w-full flex items-center justify-center gap-2 border border-black bg-white text-black px-3 py-2 text-[12px] uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" /> Add text
            </button>

            {selected && (
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="text-[10px] uppercase tracking-wider text-gray-500">Style</div>
                <select
                  value={selected.fontFamily}
                  onChange={(e) => patchBox(selected.id, { fontFamily: e.target.value })}
                  className="w-full border border-gray-300 text-[12px] p-1"
                >
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <Type className="w-3 h-3 text-gray-500" />
                  <input
                    type="number" min={8} max={120}
                    value={selected.fontSize}
                    onChange={(e) => patchBox(selected.id, { fontSize: Number(e.target.value) })}
                    className="w-full border border-gray-300 text-[12px] p-1"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => patchBox(selected.id, { bold: !selected.bold })}
                    className={`flex-1 border border-gray-300 p-1 text-[12px] ${selected.bold ? 'bg-black text-white' : ''}`}
                  ><Bold className="w-3 h-3 inline" /></button>
                  <button
                    onClick={() => patchBox(selected.id, { italic: !selected.italic })}
                    className={`flex-1 border border-gray-300 p-1 text-[12px] ${selected.italic ? 'bg-black text-white' : ''}`}
                  ><Italic className="w-3 h-3 inline" /></button>
                </div>
                <div className="flex items-center gap-1">
                  {(['left','center','right'] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => patchBox(selected.id, { align: a })}
                      className={`flex-1 border border-gray-300 p-1 text-[10px] uppercase ${selected.align === a ? 'bg-black text-white' : ''}`}
                    >{a}</button>
                  ))}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Width %</div>
                  <input
                    type="range" min={10} max={100}
                    value={selected.w}
                    onChange={(e) => patchBox(selected.id, { w: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Color</div>
                  <div className="flex flex-wrap gap-1">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => patchBox(selected.id, { color: c })}
                        style={{ background: c }}
                        className={`w-6 h-6 border ${selected.color === c ? 'border-black ring-2 ring-black' : 'border-gray-300'}`}
                        aria-label={c}
                      />
                    ))}
                    <input
                      type="color"
                      value={selected.color}
                      onChange={(e) => patchBox(selected.id, { color: e.target.value })}
                      className="w-6 h-6 border border-gray-300 p-0"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeBox(selected.id)}
                  className="w-full flex items-center justify-center gap-2 border border-red-500 text-red-600 px-3 py-1.5 text-[11px] uppercase tracking-wider hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete text
                </button>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3 space-y-2">
              <button
                onClick={exportPdf}
                disabled={exporting}
                className="w-full flex items-center justify-center gap-2 border border-black bg-[#1A1A1A] text-white px-3 py-2 text-[12px] uppercase tracking-wider hover:bg-[#FA76FF] hover:text-black transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> {exporting ? 'Exporting…' : 'Download PDF'}
              </button>
              <button
                onClick={resetBoxes}
                className="w-full text-[11px] uppercase tracking-wider text-gray-500 hover:text-black py-1"
              >
                Clear all text
              </button>
            </div>
          </aside>

          {/* Paper */}
          <div className="flex-1 flex justify-center">
            <div
              ref={paperRef}
              onPointerDown={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}
              className="bg-white shadow-lg relative select-none"
              style={{ width: paperWidth, height: paperHeight }}
            >
              <img
                src={template.background_image_url}
                alt={template.title}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
                }}
                onError={() => setImgSize({ w: 800, h: 1130 })}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                draggable={false}
              />
              {boxes.map((b) => (
                <div
                  key={b.id}
                  onPointerDown={(e) => onPointerDownBox(e, b)}
                  onPointerMove={onPointerMoveBox}
                  onPointerUp={onPointerUpBox}
                  onClick={() => setSelectedId(b.id)}
                  style={{
                    position: 'absolute',
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    width: `${b.w}%`,
                    cursor: 'move',
                    padding: '2px 4px',
                    outline: selectedId === b.id ? '1.5px dashed #FA76FF' : '1px dashed transparent',
                    background: selectedId === b.id ? 'rgba(255,255,255,0.35)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (selectedId !== b.id) e.currentTarget.style.outline = '1px dashed rgba(0,0,0,0.35)'; }}
                  onMouseLeave={(e) => { if (selectedId !== b.id) e.currentTarget.style.outline = '1px dashed transparent'; }}
                >
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onDoubleClick={(e) => (e.currentTarget as HTMLElement).focus()}
                    onBlur={(e) => patchBox(b.id, { text: e.currentTarget.innerText })}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{
                      outline: 'none',
                      fontFamily: b.fontFamily,
                      fontSize: b.fontSize,
                      color: b.color,
                      fontWeight: b.bold ? 700 : 400,
                      fontStyle: b.italic ? 'italic' : 'normal',
                      textAlign: b.align,
                      lineHeight: 1.25,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {b.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateEditor;
