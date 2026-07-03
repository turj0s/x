import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { toast } from 'sonner';
import { ArrowLeft, Download, Plus, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Template {
  id: string;
  title: string;
}

// -------- CV data model --------
interface Bullet {
  id: string;
  text: string;
}
interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  meta: string;
  bullets: Bullet[];
}
interface EducationItem {
  id: string;
  school: string;
  degree: string;
  meta: string;
  detail: string;
}
interface SkillGroup {
  id: string;
  label: string;
  value: string;
}
interface CVData {
  name: string;
  updated: string;
  website: string;
  contact: string;
  linkedin: string;
  headline: string;
  experience: ExperienceItem[];
  research: ExperienceItem[];
  education: EducationItem[];
  skills: SkillGroup[];
}

const uid = () => Math.random().toString(36).slice(2, 10);

const defaultCV = (title: string): CVData => ({
  name: 'Firstname Lastname',
  updated: 'Last updated on ' + new Date().toLocaleDateString(),
  website: 'http://example.com',
  contact: 'user@example.com | 123.456.7890',
  linkedin: 'http://linkedin.com/in/12346',
  headline: title || 'LIFELONG LEARNER',
  experience: [
    {
      id: uid(),
      company: 'COURSERA',
      role: 'KPCB Fellow + Software Engineering Intern',
      meta: 'Expected June 2014 – Sep 2014 | Mountain View, CA',
      bullets: [{ id: uid(), text: '52 out of 2500 applicants chosen to be a KPCB Fellow 2014.' }],
    },
    {
      id: uid(),
      company: 'GOOGLE',
      role: 'Software Engineering Intern',
      meta: 'May 2013 – Aug 2013 | Mountain View, CA',
      bullets: [
        { id: uid(), text: 'Worked on the YouTube Captions team in vanilla JavaScript and Python to plan, design and develop a new framework for Automatic Speech Recognition captions.' },
        { id: uid(), text: 'Created a backbone.js-like framework for the Captions editor.' },
        { id: uid(), text: 'All code was reviewed, perfected, and pushed to production.' },
      ],
    },
  ],
  research: [
    {
      id: uid(),
      company: 'CORNELL ROBOT LEARNING LAB',
      role: 'Head Undergrad Research',
      meta: 'Jan 2014 – Present | Ithaca, NY',
      bullets: [
        { id: uid(), text: 'Worked with Ashesh Jain and Prof Ashutosh Saxena to create PlanIt — a tool that learns from large-scale user preferences to plan robot trajectories.' },
      ],
    },
  ],
  education: [
    {
      id: uid(),
      school: 'CORNELL UNIVERSITY',
      degree: 'MEng in Computer Science',
      meta: 'Expected Dec 2014 | Ithaca, NY',
      detail: 'Cum. GPA: N/A',
    },
    {
      id: uid(),
      school: 'CORNELL UNIVERSITY',
      degree: 'BS in Computer Science',
      meta: 'Expected May 2014 | Ithaca, NY',
      detail: 'Dean\'s List (All Semesters) • Cum. GPA: 3.92 / 4.0 • Major GPA: 3.94 / 4.0',
    },
  ],
  skills: [
    { id: uid(), label: 'Over 5000 lines', value: 'Java • Shell • JavaScript • Matlab • OCaml • Python • Rails • LaTeX' },
    { id: uid(), label: 'Over 1000 lines', value: 'C • C++ • CSS • PHP • Assembly' },
    { id: uid(), label: 'Familiar', value: 'AS3 • iOS • Android • MySQL' },
  ],
});

// Editable inline text — pure contentEditable that writes back on blur.
const Editable = ({
  value,
  onChange,
  className,
  as: Tag = 'span',
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  as?: any;
  placeholder?: string;
}) => (
  <Tag
    contentEditable
    suppressContentEditableWarning
    onBlur={(e: any) => onChange(e.currentTarget.innerText)}
    className={`outline-none focus:bg-[#FFF7C2] hover:bg-[#FFFCE6] transition-colors rounded-sm px-0.5 ${className ?? ''}`}
    data-placeholder={placeholder}
    dangerouslySetInnerHTML={{ __html: value }}
  />
);

const STORAGE_KEY = (id: string) => `cv-editor:${id}`;

