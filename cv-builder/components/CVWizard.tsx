'use client';
// components/CVWizard.tsx
import { useState, useRef, useEffect } from 'react';
import {
  CVData, EMPTY_CV, TEMPLATE_META, COLOR_SCHEMES, TemplateId,
  Experience, Education,
} from '@/lib/cvTypes';
import CVPreview from './CVPreview';
import CVManager from './CVManager';
import PDFPreviewPanel from './PDFPreviewPanel';
import { useCVStore } from '@/lib/useCVStore';

// ── tiny helpers ────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 8); }

function clsx(...cls: (string | boolean | undefined)[]) {
  return cls.filter(Boolean).join(' ');
}

// ── sub-components ──────────────────────────────────────────────────────────

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      className="cv-input"
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      className="cv-input cv-textarea"
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  );
}

// ── Template preview miniatures ─────────────────────────────────────────────

function TemplateMini({ id, color }: { id: TemplateId; color: string }) {
  const c = `#${color}`;
  const previews: Record<TemplateId, React.ReactNode> = {
    classic: (
      <svg viewBox="0 0 80 100" className="tmpl-svg">
        <rect x="10" y="8" width="40" height="6" rx="2" fill={c} opacity=".9" />
        <rect x="10" y="16" width="25" height="3" rx="1" fill={c} opacity=".4" />
        <rect x="10" y="20" width="60" height="1" fill={c} opacity=".6" />
        {[26,31,36,44,49,54,62,67].map((y,i) => (
          <rect key={i} x="10" y={y} width={i%3===0?50:40} height="2.5" rx="1" fill="#B4B2A9" />
        ))}
        <rect x="10" y="40" width="30" height="3" rx="1" fill={c} opacity=".7" />
        <rect x="10" y="58" width="30" height="3" rx="1" fill={c} opacity=".7" />
      </svg>
    ),
    modern: (
      <svg viewBox="0 0 80 100" className="tmpl-svg">
        <rect x="0" y="0" width="22" height="100" fill={c} opacity=".85" rx="0" />
        <rect x="4" y="8" width="14" height="5" rx="2" fill="white" opacity=".8" />
        {[16,22,28,34,40].map((y,i) => (
          <rect key={i} x="4" y={y} width="14" height="2" rx="1" fill="white" opacity=".4" />
        ))}
        {[10,16,22,30,36,42,50,56].map((y,i) => (
          <rect key={i} x="27" y={y} width={i%3===0?45:35} height="2.5" rx="1" fill="#B4B2A9" />
        ))}
        <rect x="27" y="8" width="30" height="4" rx="1" fill={c} opacity=".7" />
        <rect x="27" y="28" width="30" height="3" rx="1" fill={c} opacity=".5" />
        <rect x="27" y="48" width="30" height="3" rx="1" fill={c} opacity=".5" />
      </svg>
    ),
    compact: (
      <svg viewBox="0 0 80 100" className="tmpl-svg">
        <rect x="10" y="6" width="35" height="5" rx="1" fill={c} opacity=".9" />
        <rect x="48" y="6" width="22" height="5" rx="1" fill={c} opacity=".3" />
        <rect x="10" y="13" width="60" height="0.8" fill={c} opacity=".5" />
        {[17,21,25,30,34,38,43,47,51,56,60,64].map((y,i) => (
          <rect key={i} x="10" y={y} width={i%4===0?50:38} height="2" rx="1" fill={i%4===0?c:"#B4B2A9"} opacity={i%4===0?.6:1} />
        ))}
      </svg>
    ),
    executive: (
      <svg viewBox="0 0 80 100" className="tmpl-svg">
        <rect x="0" y="0" width="80" height="5" fill={c} opacity=".9" />
        <rect x="10" y="10" width="45" height="7" rx="1" fill={c} opacity=".85" />
        <rect x="10" y="19" width="28" height="3" rx="1" fill={c} opacity=".4" />
        <rect x="0" y="25" width="80" height="4" fill={c} opacity=".9" />
        {[33,38,43,50,55,60,67,72].map((y,i) => (
          <rect key={i} x="10" y={y} width={i%3===0?48:36} height="2.5" rx="1" fill={i%3===0?c:"#B4B2A9"} opacity={i%3===0?.65:1} />
        ))}
      </svg>
    ),
    minimal: (
      <svg viewBox="0 0 80 100" className="tmpl-svg">
        <rect x="10" y="10" width="50" height="8" rx="1" fill="#2C2C2A" opacity=".85" />
        <rect x="10" y="20" width="28" height="3" rx="1" fill={c} opacity=".7" />
        <rect x="10" y="26" width="55" height="0.5" fill={c} opacity=".4" />
        {[30,35,42,47,55,60,67].map((y,i) => (
          <rect key={i} x={i%3===0?10:14} y={y} width={i%3===0?42:36} height="2" rx="1"
            fill={i%3===0?c:"#B4B2A9"} opacity={i%3===0?.5:1} />
        ))}
      </svg>
    ),
    bold: (
      <svg viewBox="0 0 80 100" className="tmpl-svg">
        <rect x="0" y="0" width="80" height="28" fill={c} opacity=".9" />
        <rect x="10" y="6" width="42" height="8" rx="1" fill="white" opacity=".95" />
        <rect x="10" y="16" width="26" height="3" rx="1" fill="white" opacity=".6" />
        {[34,39,44,51,56,61,68,73].map((y,i) => (
          <rect key={i} x="10" y={y} width={i%3===0?48:36} height="2.5" rx="1"
            fill={i%3===0?c:"#B4B2A9"} opacity={i%3===0?.7:1} />
        ))}
      </svg>
    ),
    'sidebar-dark': (
      <svg viewBox="0 0 80 100" className="tmpl-svg">
        <rect x="0" y="0" width="26" height="100" fill="#2C2C2A" rx="0" />
        <rect x="4" y="8" width="18" height="6" rx="2" fill={c} opacity=".8" />
        {[18,23,28,34,39].map((y,i) => (
          <rect key={i} x="4" y={y} width="18" height="2" rx="1" fill="white" opacity=".3" />
        ))}
        {[8,14,20,28,34,40,48,54].map((y,i) => (
          <rect key={i} x="31" y={y} width={i%3===0?42:32} height="2.5" rx="1"
            fill={i%3===0?c:"#B4B2A9"} opacity={i%3===0?.7:1} />
        ))}
      </svg>
    ),
    timeline: (
      <svg viewBox="0 0 80 100" className="tmpl-svg">
        <rect x="10" y="6" width="40" height="6" rx="1" fill={c} opacity=".85" />
        <rect x="10" y="14" width="55" height="0.8" fill={c} opacity=".4" />
        <line x1="22" y1="22" x2="22" y2="90" stroke={c} strokeWidth="1.5" opacity=".4" />
        {[22,34,46,58,70].map((y,i) => (
          <g key={i}>
            <circle cx="22" cy={y} r="3" fill={c} opacity=".7" />
            <rect x="28" y={y-3} width={i%2===0?40:32} height="2.5" rx="1" fill={i===0?c:"#B4B2A9"} opacity={i===0?.7:1} />
            <rect x="28" y={y+2} width="24" height="1.5" rx="1" fill="#B4B2A9" opacity=".6" />
          </g>
        ))}
      </svg>
    ),
  };

  return previews[id] ?? previews.classic;
}

