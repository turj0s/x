import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { toast } from 'sonner';
import { Bold, Italic, Trash2, Plus, Download, Type, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface TextElement {
  id: string;
  x: number; // px relative to canvas
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  width: number;
}

interface Template {
  id: string;
  title: string;
  background_image_url: string;
}

const FONTS = [
  'Inter, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'Courier New, monospace',
  'Helvetica, Arial, sans-serif',
];

const COLORS = ['#000000', '#1A1A1A', '#333333', '#666666', '#0F3460', '#B00020', '#0A6E31', '#FA76FF'];

const uid = () => Math.random().toString(36).slice(2, 10);

const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [elements, setElements] = useState<TextElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number }>({ w: 800, h: 1100 });
  const [exporting, setExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('events')
        .select('id, title, background_image_url')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) {
        toast.error('Template not found');
        navigate('/');
        return;
      }
      setTemplate(data);
      setLoading(false);
    })();
  }, [id, navigate]);

  const selected = elements.find((e) => e.id === selectedId) || null;

  const addText = () => {
    const el: TextElement = {
      id: uid(),
      x: imgSize.w / 2 - 100,
      y: 40,
      text: 'Double-click to edit',
      fontSize: 18,
      fontFamily: FONTS[0],
      color: '#000000',
      bold: false,
      italic: false,
      width: 240,
    };
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  };

  const update = (id: string, patch: Partial<TextElement>) => {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const remove = (id: string) => {
    setElements((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const onPointerDown = (e: React.PointerEvent, el: TextElement) => {
    if ((e.target as HTMLElement).isContentEditable) return;
    e.preventDefault();
    setSelectedId(el.id);
    const rect = canvasRef.current!.getBoundingClientRect();
    dragState.current = {
      id: el.id,
      offsetX: e.clientX - rect.left - el.x,
      offsetY: e.clientY - rect.top - el.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const ds = dragState.current;
    if (!ds) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(imgSize.w - 20, e.clientX - rect.left - ds.offsetX));
    const y = Math.max(0, Math.min(imgSize.h - 20, e.clientY - rect.top - ds.offsetY));
    update(ds.id, { x, y });
  };

  const onPointerUp = () => {
    dragState.current = null;
  };

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Use natural aspect ratio, cap width at 900
    const maxW = 900;
    const ratio = img.naturalHeight / img.naturalWidth;
    const w = Math.min(maxW, img.naturalWidth);
    setImgSize({ w, h: w * ratio });
  };

  const exportPdf = async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    setSelectedId(null);
    // Wait for React re-render to drop selection outlines
    await new Promise((r) => setTimeout(r, 60));
    try {
      const canvas = await html2canvas(canvasRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: imgSize.h > imgSize.w ? 'portrait' : 'landscape',
        unit: 'pt',
        format: [imgSize.w, imgSize.h],
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, imgSize.w, imgSize.h);
      pdf.save(`${(template?.title || 'cv').replace(/\s+/g, '_')}.pdf`);
      toast.success('PDF downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Could not export PDF. Try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex h-screen items-center justify-center text-[#1A1A1A] text-2xl">
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={`Edit ${template?.title}`} description="Edit your CV content in real time and download as PDF." />
      <div className="min-h-screen bg-[#F4F4F4]">
        <Navbar />

        <div className="pt-20 md:pt-24 flex flex-col lg:flex-row gap-4 lg:gap-6 px-3 md:px-6 pb-10">
          {/* Left toolbar */}
          <aside className="lg:w-72 w-full bg-white border border-black p-4 lg:sticky lg:top-24 h-fit">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[11px] uppercase tracking-wider mb-4 hover:opacity-70"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>

            <h2 className="text-[11px] uppercase tracking-wider font-medium mb-3">Editor</h2>
            <button
              onClick={addText}
              className="w-full flex items-center justify-center gap-2 border border-black bg-[#1A1A1A] text-white px-3 py-2 text-[12px] uppercase tracking-wider hover:bg-[#FA76FF] hover:text-black transition-colors mb-3"
            >
              <Plus className="w-4 h-4" /> Add text
            </button>

            <button
              onClick={exportPdf}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 border border-black bg-white text-black px-3 py-2 text-[12px] uppercase tracking-wider hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {exporting ? 'Exporting…' : 'Download PDF'}
            </button>

            {selected && (
              <div className="mt-6 border-t border-black pt-4 space-y-3">
                <h3 className="text-[11px] uppercase tracking-wider font-medium flex items-center gap-2">
                  <Type className="w-3 h-3" /> Text style
                </h3>

                <div>
                  <label className="text-[10px] uppercase tracking-wider block mb-1">Font</label>
                  <select
                    value={selected.fontFamily}
                    onChange={(e) => update(selected.id, { fontFamily: e.target.value })}
                    className="w-full border border-black px-2 py-1.5 text-[12px] bg-white"
                  >
                    {FONTS.map((f) => (
                      <option key={f} value={f}>{f.split(',')[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider block mb-1">
                    Size: {selected.fontSize}px
                  </label>
                  <input
                    type="range"
                    min={8}
                    max={72}
                    value={selected.fontSize}
                    onChange={(e) => update(selected.id, { fontSize: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider block mb-1">
                    Box width: {selected.width}px
                  </label>
                  <input
                    type="range"
                    min={60}
                    max={imgSize.w}
                    value={selected.width}
                    onChange={(e) => update(selected.id, { width: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => update(selected.id, { bold: !selected.bold })}
                    className={`flex-1 border border-black p-2 flex items-center justify-center ${
                      selected.bold ? 'bg-black text-white' : 'bg-white'
                    }`}
                    aria-label="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => update(selected.id, { italic: !selected.italic })}
                    className={`flex-1 border border-black p-2 flex items-center justify-center ${
                      selected.italic ? 'bg-black text-white' : 'bg-white'
                    }`}
                    aria-label="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => remove(selected.id)}
                    className="flex-1 border border-red-500 bg-red-500 text-white p-2 flex items-center justify-center hover:bg-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider block mb-1">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => update(selected.id, { color: c })}
                        className={`w-6 h-6 border ${selected.color === c ? 'border-black ring-2 ring-black' : 'border-gray-300'}`}
                        style={{ backgroundColor: c }}
                        aria-label={c}
                      />
                    ))}
                    <input
                      type="color"
                      value={selected.color}
                      onChange={(e) => update(selected.id, { color: e.target.value })}
                      className="w-6 h-6 border border-gray-300 p-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {!selected && (
              <p className="mt-6 text-[11px] text-gray-500 leading-relaxed">
                Click "Add text" to place editable text on the template. Drag to move, double-click to edit.
              </p>
            )}
          </aside>

          {/* Canvas */}
          <div className="flex-1 flex justify-center">
            <div
              ref={canvasRef}
              className="relative bg-white shadow-lg overflow-hidden"
              style={{ width: imgSize.w, height: imgSize.h }}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onClick={(e) => {
                if (e.target === e.currentTarget) setSelectedId(null);
              }}
            >
              <img
                src={template!.background_image_url}
                onLoad={handleImgLoad}
                alt={template!.title}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                crossOrigin="anonymous"
                draggable={false}
              />

              {elements.map((el) => {
                const isSel = el.id === selectedId && !exporting;
                return (
                  <div
                    key={el.id}
                    onPointerDown={(e) => onPointerDown(e, el)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(el.id);
                    }}
                    style={{
                      position: 'absolute',
                      left: el.x,
                      top: el.y,
                      width: el.width,
                      fontFamily: el.fontFamily,
                      fontSize: el.fontSize,
                      color: el.color,
                      fontWeight: el.bold ? 700 : 400,
                      fontStyle: el.italic ? 'italic' : 'normal',
                      lineHeight: 1.25,
                      cursor: 'move',
                      padding: '2px 4px',
                      outline: isSel ? '1px dashed #FA76FF' : 'none',
                      background: isSel ? 'rgba(250,118,255,0.06)' : 'transparent',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      userSelect: 'text',
                    }}
                  >
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => update(el.id, { text: e.currentTarget.innerText })}
                      onPointerDown={(e) => e.stopPropagation()}
                      style={{ outline: 'none', minHeight: '1em' }}
                    >
                      {el.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateEditor;