const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [cv, setCv] = useState<CVData | null>(null);
  const [exporting, setExporting] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) {
        toast.error('Template not found');
        navigate('/');
        return;
      }
      setTemplate(data);
      // Load saved draft or seed with defaults
      try {
        const raw = localStorage.getItem(STORAGE_KEY(data.id));
        setCv(raw ? JSON.parse(raw) : defaultCV(data.title));
      } catch {
        setCv(defaultCV(data.title));
      }
      setLoading(false);
    })();
  }, [id, navigate]);

  // Autosave to localStorage
  useEffect(() => {
    if (!cv || !id) return;
    const t = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY(id), JSON.stringify(cv)); } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [cv, id]);

  const update = <K extends keyof CVData>(patch: Partial<CVData>) =>
    setCv((prev) => (prev ? { ...prev, ...patch } : prev));

  // -------- Experience helpers --------
  const patchList = <T extends { id: string }>(
    key: 'experience' | 'research',
    list: T[],
  ) => setCv((p) => (p ? ({ ...p, [key]: list } as CVData) : p));

  const addExperience = (key: 'experience' | 'research') => {
    if (!cv) return;
    patchList(key, [
      ...cv[key],
      { id: uid(), company: 'COMPANY', role: 'Role', meta: 'Dates | Location', bullets: [{ id: uid(), text: 'Achievement or responsibility.' }] } as ExperienceItem,
    ]);
  };
  const removeExperience = (key: 'experience' | 'research', itemId: string) => {
    if (!cv) return;
    patchList(key, cv[key].filter((x) => x.id !== itemId));
  };
  const patchExperience = (key: 'experience' | 'research', itemId: string, patch: Partial<ExperienceItem>) => {
    if (!cv) return;
    patchList(key, cv[key].map((x) => (x.id === itemId ? { ...x, ...patch } : x)));
  };
  const patchBullet = (key: 'experience' | 'research', itemId: string, bulletId: string, text: string) => {
    if (!cv) return;
    patchList(
      key,
      cv[key].map((x) =>
        x.id === itemId ? { ...x, bullets: x.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b)) } : x,
      ),
    );
  };
  const addBullet = (key: 'experience' | 'research', itemId: string) => {
    if (!cv) return;
    patchList(
      key,
      cv[key].map((x) => (x.id === itemId ? { ...x, bullets: [...x.bullets, { id: uid(), text: 'New bullet' }] } : x)),
    );
  };
  const removeBullet = (key: 'experience' | 'research', itemId: string, bulletId: string) => {
    if (!cv) return;
    patchList(
      key,
      cv[key].map((x) => (x.id === itemId ? { ...x, bullets: x.bullets.filter((b) => b.id !== bulletId) } : x)),
    );
  };

  // -------- Education helpers --------
  const addEducation = () => {
    if (!cv) return;
    update({
      education: [
        ...cv.education,
        { id: uid(), school: 'SCHOOL NAME', degree: 'Degree', meta: 'Dates | Location', detail: 'Details' },
      ],
    });
  };
  const patchEducation = (itemId: string, patch: Partial<EducationItem>) => {
    if (!cv) return;
    update({ education: cv.education.map((e) => (e.id === itemId ? { ...e, ...patch } : e)) });
  };
  const removeEducation = (itemId: string) => {
    if (!cv) return;
    update({ education: cv.education.filter((e) => e.id !== itemId) });
  };

  // -------- Skills helpers --------
  const addSkill = () => {
    if (!cv) return;
    update({ skills: [...cv.skills, { id: uid(), label: 'Label', value: 'value' }] });
  };
  const patchSkill = (itemId: string, patch: Partial<SkillGroup>) => {
    if (!cv) return;
    update({ skills: cv.skills.map((s) => (s.id === itemId ? { ...s, ...patch } : s)) });
  };
  const removeSkill = (itemId: string) => {
    if (!cv) return;
    update({ skills: cv.skills.filter((s) => s.id !== itemId) });
  };

  const exportPdf = async () => {
    if (!paperRef.current) return;
    setExporting(true);
    // Blur any active field so latest edits commit
    (document.activeElement as HTMLElement | null)?.blur();
    await new Promise((r) => setTimeout(r, 60));
    try {
      const paper = paperRef.current;
      const canvas = await html2canvas(paper, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;
      let y = 0;
      let remaining = imgH;
      // Multi-page if content is taller than one A4
      if (imgH <= pageH) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pageW, imgH);
      } else {
        while (remaining > 0) {
          pdf.addImage(imgData, 'JPEG', 0, -y, pageW, imgH);
          remaining -= pageH;
          y += pageH;
          if (remaining > 0) pdf.addPage();
        }
      }
      pdf.save(`${(template?.title || 'cv').replace(/\s+/g, '_')}.pdf`);
      toast.success('PDF downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Could not export PDF');
    } finally {
      setExporting(false);
    }
  };

  const resetCV = () => {
    if (!template) return;
    if (!window.confirm('Reset all fields to defaults? Your changes will be lost.')) return;
    setCv(defaultCV(template.title));
  };

  if (loading || !cv) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex h-screen items-center justify-center text-[#1A1A1A] text-2xl">
          Loading editor...
        </div>
      </div>
    );
  }

  // Small delete button used inline
  const DeleteBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button
      onClick={onClick}
      className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-red-500 hover:text-red-700"
      aria-label={label}
      title={label}
    >
      <Trash2 className="w-3 h-3 inline" />
    </button>
  );

  return (
    <>
      <SEOHead title={`Edit ${template?.title}`} description="Edit your CV in real time and download as PDF." />
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #C4C4C4;
        }
      `}</style>
      <div className="min-h-screen bg-[#EDEDED]">
        <Navbar />

        <div className="pt-20 md:pt-24 flex flex-col lg:flex-row gap-4 lg:gap-6 px-3 md:px-6 pb-10">
          {/* Toolbar */}
          <aside className="lg:w-64 w-full bg-white border border-black p-4 lg:sticky lg:top-24 h-fit">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[11px] uppercase tracking-wider mb-4 hover:opacity-70"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <h2 className="text-[11px] uppercase tracking-wider font-medium mb-3">CV Editor</h2>
            <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
              Click any text to edit. Changes save automatically.
            </p>
            <button
              onClick={exportPdf}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 border border-black bg-[#1A1A1A] text-white px-3 py-2 text-[12px] uppercase tracking-wider hover:bg-[#FA76FF] hover:text-black transition-colors disabled:opacity-50 mb-2"
            >
              <Download className="w-4 h-4" /> {exporting ? 'Exporting…' : 'Download PDF'}
            </button>
            <button
              onClick={resetCV}
              className="w-full flex items-center justify-center gap-2 border border-black bg-white text-black px-3 py-2 text-[12px] uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
            >
              Reset
            </button>
          </aside>

          {/* Paper */}
          <div className="flex-1 flex justify-center">
            <div
              ref={paperRef}
              className="bg-white shadow-lg text-[#1A1A1A]"
              style={{
                width: 800,
                minHeight: 1130,
                padding: '48px 56px',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 13,
                lineHeight: 1.45,
              }}
            >
              {/* Header */}
              <header className="text-center pb-3 border-b border-gray-300 relative">
                <Editable
                  as="h1"
                  value={cv.name}
                  onChange={(v) => update({ name: v })}
                  className="text-[42px] font-light tracking-tight"
                />
                <div className="text-[11px] text-gray-600 mt-1">
                  <Editable value={cv.website} onChange={(v) => update({ website: v })} />
                </div>
                <div className="text-[11px] text-gray-600">
                  <Editable value={cv.contact} onChange={(v) => update({ contact: v })} />
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  <Editable value={cv.linkedin} onChange={(v) => update({ linkedin: v })} />
                </div>
                <div className="text-[10px] text-gray-400 absolute right-0 top-0">
                  <Editable value={cv.updated} onChange={(v) => update({ updated: v })} />
                </div>
              </header>

              {/* Headline */}
              <div className="text-center my-6">
                <Editable
                  as="h2"
                  value={cv.headline}
                  onChange={(v) => update({ headline: v })}
                  className="text-[22px] font-semibold tracking-widest"
                />
              </div>

              {/* Experience */}
              <Section
                title="EXPERIENCE"
                onAdd={() => addExperience('experience')}
                addLabel="Add job"
              >
                {cv.experience.map((exp) => (
                  <ExperienceBlock
                    key={exp.id}
                    item={exp}
                    onPatch={(p) => patchExperience('experience', exp.id, p)}
                    onRemove={() => removeExperience('experience', exp.id)}
                    onPatchBullet={(bid, text) => patchBullet('experience', exp.id, bid, text)}
                    onAddBullet={() => addBullet('experience', exp.id)}
                    onRemoveBullet={(bid) => removeBullet('experience', exp.id, bid)}
                    DeleteBtn={DeleteBtn}
                  />
                ))}
              </Section>

              {/* Research */}
              <Section
                title="RESEARCH"
                onAdd={() => addExperience('research')}
                addLabel="Add research"
              >
                {cv.research.map((exp) => (
                  <ExperienceBlock
                    key={exp.id}
                    item={exp}
                    onPatch={(p) => patchExperience('research', exp.id, p)}
                    onRemove={() => removeExperience('research', exp.id)}
                    onPatchBullet={(bid, text) => patchBullet('research', exp.id, bid, text)}
                    onAddBullet={() => addBullet('research', exp.id)}
                    onRemoveBullet={(bid) => removeBullet('research', exp.id, bid)}
                    DeleteBtn={DeleteBtn}
                  />
                ))}
              </Section>

              {/* Education */}
              <Section title="EDUCATION" onAdd={addEducation} addLabel="Add school">
                {cv.education.map((ed) => (
                  <div key={ed.id} className="mb-3 group">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <Editable
                          value={ed.school}
                          onChange={(v) => patchEducation(ed.id, { school: v })}
                          className="font-bold tracking-wide text-[13px]"
                        />
                        <span className="text-gray-600 text-[12px]"> | </span>
                        <Editable
                          value={ed.degree}
                          onChange={(v) => patchEducation(ed.id, { degree: v })}
                          className="text-[12px] font-medium"
                        />
                      </div>
                      <DeleteBtn onClick={() => removeEducation(ed.id)} label="Remove school" />
                    </div>
                    <div className="text-[12px] text-gray-700">
                      <Editable value={ed.meta} onChange={(v) => patchEducation(ed.id, { meta: v })} />
                    </div>
                    <div className="text-[12px] text-gray-800">
                      <Editable value={ed.detail} onChange={(v) => patchEducation(ed.id, { detail: v })} />
                    </div>
                  </div>
                ))}
              </Section>

              {/* Skills */}
              <Section title="SKILLS" onAdd={addSkill} addLabel="Add skill group">
                {cv.skills.map((s) => (
                  <div key={s.id} className="mb-2 group flex items-baseline gap-2">
                    <Editable
                      value={s.label}
                      onChange={(v) => patchSkill(s.id, { label: v })}
                      className="font-bold text-[12px] uppercase tracking-wider min-w-[110px]"
                    />
                    <span className="text-gray-500">:</span>
                    <Editable
                      value={s.value}
                      onChange={(v) => patchSkill(s.id, { value: v })}
                      className="text-[12px] flex-1"
                    />
                    <DeleteBtn onClick={() => removeSkill(s.id)} label="Remove skill" />
                  </div>
                ))}
              </Section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// -------- Section wrapper --------
const Section = ({
  title,
  children,
  onAdd,
  addLabel,
}: {
  title: string;
  children: React.ReactNode;
  onAdd: () => void;
  addLabel: string;
}) => (
  <section className="mt-5">
    <div className="flex items-center justify-between border-b border-gray-300 pb-1 mb-3">
      <h3 className="text-[18px] font-light tracking-widest text-gray-700">{title}</h3>
      <button
        onClick={onAdd}
        className="text-[10px] uppercase tracking-wider text-gray-500 hover:text-black flex items-center gap-1 no-print"
        title={addLabel}
      >
        <Plus className="w-3 h-3" /> {addLabel}
      </button>
    </div>
    {children}
  </section>
);

// -------- Experience block --------
const ExperienceBlock = ({
  item,
  onPatch,
  onRemove,
  onPatchBullet,
  onAddBullet,
  onRemoveBullet,
  DeleteBtn,
}: {
  item: ExperienceItem;
  onPatch: (p: Partial<ExperienceItem>) => void;
  onRemove: () => void;
  onPatchBullet: (bid: string, text: string) => void;
  onAddBullet: () => void;
  onRemoveBullet: (bid: string) => void;
  DeleteBtn: React.FC<{ onClick: () => void; label: string }>;
}) => {
  const Editable = ({
    value,
    onChange,
    className,
  }: {
    value: string;
    onChange: (v: string) => void;
    className?: string;
  }) => (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange((e.currentTarget as HTMLElement).innerText)}
      className={`outline-none focus:bg-[#FFF7C2] hover:bg-[#FFFCE6] transition-colors rounded-sm px-0.5 ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );

  return (
    <div className="mb-4 group">
      <div className="flex items-baseline justify-between">
        <div>
          <Editable
            value={item.company}
            onChange={(v) => onPatch({ company: v })}
            className="font-bold tracking-wide text-[13px]"
          />
          <span className="text-gray-600 text-[12px]"> | </span>
          <Editable
            value={item.role}
            onChange={(v) => onPatch({ role: v })}
            className="text-[12px] font-medium"
          />
        </div>
        <DeleteBtn onClick={onRemove} label="Remove entry" />
      </div>
      <div className="text-[12px] text-gray-700 mb-1">
        <Editable value={item.meta} onChange={(v) => onPatch({ meta: v })} />
      </div>
      <ul className="list-disc pl-5 space-y-0.5">
        {item.bullets.map((b) => (
          <li key={b.id} className="text-[12px] group/bullet flex items-start gap-1">
            <div className="flex-1">
              <Editable value={b.text} onChange={(t) => onPatchBullet(b.id, t)} />
            </div>
            <button
              onClick={() => onRemoveBullet(b.id)}
              className="opacity-0 group-hover/bullet:opacity-100 transition-opacity text-red-500 hover:text-red-700"
              aria-label="Remove bullet"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={onAddBullet}
        className="text-[10px] uppercase tracking-wider text-gray-400 hover:text-black mt-1 flex items-center gap-1"
      >
        <Plus className="w-3 h-3" /> Add bullet
      </button>
    </div>
  );
};

export default TemplateEditor;