// ── Steps ────────────────────────────────────────────────────────────────────

const STEPS = ['Template', 'Colors', 'Personal', 'Summary', 'Experience', 'Education', 'Skills', 'Export'];

// ── Main component ───────────────────────────────────────────────────────────

export default function CVWizard() {
  const [step, setStep] = useState(0);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [aiHint, setAiHint] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [previewMode, setPreviewMode] = useState<'html' | 'pdf'>('html');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── CV store (localStorage + multi-CV) ──
  const store = useCVStore();
  const cv = store.active?.data ?? { ...EMPTY_CV, experience: [], education: [] };
  const setCv = (updater: CVData | ((prev: CVData) => CVData)) => {
    const next = typeof updater === 'function' ? updater(cv) : updater;
    store.updateCV(next);
  };

  // ── cv updaters ──
  const setTemplate = (t: TemplateId) => setCv(c => ({ ...c, template: t }));
  const setColor = (id: string) => setCv(c => ({ ...c, colorScheme: id }));
  const setPersonal = (key: keyof CVData['personal'], val: string) =>
    setCv(c => ({ ...c, personal: { ...c.personal, [key]: val } }));
  const setSummary = (s: string) => setCv(c => ({ ...c, summary: s }));

  const addExp = () => setCv(c => ({
    ...c, experience: [...c.experience, { id: uid(), company: '', title: '', startDate: '', endDate: 'Present', location: '', bullets: ['', '', ''] }],
  }));
  const removeExp = (id: string) => setCv(c => ({ ...c, experience: c.experience.filter(e => e.id !== id) }));
  const updateExp = (id: string, key: keyof Experience, val: string | string[]) =>
    setCv(c => ({ ...c, experience: c.experience.map(e => e.id === id ? { ...e, [key]: val } : e) }));
  const updateBullet = (expId: string, i: number, val: string) =>
    setCv(c => ({ ...c, experience: c.experience.map(e => e.id === expId ? { ...e, bullets: e.bullets.map((b, bi) => bi === i ? val : b) } : e) }));
  const addBullet = (expId: string) =>
    setCv(c => ({ ...c, experience: c.experience.map(e => e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e) }));

  const addEdu = () => setCv(c => ({
    ...c, education: [...c.education, { id: uid(), institution: '', degree: '', year: '', gpa: '' }],
  }));
  const removeEdu = (id: string) => setCv(c => ({ ...c, education: c.education.filter(e => e.id !== id) }));
  const updateEdu = (id: string, key: keyof Education, val: string) =>
    setCv(c => ({ ...c, education: c.education.map(e => e.id === id ? { ...e, [key]: val } : e) }));

  const addSkill = () => {
    if (!newSkill.trim() || cv.skills.includes(newSkill.trim())) return;
    setCv(c => ({ ...c, skills: [...c.skills, newSkill.trim()] }));
    setNewSkill('');
  };
  const removeSkill = (s: string) => setCv(c => ({ ...c, skills: c.skills.filter(x => x !== s) }));
  const quickSkill = (s: string) => { if (!cv.skills.includes(s)) setCv(c => ({ ...c, skills: [...c.skills, s] })); };

  const setCerts = (raw: string) => setCv(c => ({ ...c, certifications: raw.split('\n') }));

  // ── LinkedIn PDF import ──
  const handleLinkedInImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    setLoading('import');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/import-linkedin', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Merge keeping template/color
      store.importData({
        ...data.cv,
        template: cv.template,
        colorScheme: cv.colorScheme,
      });
      setStep(2);
    } catch (err: any) {
      setImportError(err.message ?? 'Import failed. Make sure ANTHROPIC_API_KEY is set.');
    } finally {
      setLoading(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  const download = async (fmt: 'pdf' | 'docx') => {
    setLoading(fmt);
    try {
      const res = await fetch(`/api/generate-${fmt}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cv),
      });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cv.personal.firstName || 'CV'}_${cv.personal.lastName}_Resume.${fmt}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(`Error generating ${fmt.toUpperCase()}. Make sure the server is running.`);
    } finally {
      setLoading(null);
    }
  };

  // ── AI improve ──
  const improve = async (section: string) => {
    setLoading('ai');
    try {
      const res = await fetch('/api/improve-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, section }),
      });
      const data = await res.json();
      setAiHint(data.result ?? '');
    } catch {
      setAiHint('AI service unavailable. Add ANTHROPIC_API_KEY to .env.local');
    } finally {
      setLoading(null);
    }
  };

  const scheme = COLOR_SCHEMES.find(c => c.id === cv.colorScheme) ?? COLOR_SCHEMES[0];
  const primary = `#${scheme.primary}`;

  // ── TSA checklist ──
  const checks = [
    [!!cv.personal.firstName, 'Contact info complete'],
    [!!cv.summary, 'Professional summary written'],
    [cv.experience.length > 0, 'At least one job added'],
    [cv.skills.length > 0, 'Skills section populated'],
    [!TEMPLATE_META[cv.template].twoColumn, 'Single-column layout (max ATS score)'],
    [true, 'Standard section headings (ATS compliant)'],
    [true, 'No photos or graphics embedded'],
    [cv.skills.length >= 5, 'At least 5 skills listed'],
  ];

  const nav = (delta: number) => setStep(s => Math.max(0, Math.min(STEPS.length - 1, s + delta)));

  const QUICK_SKILLS = [
    'Playwright','Selenium','Cypress','TypeScript','Python','JavaScript',
    'CI/CD','GitHub Actions','JIRA','REST API Testing','GraphQL Testing',
    'Agile/Scrum','AI-Augmented Testing','Docker','Postman',
  ];

  // ── render panels ────────────────────────────────────────────────────────

  const panels = [

    // 0 — Template
    <div key="template">
      <p className="panel-intro">Choose a layout. All templates are TSA/ATS compliant.</p>
      <div className="tmpl-grid">
        {(Object.entries(TEMPLATE_META) as [TemplateId, typeof TEMPLATE_META[TemplateId]][]).map(([id, meta]) => (
          <div key={id}
            className={clsx('tmpl-card', cv.template === id && 'tmpl-card--selected')}
            style={cv.template === id ? { borderColor: primary } : {}}
            onClick={() => setTemplate(id)}
          >
            <div className="tmpl-preview">
              <TemplateMini id={id} color={scheme.primary} />
            </div>
            <div className="tmpl-info">
              <span className="tmpl-name">{meta.name}</span>
              <span className="tmpl-desc">{meta.desc}</span>
              <span className="ats-badge" style={{ background: meta.atsScore === 100 ? '#EAF3DE' : '#FAEEDA', color: meta.atsScore === 100 ? '#1D9E75' : '#854F0B' }}>
                ATS {meta.atsScore}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // 1 — Colors
    <div key="colors">
      <p className="panel-intro">Pick a color scheme. Applied to headings, accents, and export files.</p>
      <div className="color-grid">
        {COLOR_SCHEMES.map(c => (
          <div key={c.id}
            className={clsx('color-swatch', cv.colorScheme === c.id && 'color-swatch--selected')}
            style={cv.colorScheme === c.id ? { borderColor: `#${c.primary}` } : {}}
            onClick={() => setColor(c.id)}
          >
            <div className="swatch-dots">
              {[c.primary, c.secondary, c.accent].map((hex, i) => (
                <span key={i} className="swatch-dot" style={{ background: `#${hex}` }} />
              ))}
            </div>
            <span className="swatch-name">{c.name}</span>
          </div>
        ))}
      </div>
    </div>,

    // 2 — Personal
    <div key="personal">
      <div className="field-row-2">
        <FieldGroup label="First name"><Input value={cv.personal.firstName} onChange={v => setPersonal('firstName', v)} placeholder="Carolina" /></FieldGroup>
        <FieldGroup label="Last name"><Input value={cv.personal.lastName} onChange={v => setPersonal('lastName', v)} placeholder="Yepes" /></FieldGroup>
      </div>
      <div className="field-row-2">
        <FieldGroup label="Target job title"><Input value={cv.personal.jobTitle} onChange={v => setPersonal('jobTitle', v)} placeholder="Senior QA Engineer / SDET" /></FieldGroup>
        <FieldGroup label="Email"><Input value={cv.personal.email} onChange={v => setPersonal('email', v)} placeholder="you@email.com" type="email" /></FieldGroup>
      </div>
      <div className="field-row-3">
        <FieldGroup label="Phone"><Input value={cv.personal.phone} onChange={v => setPersonal('phone', v)} placeholder="+1 (555) 000-0000" /></FieldGroup>
        <FieldGroup label="City, State"><Input value={cv.personal.location} onChange={v => setPersonal('location', v)} placeholder="Hesperia, CA" /></FieldGroup>
        <FieldGroup label="LinkedIn"><Input value={cv.personal.linkedin} onChange={v => setPersonal('linkedin', v)} placeholder="linkedin.com/in/yourname" /></FieldGroup>
      </div>
      <div className="field-row-2">
        <FieldGroup label="Portfolio / website"><Input value={cv.personal.website} onChange={v => setPersonal('website', v)} placeholder="itscarolinayepes.com" /></FieldGroup>
        <FieldGroup label="GitHub (optional)"><Input value={cv.personal.github} onChange={v => setPersonal('github', v)} placeholder="github.com/username" /></FieldGroup>
      </div>
    </div>,

    // 3 — Summary
    <div key="summary">
      <p className="panel-intro">3–5 sentences. Lead with years of experience, specialization, and biggest measurable impact.</p>
      <FieldGroup label="Professional summary">
        <Textarea value={cv.summary} onChange={setSummary} rows={6}
          placeholder="Senior QA Engineer and SDET with 12+ years of experience across web, mobile, gaming, and distributed systems. Specialized in AI-augmented testing, CI/CD pipeline integration, and building automation frameworks that reduce regression time by 60%..." />
      </FieldGroup>
      <button className="ai-btn" style={{ borderColor: primary, color: primary }} onClick={() => improve('summary')} disabled={!!loading}>
        {loading === 'ai' ? '✦ Improving...' : '✦ Improve with AI'}
      </button>
      {aiHint && (
        <div className="ai-hint">
          <p className="ai-hint-label">AI suggestion — click to apply:</p>
          <p className="ai-hint-text">{aiHint}</p>
          <button className="ai-apply-btn" style={{ background: primary }} onClick={() => { setSummary(aiHint); setAiHint(''); }}>Apply</button>
        </div>
      )}
    </div>,

    // 4 — Experience
    <div key="experience">
      <p className="panel-intro">Most recent first. Use strong action verbs and quantifiable results.</p>
      {cv.experience.map((exp, ei) => (
        <div key={exp.id} className="rep-block">
          <button className="rep-rm" onClick={() => removeExp(exp.id)} title="Remove">✕</button>
          <div className="field-row-2">
            <FieldGroup label="Company"><Input value={exp.company} onChange={v => updateExp(exp.id, 'company', v)} placeholder="Anthropic" /></FieldGroup>
            <FieldGroup label="Job title"><Input value={exp.title} onChange={v => updateExp(exp.id, 'title', v)} placeholder="Senior SDET" /></FieldGroup>
          </div>
          <div className="field-row-3">
            <FieldGroup label="Start date"><Input value={exp.startDate} onChange={v => updateExp(exp.id, 'startDate', v)} placeholder="Jan 2022" /></FieldGroup>
            <FieldGroup label="End date"><Input value={exp.endDate} onChange={v => updateExp(exp.id, 'endDate', v)} placeholder="Present" /></FieldGroup>
            <FieldGroup label="Location"><Input value={exp.location} onChange={v => updateExp(exp.id, 'location', v)} placeholder="Remote" /></FieldGroup>
          </div>
          <FieldGroup label="Key achievements">
            {exp.bullets.map((b, bi) => (
              <div key={bi} className="bullet-row">
                <span className="bullet-icon" style={{ color: primary }}>•</span>
                <Input value={b} onChange={v => updateBullet(exp.id, bi, v)}
                  placeholder="Built Playwright framework covering 400+ tests, reducing regression time by 60%" />
              </div>
            ))}
            <button className="add-bullet-btn" onClick={() => addBullet(exp.id)}>+ Add bullet</button>
          </FieldGroup>
        </div>
      ))}
      <button className="add-block-btn" style={{ borderColor: primary, color: primary }} onClick={addExp}>
        + Add position
      </button>
    </div>,

    // 5 — Education
    <div key="education">
      {cv.education.map(edu => (
        <div key={edu.id} className="rep-block">
          <button className="rep-rm" onClick={() => removeEdu(edu.id)} title="Remove">✕</button>
          <div className="field-row-2">
            <FieldGroup label="Institution"><Input value={edu.institution} onChange={v => updateEdu(edu.id, 'institution', v)} placeholder="Universidad EAFIT" /></FieldGroup>
            <FieldGroup label="Degree / Program"><Input value={edu.degree} onChange={v => updateEdu(edu.id, 'degree', v)} placeholder="B.S. Computer Science" /></FieldGroup>
          </div>
          <div className="field-row-2">
            <FieldGroup label="Year graduated"><Input value={edu.year} onChange={v => updateEdu(edu.id, 'year', v)} placeholder="2012" /></FieldGroup>
            <FieldGroup label="GPA (optional)"><Input value={edu.gpa ?? ''} onChange={v => updateEdu(edu.id, 'gpa', v)} placeholder="3.8/4.0" /></FieldGroup>
          </div>
        </div>
      ))}
      <button className="add-block-btn" style={{ borderColor: primary, color: primary }} onClick={addEdu}>
        + Add education
      </button>
      <div style={{ marginTop: '1.5rem' }}>
        <FieldGroup label="Certifications (one per line)">
          <Textarea value={cv.certifications.join('\n')} onChange={setCerts} rows={3}
            placeholder={"ISTQB Certified Tester\nCertified Scrum Master (CSM)\nAWS Certified Cloud Practitioner"} />
        </FieldGroup>
      </div>
    </div>,

    // 6 — Skills
    <div key="skills">
      <div className="skill-input-row">
        <Input value={newSkill} onChange={setNewSkill} placeholder="e.g. Playwright, TypeScript, CI/CD…" />
        <button className="btn-add-skill" style={{ background: primary }} onClick={addSkill}
          onKeyDown={e => e.key === 'Enter' && addSkill()}>Add</button>
      </div>
      <div className="skill-tags">
        {cv.skills.map(s => (
          <span key={s} className="skill-tag" style={{ background: `#${scheme.light}`, color: `#${scheme.primary}` }}>
            {s}
            <button onClick={() => removeSkill(s)} className="skill-tag-rm">×</button>
          </span>
        ))}
      </div>
      <p className="panel-intro" style={{ marginTop: '1rem' }}>Quick add:</p>
      <div className="quick-skills">
        {QUICK_SKILLS.filter(s => !cv.skills.includes(s)).map(s => (
          <button key={s} className="quick-skill-btn" onClick={() => quickSkill(s)}>+ {s}</button>
        ))}
      </div>
    </div>,

    // 7 — Export
    <div key="export">
      <p className="panel-intro">Download your CV. Both formats use your selected template and color scheme.</p>
      <div className="export-grid">
        <button className="export-card" onClick={() => download('pdf')} disabled={!!loading}>
          <span className="export-icon">📄</span>
          <span className="export-name">PDF</span>
          <span className="export-desc">Best for email and job portals. Preserves exact layout.</span>
          {loading === 'pdf' && <span className="export-loading">Generating…</span>}
        </button>
        <button className="export-card" onClick={() => download('docx')} disabled={!!loading}>
          <span className="export-icon">📝</span>
          <span className="export-name">Word (.docx)</span>
          <span className="export-desc">Editable. Required by some ATS and recruiters.</span>
          {loading === 'docx' && <span className="export-loading">Generating…</span>}
        </button>
      </div>

      <p className="panel-label" style={{ marginTop: '1.5rem', marginBottom: '.5rem' }}>ATS / TSA Checklist</p>
      <div className="checklist">
        {checks.map(([ok, label], i) => (
          <div key={i} className="check-item">
            <span className="check-icon" style={{ color: ok ? '#1D9E75' : '#BA7517' }}>{ok ? '✓' : '!'}</span>
            <span className="check-label" style={{ color: ok ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>{label as string}</span>
          </div>
        ))}
      </div>
    </div>,
  ];

  const pct = Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <>
      <style>{`
        .cv-wizard { max-width: 780px; margin: 0 auto; padding: 1rem 0; font-family: var(--font-sans); }
        .wizard-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .wizard-title { font-size: 18px; font-weight: 500; color: var(--color-text-primary); }
        .wizard-badge { font-size: 11px; background: var(--color-background-info); color: var(--color-text-info); padding: 3px 10px; border-radius: 20px; }
        .progress-wrap { height: 3px; background: var(--color-background-secondary); border-radius: 2px; margin-bottom: 1rem; }
        .progress-fill { height: 100%; border-radius: 2px; transition: width .3s; }
        .stepper { display: flex; gap: 0; border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); overflow: hidden; margin-bottom: 1.5rem; }
        .step { flex: 1; padding: 8px 2px; text-align: center; font-size: 10px; cursor: pointer; border-right: 0.5px solid var(--color-border-tertiary); background: var(--color-background-secondary); color: var(--color-text-secondary); transition: background .12s; user-select: none; }
        .step:last-child { border-right: none; }
        .step.active { background: var(--color-background-info); color: var(--color-text-info); font-weight: 500; }
        .step.done { background: var(--color-background-success); color: var(--color-text-success); }
        .step-num { display: block; font-size: 14px; font-weight: 500; margin-bottom: 1px; }
        .panel-intro { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 1rem; }
        .panel-label { font-size: 13px; font-weight: 500; color: var(--color-text-primary); }
        .field-group { display: flex; flex-direction: column; margin-bottom: .75rem; }
        .field-label { font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px; }
        .cv-input { width: 100%; font-size: 14px; padding: 8px 10px; border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); background: var(--color-background-primary); color: var(--color-text-primary); font-family: var(--font-sans); outline: none; }
        .cv-input:focus { border-color: #185FA5; box-shadow: 0 0 0 2px rgba(24,95,165,.1); }
        .cv-textarea { resize: vertical; min-height: 80px; line-height: 1.5; }
        .field-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        @media(max-width:560px){ .field-row-2,.field-row-3 { grid-template-columns: 1fr; } }

        /* template grid */
        .tmpl-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(140px,1fr)); gap: 10px; margin-bottom: 1rem; }
        .tmpl-card { border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); padding: .75rem; cursor: pointer; background: var(--color-background-primary); transition: border-color .12s; }
        .tmpl-card--selected { border-width: 2px; }
        .tmpl-preview { border-radius: 6px; overflow: hidden; background: var(--color-background-secondary); margin-bottom: 8px; }
        .tmpl-svg { width: 100%; height: 90px; display: block; }
        .tmpl-info { display: flex; flex-direction: column; gap: 2px; }
        .tmpl-name { font-size: 12px; font-weight: 500; color: var(--color-text-primary); }
        .tmpl-desc { font-size: 10px; color: var(--color-text-secondary); }
        .ats-badge { display: inline-block; font-size: 10px; padding: 2px 7px; border-radius: 20px; margin-top: 4px; font-weight: 500; }

        /* color grid */
        .color-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(100px,1fr)); gap: 8px; margin-bottom: 1rem; }
        .color-swatch { border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); padding: .6rem; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; background: var(--color-background-primary); transition: border-color .12s; }
        .color-swatch--selected { border-width: 2px; }
        .swatch-dots { display: flex; gap: 4px; }
        .swatch-dot { width: 16px; height: 16px; border-radius: 50%; }
        .swatch-name { font-size: 11px; color: var(--color-text-secondary); }

        /* rep blocks */
        .rep-block { border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); padding: 1rem; margin-bottom: .75rem; position: relative; background: var(--color-background-secondary); }
        .rep-rm { position: absolute; top: 8px; right: 8px; background: none; border: none; font-size: 14px; cursor: pointer; color: var(--color-text-secondary); padding: 2px 6px; border-radius: 4px; }
        .rep-rm:hover { background: var(--color-background-danger); color: var(--color-text-danger); }
        .add-block-btn { width: 100%; padding: 8px; font-size: 13px; border: 0.5px dashed; border-radius: var(--border-radius-md); background: none; cursor: pointer; margin-bottom: 1rem; }
        .bullet-row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
        .bullet-icon { font-size: 16px; flex-shrink: 0; }
        .add-bullet-btn { font-size: 12px; color: var(--color-text-secondary); background: none; border: none; cursor: pointer; padding: 2px 0; margin-top: 2px; }

        /* skills */
        .skill-input-row { display: flex; gap: 8px; margin-bottom: .75rem; }
        .btn-add-skill { padding: 8px 16px; border: none; border-radius: var(--border-radius-md); color: white; font-size: 14px; cursor: pointer; white-space: nowrap; font-family: var(--font-sans); }
        .skill-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: .5rem; }
        .skill-tag { display: flex; align-items: center; gap: 4px; font-size: 12px; padding: 3px 10px; border-radius: 20px; }
        .skill-tag-rm { background: none; border: none; cursor: pointer; font-size: 15px; line-height: 1; padding: 0; color: inherit; }
        .quick-skills { display: flex; flex-wrap: wrap; gap: 6px; }
        .quick-skill-btn { font-size: 12px; padding: 4px 10px; border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); background: var(--color-background-secondary); cursor: pointer; color: var(--color-text-secondary); }
        .quick-skill-btn:hover { background: var(--color-background-primary); }

        /* AI */
        .ai-btn { margin-top: .5rem; font-size: 13px; padding: 7px 14px; border: 0.5px solid; border-radius: var(--border-radius-md); background: none; cursor: pointer; font-family: var(--font-sans); }
        .ai-hint { margin-top: 1rem; border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); padding: 1rem; background: var(--color-background-secondary); }
        .ai-hint-label { font-size: 11px; color: var(--color-text-secondary); margin-bottom: .5rem; }
        .ai-hint-text { font-size: 13px; color: var(--color-text-primary); line-height: 1.6; margin-bottom: .75rem; }
        .ai-apply-btn { font-size: 13px; padding: 6px 14px; border: none; border-radius: var(--border-radius-md); color: white; cursor: pointer; font-family: var(--font-sans); }

        /* export */
        .export-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .export-card { border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); padding: 1.25rem; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; background: var(--color-background-primary); transition: border-color .12s; font-family: var(--font-sans); }
        .export-card:hover:not(:disabled) { border-color: #185FA5; background: #E6F1FB; }
        .export-card:disabled { opacity: .6; cursor: default; }
        .export-icon { font-size: 28px; }
        .export-name { font-size: 14px; font-weight: 500; color: var(--color-text-primary); }
        .export-desc { font-size: 12px; color: var(--color-text-secondary); text-align: center; }
        .export-loading { font-size: 12px; color: #185FA5; }
        .checklist { border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); overflow: hidden; }
        .check-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-bottom: 0.5px solid var(--color-border-tertiary); font-size: 13px; }
        .check-item:last-child { border-bottom: none; }
        .check-icon { font-size: 14px; flex-shrink: 0; }

        /* nav */
        .nav-row { display: flex; justify-content: space-between; margin-top: 1.5rem; }
        .btn-back { background: none; border: 0.5px solid var(--color-border-secondary); border-radius: var(--border-radius-md); padding: 8px 20px; font-size: 14px; cursor: pointer; color: var(--color-text-primary); font-family: var(--font-sans); }
        .btn-next { border: none; border-radius: var(--border-radius-md); padding: 8px 20px; font-size: 14px; cursor: pointer; color: white; font-family: var(--font-sans); }

        /* two-panel layout */
        .app-shell { display: grid; grid-template-columns: 1fr; gap: 0; }
        @media(min-width: 960px) { .app-shell { grid-template-columns: minmax(0,1fr) 340px; gap: 24px; align-items: start; } }
        .wizard-col { min-width: 0; }
        .preview-col { position: sticky; top: 16px; }
        .preview-panel { border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); overflow: hidden; background: #e8e8e6; }
        .preview-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--color-background-secondary); border-bottom: 0.5px solid var(--color-border-tertiary); }
        .preview-label { font-size: 11px; color: var(--color-text-secondary); font-weight: 500; }
        .preview-toggle { font-size: 11px; background: none; border: none; cursor: pointer; color: var(--color-text-secondary); padding: 2px 6px; }
        .preview-scroll { padding: 16px; overflow-y: auto; max-height: 80vh; }
        .preview-page { transform-origin: top left; }

        /* import banner */
        .import-banner { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--color-background-secondary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); margin-bottom: 1rem; }
        .import-label { font-size: 12px; color: var(--color-text-secondary); flex: 1; }
        .import-btn { font-size: 12px; padding: 5px 12px; border: 0.5px solid var(--color-border-secondary); border-radius: var(--border-radius-md); background: none; cursor: pointer; color: var(--color-text-primary); white-space: nowrap; font-family: var(--font-sans); }
        .import-loading { font-size: 12px; color: #185FA5; }
        .import-error { font-size: 11px; color: var(--color-text-danger); margin-top: 4px; margin-bottom: .5rem; }

        /* save status */
        .save-status { font-size: 11px; padding: 2px 8px; border-radius: 20px; }
        .save-status.saved { color: #1D9E75; background: #EAF3DE; }
        .save-status.saving { color: #888; background: var(--color-background-secondary); }
        .save-status.unsaved { color: #BA7517; background: #FAEEDA; }

        /* preview mode toggle */
        .preview-mode-tabs { display: flex; gap: 0; }
        .preview-mode-tab { font-size: 10px; padding: 3px 10px; border: 0.5px solid var(--color-border-tertiary); background: none; cursor: pointer; color: var(--color-text-secondary); font-family: var(--font-sans); }
        .preview-mode-tab:first-child { border-radius: var(--border-radius-md) 0 0 var(--border-radius-md); }
        .preview-mode-tab:last-child { border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0; border-left: none; }
        .preview-mode-tab.active { background: #185FA5; color: white; border-color: #185FA5; }
        .preview-pdf-wrap { height: 70vh; }
      `}</style>

      {/* Hidden file input for LinkedIn import */}
      <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleLinkedInImport} />

      <div className="app-shell">
        {/* ── Left: wizard ── */}
        <div className="wizard-col">
          <div className="cv-wizard">

            {/* Top bar: CV manager + save status + ATS badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
              <CVManager
                cvs={store.cvs}
                activeId={store.activeId}
                activeName={store.active?.name ?? 'My Resume'}
                onSwitch={id => { store.switchCV(id); setStep(0); }}
                onCreate={() => { store.createCV(); setStep(0); }}
                onDuplicate={() => { store.duplicateCV(); setStep(0); }}
                onDelete={store.deleteCV}
                onRename={store.renameCV}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`save-status ${store.saveStatus}`}>
                  {store.saveStatus === 'saved' ? '✓ Saved' : store.saveStatus === 'unsaved' ? '● Unsaved' : '⟳ Saving…'}
                </span>
                <span className="wizard-badge">ATS Optimized</span>
              </div>
            </div>

            {/* LinkedIn import banner */}
            <div className="import-banner">
              <span className="import-label">Have a LinkedIn PDF or existing resume? Import it to auto-fill.</span>
              {loading === 'import'
                ? <span className="import-loading">Parsing…</span>
                : <button className="import-btn" onClick={() => fileInputRef.current?.click()}>
                    Import PDF ↑
                  </button>
              }
            </div>
            {importError && <div className="import-error">{importError}</div>}

            <div className="progress-wrap">
              <div className="progress-fill" style={{ width: `${pct}%`, background: primary }} />
            </div>

            <div className="stepper">
              {STEPS.map((s, i) => (
                <div key={s} className={clsx('step', i === step && 'active', i < step && 'done')}
                  onClick={() => setStep(i)}>
                  <span className="step-num">{i + 1}</span>
                  {s}
                </div>
              ))}
            </div>

            <div className="panel-body">
              {panels[step]}
            </div>

            <div className="nav-row">
              {step > 0
                ? <button className="btn-back" onClick={() => nav(-1)}>← Back</button>
                : <div />}
              {step < STEPS.length - 1
                ? <button className="btn-next" style={{ background: primary }} onClick={() => nav(1)}>
                    Next: {STEPS[step + 1]} →
                  </button>
                : <div />}
            </div>
          </div>
        </div>

        {/* ── Right: live preview ── */}
        <div className="preview-col">
          <div className="preview-panel">
            <div className="preview-panel-header">
              <span className="preview-label">{TEMPLATE_META[cv.template].name} · {COLOR_SCHEMES.find(c => c.id === cv.colorScheme)?.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="preview-mode-tabs">
                  <button
                    className={`preview-mode-tab${previewMode === 'html' ? ' active' : ''}`}
                    onClick={() => setPreviewMode('html')}
                  >HTML</button>
                  <button
                    className={`preview-mode-tab${previewMode === 'pdf' ? ' active' : ''}`}
                    onClick={() => setPreviewMode('pdf')}
                  >PDF</button>
                </div>
                <button className="preview-toggle" onClick={() => setShowPreview(v => !v)}>
                  {showPreview ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {showPreview && (
              <>
                {previewMode === 'html' && (
                  <div className="preview-scroll">
                    <div style={{ transform: 'scale(0.72)', transformOrigin: 'top left', width: '138.9%' }}>
                      <CVPreview cv={cv} />
                    </div>
                  </div>
                )}
                {previewMode === 'pdf' && (
                  <div className="preview-pdf-wrap">
                    <PDFPreviewPanel cv={cv} visible={previewMode === 'pdf' && showPreview} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
