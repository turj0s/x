import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { toast } from 'sonner';
import { ArrowLeft, Download, Plus, Trash2, Type, Bold, Italic, Wand2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Template {
  id: string;
  title: string;
  background_image_url: string;
  docspace_url?: string | null;
}


interface TextBox {
  id: string;
  x: number; // percent 0..100
  y: number; // percent 0..100
  w: number; // percent width
  h?: number; // percent height (source bbox); box grows past this if needed
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  lineHeight: number; // unitless multiplier
  bg: string; // background color to cover template text ('transparent' or hex)
  edited: boolean; // false means OCR hotspot only; original template pixels stay visible
}

const DOCSPACE_ORIGIN = 'https://docspace-bg94v1.onlyoffice.com';

const DocSpaceEditorRedirect = ({ title, url }: { title: string; url: string }) => {
  const [editorUrl, setEditorUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) setError('Please sign in to open the editor.');
        return;
      }
      const { data, error } = await supabase.functions.invoke('get-docspace-file', {
        body: { url },
      });
      if (cancelled) return;
      if (error || !data?.fileId || !data?.requestToken) {
        setError('Unable to open the editor.');
        return;
      }
      const built = `${DOCSPACE_ORIGIN}/doceditor?fileId=${encodeURIComponent(data.fileId)}&share=${encodeURIComponent(data.requestToken)}`;
      setEditorUrl(built);
      window.location.replace(built);
    })();
    return () => { cancelled = true; };
  }, [url]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white px-4 text-center text-[#1A1A1A]">
      <div className="flex flex-col items-center gap-3">
        <div className="text-[11px] font-medium uppercase tracking-wider">
          {error ? error : `Opening ${title} editor…`}
        </div>
        {editorUrl && (
          <a
            href={editorUrl}
            className="border border-[#1A1A1A] px-3 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors hover:bg-[#1A1A1A] hover:text-white"
          >
            Open editor
          </a>
        )}
      </div>
    </div>
  );
};


const uid = () => Math.random().toString(36).slice(2, 10);

const STORAGE_KEY = (id: string) => `cv-overlay:${id}`;

const FONTS = ['Inter', 'Georgia', 'Times New Roman', 'Courier New', 'Arial'];
const COLORS = ['#111111', '#333333', '#555555', '#1E40AF', '#B91C1C', '#047857', '#B45309', '#FFFFFF'];

const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim();

// Uncontrolled contentEditable: caret/selection are preserved because React
// never re-renders the DOM subtree during editing. Parent state syncs on blur.
interface EditableTextProps {
  initialText: string;
  editing: boolean;
  style: React.CSSProperties;
  onFirstChange?: () => void;
  onCommit: (text: string) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}
export const EditableText: React.FC<EditableTextProps> = ({
  initialText,
  editing,
  style,
  onFirstChange,
  onCommit,
  onPointerDown,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const firedChangeRef = useRef(false);
  const baselineRef = useRef(initialText);
  // Pending click coords captured on the mousedown that opens edit mode.
  // We apply them once the element becomes contentEditable so the caret
  // lands exactly under the cursor, matching the original line wrapping.
  const pendingCaretRef = useRef<{ x: number; y: number; shift: boolean } | null>(null);
  // True while an IME composition (Japanese/Chinese/Korean) is in flight.
  // We must not intercept keys or rewrite the DOM during this window,
  // otherwise the composed character is lost and the caret desyncs.
  const composingRef = useRef(false);

  // Sync DOM text from prop only when NOT focused, so we never stomp the caret.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.textContent !== initialText) {
      el.textContent = initialText;
    }
    baselineRef.current = initialText;
    firedChangeRef.current = false;
  }, [initialText]);

  const caretRangeAt = (x: number, y: number): Range | null => {
    const doc = document as Document & {
      caretRangeFromPoint?: (x: number, y: number) => Range | null;
      caretPositionFromPoint?: (
        x: number,
        y: number,
      ) => { offsetNode: Node; offset: number } | null;
    };
    if (doc.caretRangeFromPoint) return doc.caretRangeFromPoint(x, y);
    if (doc.caretPositionFromPoint) {
      const pos = doc.caretPositionFromPoint(x, y);
      if (pos) {
        const r = document.createRange();
        r.setStart(pos.offsetNode, pos.offset);
        r.collapse(true);
        return r;
      }
    }
    return null;
  };

  const applyPendingCaret = (
    x: number,
    y: number,
    shift: boolean,
  ) => {
    const el = ref.current;
    if (!el) return;
    const range = caretRangeAt(x, y);
    if (!range || !el.contains(range.startContainer)) return;
    const sel = window.getSelection();
    if (!sel) return;
    if (shift && sel.rangeCount > 0 && sel.anchorNode && el.contains(sel.anchorNode)) {
      // Shift+click / shift-mousedown: extend the existing selection to the
      // clicked point instead of collapsing. Native browsers do this on
      // fresh mousedown but not when we programmatically re-focus, so we
      // reproduce it explicitly.
      sel.extend(range.startContainer, range.startOffset);
    } else {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  // On entering edit mode: focus, then place caret under the pointer.
  useEffect(() => {
    const el = ref.current;
    if (!el || !editing) return;
    el.focus({ preventScroll: true });
    const pending = pendingCaretRef.current;
    pendingCaretRef.current = null;
    if (pending) {
      requestAnimationFrame(() => applyPendingCaret(pending.x, pending.y, pending.shift));
    }
  }, [editing]);

  return (
    <div
      ref={ref}
      data-text-box-input
      contentEditable={editing}
      suppressContentEditableWarning
      // `dir="auto"` lets each paragraph's directionality follow its first
      // strong character, so RTL scripts (Arabic/Hebrew) wrap, caret-move,
      // and paste with correct visual indexing without affecting LTR lines.
      dir="auto"
      onPointerDown={(e) => {
        if (editing) {
          // Native contentEditable already handles fresh clicks and
          // shift+mousedown selection extension correctly — don't interfere.
          e.stopPropagation();
        } else {
          pendingCaretRef.current = { x: e.clientX, y: e.clientY, shift: e.shiftKey };
        }
        onPointerDown?.(e);
      }}
      onCompositionStart={() => {
        composingRef.current = true;
      }}
      onCompositionEnd={(e) => {
        composingRef.current = false;
        // Treat composition commit as a regular input for change tracking.
        if (!firedChangeRef.current) {
          const next = (e.currentTarget as HTMLDivElement).textContent ?? '';
          if (normalizeText(next) !== normalizeText(baselineRef.current)) {
            firedChangeRef.current = true;
            onFirstChange?.();
          }
        }
      }}
      onKeyDown={(e) => {
        // While composing, the browser owns every key (including Enter used
        // to commit the candidate). `e.isComposing` and keyCode 229 both
        // signal this — bail out so we don't swallow the commit key.
        if (composingRef.current || e.nativeEvent.isComposing || e.keyCode === 229) return;
        if (e.key === 'Enter' && !e.shiftKey) {
          // execCommand keeps the newline in the browser's native undo stack,
          // so Ctrl/Cmd+Z reverses each Enter individually.
          e.preventDefault();
          document.execCommand('insertText', false, '\n');
        }
        // Arrow keys, Home/End, Shift+Arrow, Ctrl/Cmd+Z/Y: fall through to
        // native contentEditable so navigation, selection, and undo/redo
        // all track the visual wrapping.
      }}
      onPaste={(e) => {
        // Normalize CRLF/CR to LF, keep tabs and leading/trailing newlines
        // verbatim, and route through execCommand so the paste is a single
        // atomic entry in the native undo stack. execCommand('insertText')
        // inserts \n as a real newline character under `white-space: pre-wrap`
        // (not <br>/<div>), which keeps caret math and per-line indexing
        // exact regardless of paste size.
        e.preventDefault();
        if (composingRef.current) return;
        const raw = e.clipboardData.getData('text/plain');
        const text = raw.replace(/\r\n?/g, '\n');
        if (!text) return;
        const ok = document.execCommand('insertText', false, text);
        if (!ok) {
          // Fallback for browsers that reject execCommand: manual range insert.
          const el = ref.current;
          const sel = window.getSelection();
          if (!el || !sel || sel.rangeCount === 0) return;
          const range = sel.getRangeAt(0);
          if (!el.contains(range.startContainer)) return;
          range.deleteContents();
          const node = document.createTextNode(text);
          range.insertNode(node);
          const after = document.createRange();
          after.setStartAfter(node);
          after.collapse(true);
          sel.removeAllRanges();
          sel.addRange(after);
          el.normalize();
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }}
      onInput={(e) => {
        // Skip change bookkeeping mid-composition; onCompositionEnd handles it.
        if (composingRef.current) return;
        if (firedChangeRef.current) return;
        const next = (e.currentTarget as HTMLDivElement).textContent ?? '';
        if (normalizeText(next) !== normalizeText(baselineRef.current)) {
          firedChangeRef.current = true;
          onFirstChange?.();
        }
      }}
      onBlur={(e) => {
        onCommit((e.currentTarget as HTMLDivElement).textContent ?? '');
      }}
      style={style}
    />

  );
};

const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [boxes, setBoxes] = useState<TextBox[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [useImageEditor, setUseImageEditor] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const autoRanRef = useRef<Set<string>>(new Set());

  // Load template + saved boxes whenever template id changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      setBoxes([]);
      setSelectedId(null);
      setEditingId(null);
      setImgSize(null);
      setUseImageEditor(false);
      const { data, error } = await supabase
        .from('events')
        .select('id, title, background_image_url, docspace_url')
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
        setBoxes(parsed.map((b) => ({ bg: '#FFFFFF', lineHeight: 1.25, ...b, edited: Boolean(b.edited) })));
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
      try { localStorage.setItem(STORAGE_KEY(id), JSON.stringify(boxes)); } catch { return; }
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
      lineHeight: 1.25,
      bg: '#FFFFFF',
      edited: true,
    };
    setBoxes((p) => [...p, nb]);
    setSelectedId(nb.id);
  };

  const patchBox = (bid: string, patch: Partial<TextBox>) =>
    setBoxes((p) => p.map((b) => (b.id === bid ? { ...b, ...patch } : b)));

  const removeBox = (bid: string) => {
    setBoxes((p) => p.filter((b) => b.id !== bid));
    if (selectedId === bid) setSelectedId(null);
    if (editingId === bid) setEditingId(null);
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
    setEditingId(null);
  };

  const runOcr = async (replace = true) => {
    if (!template || !imgSize) return;
    setDetecting(true);
    setOcrProgress(0);
    try {
      const { createWorker } = await import('tesseract.js');
      // Fetch the image as a blob (avoids CORS taint issues with crossOrigin img element)
      const resp = await fetch(template.background_image_url, { mode: 'cors' }).catch(() => null)
        || await fetch(template.background_image_url);
      if (!resp.ok) throw new Error(`image fetch ${resp.status}`);
      const blob = await resp.blob();

      const worker = await createWorker('eng', 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100));
        },
      } as Parameters<typeof createWorker>[2]);
      const result = await worker.recognize(blob, {}, { blocks: true, text: true });
      await worker.terminate();

      // v6+: bounding boxes live under data.blocks -> paragraphs -> lines
      type OcrLine = { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } };
      type OcrBlock = { lines?: OcrLine[]; paragraphs?: Array<{ lines?: OcrLine[] }> };
      const data = result.data as unknown as { lines?: OcrLine[]; blocks?: OcrBlock[] };
      const lines: OcrLine[] = [];
      if (data.lines?.length) lines.push(...data.lines);
      if (!lines.length && data.blocks) {
        for (const blk of data.blocks) {
          if (blk.lines?.length) lines.push(...blk.lines);
          else if (blk.paragraphs) for (const par of blk.paragraphs) if (par.lines) lines.push(...par.lines);
        }
      }
      const iw = imgSize.w;
      const ih = imgSize.h;

      // Normalize + sort lines top-to-bottom, then group adjacent lines into paragraphs
      // whose left edges and font sizes match — so multi-line text becomes one editable
      // block that wraps and breaks exactly like the source.
      type Ln = { text: string; x0: number; y0: number; x1: number; y1: number; h: number };
      const norm: Ln[] = lines
        .map((ln) => {
          const text = (ln.text || '').replace(/\s+$/g, '');
          if (!text.trim()) return null;
          const { x0, y0, x1, y1 } = ln.bbox;
          return { text, x0, y0, x1, y1, h: y1 - y0 };
        })
        .filter(Boolean) as Ln[];
      norm.sort((a, b) => a.y0 - b.y0);

      type Grp = { lines: Ln[]; x0: number; y0: number; x1: number; y1: number; h: number };
      const groups: Grp[] = [];
      for (const ln of norm) {
        const g = groups[groups.length - 1];
        const sameCol = g && Math.abs(ln.x0 - g.x0) < ln.h * 0.6;
        const sameSize = g && Math.abs(ln.h - g.h) < Math.max(2, g.h * 0.25);
        const gap = g ? ln.y0 - g.y1 : Infinity;
        const closeVert = g && gap < g.h * 0.9 && gap > -g.h * 0.4;
        if (g && sameCol && sameSize && closeVert) {
          g.lines.push(ln);
          g.x0 = Math.min(g.x0, ln.x0);
          g.y0 = Math.min(g.y0, ln.y0);
          g.x1 = Math.max(g.x1, ln.x1);
          g.y1 = Math.max(g.y1, ln.y1);
        } else {
          groups.push({ lines: [ln], x0: ln.x0, y0: ln.y0, x1: ln.x1, y1: ln.y1, h: ln.h });
        }
      }

      const newBoxes: TextBox[] = groups.map((g) => {
        const wPct = ((g.x1 - g.x0) / iw) * 100;
        const hPctFull = ((g.y1 - g.y0) / ih) * 100;
        const hPx = g.h; // single-line px height (for font-size derivation)
        const displayH = (hPx / iw) * paperWidth;
        const fontSize = Math.max(8, Math.round(displayH / 1.15));
        // line-height from measured vertical stride if we have >1 line
        let lineHeight = 1.15;
        if (g.lines.length > 1) {
          const strides: number[] = [];
          for (let i = 1; i < g.lines.length; i++) strides.push(g.lines[i].y0 - g.lines[i - 1].y0);
          const stride = strides.reduce((s, v) => s + v, 0) / strides.length;
          lineHeight = Math.max(1, Math.min(2.2, stride / hPx));
        }
        // Infer alignment from group extents on the page
        const leftGap = (g.x0 / iw) * 100;
        const rightGap = 100 - ((g.x1 / iw) * 100);
        let align: 'left' | 'center' | 'right' = 'left';
        if (Math.abs(leftGap - rightGap) < 3) align = 'center';
        else if (rightGap < leftGap - 6) align = 'right';
        // Join with real line breaks so wrapping/breaks match the source
        const text = g.lines.map((l) => l.text).join('\n');
        return {
          id: uid(),
          x: (g.x0 / iw) * 100,
          y: (g.y0 / ih) * 100,
          w: Math.max(wPct + 1, 6),
          h: hPctFull,
          text,
          fontSize,
          fontFamily: 'Georgia',
          color: '#111111',
          bold: false,
          italic: false,
          align,
          lineHeight,
          bg: 'transparent',
          edited: false,
        };
      });

      setBoxes((prev) => (replace ? newBoxes : [...prev, ...newBoxes]));
      setSelectedId(null);
      setEditingId(null);
      toast.success(`Detected ${newBoxes.length} editable text regions`);
    } catch (err) {
      console.error(err);
      toast.error('Could not auto-detect text');
    } finally {
      setDetecting(false);
      setOcrProgress(0);
    }
  };

  // Auto-run OCR on first visit for a template with no saved boxes
  useEffect(() => {
    if (!template || !imgSize || loading) return;
    if (boxes.length > 0) return;
    if (autoRanRef.current.has(template.id)) return;
    autoRanRef.current.add(template.id);
    runOcr(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, imgSize, loading]);

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

  // Full-fidelity Word template via OnlyOffice DocSpace public share.
  // DocSpace blocks cross-origin iframes, so open the editor directly in this tab.
  if (template.docspace_url && !useImageEditor) {
    return (
      <>
        <SEOHead title={`Edit ${template.title}`} description={`Edit the ${template.title} Word CV template directly in your browser, customize every section, then download as DOCX or PDF ready to send.`} />
        <DocSpaceEditorRedirect title={template.title} url={template.docspace_url} />
      </>
    );
  }


  const paperWidth = 800;
  const paperHeight = imgSize ? (paperWidth * imgSize.h) / imgSize.w : 1130;

  return (
    <>
      <SEOHead title={`Edit ${template.title}`} description={`Edit the ${template.title} CV template in real time, tweak text, colors, and layout, then export a polished PDF ready for recruiters.`} />
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
              Detected text stays exactly like the original template until you replace a selected region.
            </p>

            <button
              onClick={() => runOcr(true)}
              disabled={detecting || !imgSize}
              className="w-full flex items-center justify-center gap-2 border border-black bg-[#FA76FF] text-black px-3 py-2 text-[12px] uppercase tracking-wider hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4" /> {detecting ? `Detecting… ${ocrProgress}%` : 'Auto-detect text'}
            </button>

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
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Cover (background)</div>
                  <div className="flex flex-wrap gap-1 items-center">
                    <button
                      onClick={() => patchBox(selected.id, { bg: 'transparent' })}
                      className={`w-6 h-6 border text-[9px] ${selected.bg === 'transparent' ? 'border-black ring-2 ring-black' : 'border-gray-300'}`}
                      style={{ background: 'repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 50% / 8px 8px' }}
                      aria-label="transparent"
                      title="No cover"
                    />
                    {['#FFFFFF','#F5F5F5','#000000'].map((c) => (
                      <button
                        key={c}
                        onClick={() => patchBox(selected.id, { bg: c })}
                        style={{ background: c }}
                        className={`w-6 h-6 border ${selected.bg === c ? 'border-black ring-2 ring-black' : 'border-gray-300'}`}
                        aria-label={c}
                      />
                    ))}
                    <input
                      type="color"
                      value={selected.bg === 'transparent' ? '#ffffff' : selected.bg}
                      onChange={(e) => patchBox(selected.id, { bg: e.target.value })}
                      className="w-6 h-6 border border-gray-300 p-0"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 leading-tight">Use a solid cover to hide the template's original text underneath.</p>
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
                ref={imgRef}
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
              {detecting && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-50 pointer-events-none">
                  <div className="bg-white border border-black px-4 py-3 text-[12px] uppercase tracking-wider">
                    Detecting text… {ocrProgress}%
                  </div>
                </div>
              )}
              {boxes.map((b) => {
                const isEditing = editingId === b.id;
                const isSelected = selectedId === b.id;
                // Original template pixels stay visible until the user actually edits this region.
                const showOverlayText = b.edited;
                const coverBg = b.edited && b.bg && b.bg !== 'transparent' ? b.bg : 'transparent';

                return (
                  <div
                    key={b.id}
                    onPointerDown={(e) => onPointerDownBox(e, b)}
                    onPointerMove={onPointerMoveBox}
                    onPointerUp={onPointerUpBox}
                    onClick={() => setSelectedId(b.id)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(b.id);
                      setEditingId(b.id);
                      const el = e.currentTarget.querySelector<HTMLElement>('[data-text-box-input]');
                      setTimeout(() => {
                        el?.focus();
                        // Select-all so typing replaces the original text cleanly.
                        if (el) {
                          const range = document.createRange();
                          range.selectNodeContents(el);
                          const sel = window.getSelection();
                          sel?.removeAllRanges();
                          sel?.addRange(range);
                        }
                      }, 0);
                    }}
                    style={{
                      position: 'absolute',
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      width: `${b.w}%`,
                      minHeight: b.h
                        ? `${b.h}%`
                        : Math.max(12, b.fontSize * (b.lineHeight ?? 1.25)),
                      cursor: isEditing ? 'text' : 'move',
                      padding: '2px 4px',
                      outline: isSelected ? '1.5px dashed #FA76FF' : '1px dashed transparent',
                      background: coverBg,
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.outline = '1px dashed rgba(0,0,0,0.35)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.outline = '1px dashed transparent'; }}
                  >
                    <EditableText
                      key={b.id}
                      initialText={b.text}
                      editing={isEditing}
                      onFirstChange={() => {
                        if (!b.edited) {
                          patchBox(b.id, {
                            edited: true,
                            bg: b.bg === 'transparent' ? '#FFFFFF' : b.bg,
                          });
                        }
                      }}
                      onCommit={(nextText) => {
                        const changed = normalizeText(nextText) !== normalizeText(b.text);
                        patchBox(b.id, {
                          text: nextText,
                          edited: b.edited || changed,
                          bg: changed && b.bg === 'transparent' ? '#FFFFFF' : b.bg,
                        });
                        setEditingId(null);
                      }}
                      style={{
                        outline: 'none',
                        opacity: showOverlayText || isEditing ? 1 : 0,
                        pointerEvents: isEditing ? 'auto' : 'none',
                        fontFamily: b.fontFamily,
                        fontSize: b.fontSize,
                        color: b.color,
                        caretColor: b.color,
                        fontWeight: b.bold ? 700 : 400,
                        fontStyle: b.italic ? 'italic' : 'normal',
                        textAlign: b.align,
                        lineHeight: b.lineHeight ?? 1.25,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        minHeight: '1em',
                      }}
                    />

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
