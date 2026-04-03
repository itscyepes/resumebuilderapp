'use client';
// components/CVPreview.tsx
import { CVData, COLOR_SCHEMES, ColorScheme, TemplateId } from '@/lib/cvTypes';

function getScheme(id: string): ColorScheme {
  return COLOR_SCHEMES.find(c => c.id === id) ?? COLOR_SCHEMES[0];
}

// ── Classic ──────────────────────────────────────────────────────────────────

function ClassicPreview({ cv, s }: { cv: CVData; s: ColorScheme }) {
  const p = cv.personal;
  const primary = `#${s.primary}`;
  const secondary = `#${s.secondary}`;
  const contact = [p.email, p.phone, p.location, p.linkedin, p.website, p.github].filter(Boolean);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, color: '#2C2C2A', lineHeight: 1.4 }}>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: primary, marginBottom: 2 }}>
          {p.firstName || 'Your'} {p.lastName || 'Name'}
        </div>
        <div style={{ fontSize: 10, color: secondary, fontStyle: 'italic', marginBottom: 4 }}>
          {p.jobTitle || 'Job Title'}
        </div>
        <div style={{ fontSize: 7.5, color: '#888', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 6px' }}>
          {contact.map((c, i) => <span key={i}>{c}{i < contact.length - 1 ? ' | ' : ''}</span>)}
        </div>
      </div>
      <div style={{ borderBottom: `2px solid ${primary}`, marginBottom: 8 }} />
      {cv.summary && <Section title="Professional Summary" primary={primary}>
        <p style={{ fontSize: 8, lineHeight: 1.5, margin: 0 }}>{cv.summary}</p>
      </Section>}
      {cv.experience.length > 0 && <Section title="Experience" primary={primary}>
        {cv.experience.map(exp => <ExpBlock key={exp.id} exp={exp} primary={primary} secondary={secondary} />)}
      </Section>}
      {cv.education.length > 0 && <Section title="Education" primary={primary}>
        {cv.education.map(edu => <EduBlock key={edu.id} edu={edu} secondary={secondary} />)}
      </Section>}
      {cv.certifications.filter(Boolean).length > 0 && <Section title="Certifications" primary={primary}>
        {cv.certifications.filter(Boolean).map((c, i) => <BulletItem key={i} text={c} primary={primary} />)}
      </Section>}
      {cv.skills.length > 0 && <Section title="Skills" primary={primary}>
        <p style={{ fontSize: 8, margin: 0, color: '#444' }}>{cv.skills.join('  ·  ')}</p>
      </Section>}
    </div>
  );
}

// ── Executive ─────────────────────────────────────────────────────────────────

function ExecutivePreview({ cv, s }: { cv: CVData; s: ColorScheme }) {
  const p = cv.personal;
  const primary = `#${s.primary}`;
  const secondary = `#${s.secondary}`;
  const contact = [p.email, p.phone, p.location, p.linkedin].filter(Boolean);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, color: '#2C2C2A', lineHeight: 1.4 }}>
      <div style={{ borderTop: `5px solid ${primary}`, marginBottom: 8 }} />
      <div style={{ fontSize: 22, fontWeight: 800, color: primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>
        {p.firstName || 'Your'} {p.lastName || 'Name'}
      </div>
      <div style={{ fontSize: 10, color: secondary, marginBottom: 4 }}>{p.jobTitle || 'Job Title'}</div>
      <div style={{ fontSize: 7.5, color: '#888', marginBottom: 4 }}>
        {contact.join('   |   ')}
      </div>
      <div style={{ borderBottom: `5px solid ${primary}`, marginBottom: 8 }} />
      {cv.summary && <p style={{ fontSize: 8, fontStyle: 'italic', color: '#444', marginBottom: 8, lineHeight: 1.5 }}>{cv.summary}</p>}
      {cv.experience.length > 0 && <ExecSection title="Experience" primary={primary} accent={`#${s.accent}`}>
        {cv.experience.map(exp => (
          <div key={exp.id} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 1 }}>
              <span style={{ fontWeight: 700, fontSize: 9 }}>{exp.title}</span>
              <span style={{ color: secondary, fontSize: 8.5 }}>| {exp.company}</span>
              <span style={{ color: '#888', fontSize: 7.5, fontStyle: 'italic' }}>· {exp.startDate}–{exp.endDate}</span>
            </div>
            {exp.bullets.filter(Boolean).map((b, i) => <BulletItem key={i} text={b} primary={primary} />)}
          </div>
        ))}
      </ExecSection>}
      {cv.education.length > 0 && <ExecSection title="Education" primary={primary} accent={`#${s.accent}`}>
        {cv.education.map(edu => <EduBlock key={edu.id} edu={edu} secondary={secondary} />)}
      </ExecSection>}
      {cv.skills.length > 0 && <ExecSection title="Core Skills" primary={primary} accent={`#${s.accent}`}>
        <p style={{ fontSize: 8, margin: 0, color: '#444' }}>{cv.skills.join('   ·   ')}</p>
      </ExecSection>}
    </div>
  );
}

// ── Bold ──────────────────────────────────────────────────────────────────────

function BoldPreview({ cv, s }: { cv: CVData; s: ColorScheme }) {
  const p = cv.personal;
  const primary = `#${s.primary}`;
  const secondary = `#${s.secondary}`;
  const contact = [p.email, p.phone, p.location].filter(Boolean);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, color: '#2C2C2A', lineHeight: 1.4 }}>
      <div style={{ background: primary, padding: '12px 12px 10px', marginBottom: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 2 }}>
          {p.firstName || 'Your'} {p.lastName || 'Name'}
        </div>
        <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>{p.jobTitle || 'Job Title'}</div>
        <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.6)' }}>{contact.join('  ·  ')}</div>
      </div>
      {cv.summary && <Section title="Summary" primary={primary}>
        <p style={{ fontSize: 8, lineHeight: 1.5, margin: 0 }}>{cv.summary}</p>
      </Section>}
      {cv.experience.length > 0 && <Section title="Experience" primary={primary}>
        {cv.experience.map(exp => <ExpBlock key={exp.id} exp={exp} primary={primary} secondary={secondary} />)}
      </Section>}
      {cv.education.length > 0 && <Section title="Education" primary={primary}>
        {cv.education.map(edu => <EduBlock key={edu.id} edu={edu} secondary={secondary} />)}
      </Section>}
      {cv.skills.length > 0 && <Section title="Skills" primary={primary}>
        <p style={{ fontSize: 8, margin: 0, color: '#444' }}>{cv.skills.join('  ·  ')}</p>
      </Section>}
    </div>
  );
}

// ── Modern (sidebar) ──────────────────────────────────────────────────────────

function ModernPreview({ cv, s }: { cv: CVData; s: ColorScheme }) {
  const p = cv.personal;
  const primary = `#${s.primary}`;
  const secondary = `#${s.secondary}`;
  const contact = [p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, color: '#2C2C2A', display: 'flex', lineHeight: 1.4, minHeight: 400 }}>
      {/* Sidebar */}
      <div style={{ width: '32%', background: primary, padding: '12px 8px', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
          {p.firstName || 'Your'}<br />{p.lastName || 'Name'}
        </div>
        <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>{p.jobTitle || 'Job Title'}</div>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', marginBottom: 6 }} />
        <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.55)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 1 }}>Contact</div>
        {contact.map((c, i) => <div key={i} style={{ fontSize: 7, color: 'rgba(255,255,255,0.8)', marginBottom: 2, wordBreak: 'break-all' }}>{c}</div>)}
        {cv.skills.length > 0 && <>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', margin: '8px 0 6px' }} />
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.55)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Skills</div>
          {cv.skills.map((sk, i) => (
            <div key={i} style={{ fontSize: 7, color: 'rgba(255,255,255,0.85)', padding: '1px 4px', background: 'rgba(255,255,255,0.15)', borderRadius: 3, marginBottom: 2, display: 'inline-block', marginRight: 2 }}>{sk}</div>
          ))}
        </>}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: '12px 10px' }}>
        {cv.summary && <Section title="Summary" primary={primary}>
          <p style={{ fontSize: 8, lineHeight: 1.5, margin: 0 }}>{cv.summary}</p>
        </Section>}
        {cv.experience.length > 0 && <Section title="Experience" primary={primary}>
          {cv.experience.map(exp => <ExpBlock key={exp.id} exp={exp} primary={primary} secondary={secondary} />)}
        </Section>}
        {cv.education.length > 0 && <Section title="Education" primary={primary}>
          {cv.education.map(edu => <EduBlock key={edu.id} edu={edu} secondary={secondary} />)}
        </Section>}
        {cv.certifications.filter(Boolean).length > 0 && <Section title="Certifications" primary={primary}>
          {cv.certifications.filter(Boolean).map((c, i) => <BulletItem key={i} text={c} primary={primary} />)}
        </Section>}
      </div>
    </div>
  );
}

// ── Sidebar Dark ──────────────────────────────────────────────────────────────

function SidebarDarkPreview({ cv, s }: { cv: CVData; s: ColorScheme }) {
  const p = cv.personal;
  const primary = `#${s.primary}`;
  const secondary = `#${s.secondary}`;
  const contact = [p.email, p.phone, p.location, p.linkedin].filter(Boolean);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, color: '#2C2C2A', display: 'flex', lineHeight: 1.4, minHeight: 400 }}>
      {/* Dark sidebar */}
      <div style={{ width: '30%', background: '#1a1a2e', padding: '12px 8px', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: primary, marginBottom: 2 }}>
          {p.firstName || 'Your'}<br />{p.lastName || 'Name'}
        </div>
        <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>{p.jobTitle}</div>
        <div style={{ borderBottom: `1px solid ${primary}`, marginBottom: 6, opacity: 0.4 }} />
        {contact.map((c, i) => <div key={i} style={{ fontSize: 7, color: 'rgba(255,255,255,0.65)', marginBottom: 3, wordBreak: 'break-all' }}>{c}</div>)}
        {cv.skills.length > 0 && <>
          <div style={{ borderBottom: `1px solid ${primary}`, margin: '8px 0 6px', opacity: 0.4 }} />
          <div style={{ fontSize: 7, color: primary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Skills</div>
          {cv.skills.map((sk, i) => (
            <div key={i} style={{ fontSize: 7, color: 'rgba(255,255,255,0.75)', marginBottom: 2 }}>· {sk}</div>
          ))}
        </>}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: '12px 10px' }}>
        {cv.summary && <Section title="Summary" primary={primary}>
          <p style={{ fontSize: 8, lineHeight: 1.5, margin: 0 }}>{cv.summary}</p>
        </Section>}
        {cv.experience.length > 0 && <Section title="Experience" primary={primary}>
          {cv.experience.map(exp => <ExpBlock key={exp.id} exp={exp} primary={primary} secondary={secondary} />)}
        </Section>}
        {cv.education.length > 0 && <Section title="Education" primary={primary}>
          {cv.education.map(edu => <EduBlock key={edu.id} edu={edu} secondary={secondary} />)}
        </Section>}
        {cv.certifications.filter(Boolean).length > 0 && <Section title="Certifications" primary={primary}>
          {cv.certifications.filter(Boolean).map((c, i) => <BulletItem key={i} text={c} primary={primary} />)}
        </Section>}
      </div>
    </div>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────

function TimelinePreview({ cv, s }: { cv: CVData; s: ColorScheme }) {
  const p = cv.personal;
  const primary = `#${s.primary}`;
  const secondary = `#${s.secondary}`;
  const contact = [p.email, p.phone, p.location, p.linkedin, p.website, p.github].filter(Boolean);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, color: '#2C2C2A', lineHeight: 1.4 }}>
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#2C2C2A', marginBottom: 2 }}>
          {p.firstName || 'Your'} {p.lastName || 'Name'}
        </div>
        <div style={{ fontSize: 10, color: primary, marginBottom: 3 }}>{p.jobTitle || 'Job Title'}</div>
        <div style={{ fontSize: 7.5, color: '#888' }}>{contact.join('  ·  ')}</div>
      </div>
      <div style={{ borderBottom: `2px solid ${primary}`, marginBottom: 8 }} />

      {cv.summary && <Section title="Summary" primary={primary}>
        <p style={{ fontSize: 8, lineHeight: 1.5, margin: 0 }}>{cv.summary}</p>
      </Section>}

      {cv.experience.length > 0 && <>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: primary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 8 }}>Experience</div>
        <div style={{ borderBottom: `1px solid #${s.accent}`, marginBottom: 8 }} />
        <div style={{ position: 'relative', paddingLeft: 16 }}>
          <div style={{ position: 'absolute', left: 4, top: 0, bottom: 0, width: 1, background: `${primary}40` }} />
          {cv.experience.map(exp => (
            <div key={exp.id} style={{ position: 'relative', marginBottom: 10 }}>
              <div style={{ position: 'absolute', left: -15, top: 2, width: 7, height: 7, borderRadius: '50%', background: primary, border: `2px solid white`, boxShadow: `0 0 0 1px ${primary}` }} />
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 9 }}>{exp.title}</span>
                <span style={{ color: secondary, fontSize: 8.5 }}>— {exp.company}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#888', fontStyle: 'italic', marginBottom: 3 }}>{exp.startDate}–{exp.endDate}{exp.location ? ` · ${exp.location}` : ''}</div>
              {exp.bullets.filter(Boolean).map((b, i) => <BulletItem key={i} text={b} primary={primary} />)}
            </div>
          ))}
        </div>
      </>}

      {cv.education.length > 0 && <Section title="Education" primary={primary}>
        {cv.education.map(edu => <EduBlock key={edu.id} edu={edu} secondary={secondary} />)}
      </Section>}
      {cv.skills.length > 0 && <Section title="Skills" primary={primary}>
        <p style={{ fontSize: 8, margin: 0, color: '#444' }}>{cv.skills.join('  ·  ')}</p>
      </Section>}
    </div>
  );
}

// ── Minimal ───────────────────────────────────────────────────────────────────

function MinimalPreview({ cv, s }: { cv: CVData; s: ColorScheme }) {
  const p = cv.personal;
  const primary = `#${s.primary}`;
  const secondary = `#${s.secondary}`;
  const contact = [p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, color: '#2C2C2A', lineHeight: 1.5 }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#1a1a1a', marginBottom: 2, letterSpacing: -0.5 }}>
          {p.firstName || 'Your'} {p.lastName || 'Name'}
        </div>
        <div style={{ fontSize: 10, color: primary, marginBottom: 4 }}>{p.jobTitle || 'Job Title'}</div>
        <div style={{ fontSize: 7.5, color: '#aaa' }}>{contact.join('  ·  ')}</div>
      </div>
      <div style={{ borderBottom: `1px solid ${primary}`, marginBottom: 10, opacity: 0.4 }} />

      {cv.summary && <>
        <div style={{ fontSize: 7.5, color: primary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, fontWeight: 600 }}>Summary</div>
        <p style={{ fontSize: 8, lineHeight: 1.6, margin: '0 0 10px', color: '#555' }}>{cv.summary}</p>
      </>}

      {cv.experience.length > 0 && <>
        <div style={{ fontSize: 7.5, color: primary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontWeight: 600 }}>Experience</div>
        {cv.experience.map(exp => (
          <div key={exp.id} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 9.5, marginBottom: 1 }}>{exp.title}</div>
            <div style={{ fontSize: 8, color: secondary, marginBottom: 1 }}>{exp.company}</div>
            <div style={{ fontSize: 7.5, color: '#aaa', marginBottom: 3, fontStyle: 'italic' }}>{exp.startDate}–{exp.endDate}</div>
            {exp.bullets.filter(Boolean).map((b, i) => <BulletItem key={i} text={b} primary={primary} />)}
          </div>
        ))}
      </>}

      {cv.education.length > 0 && <>
        <div style={{ fontSize: 7.5, color: primary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontWeight: 600 }}>Education</div>
        {cv.education.map(edu => <EduBlock key={edu.id} edu={edu} secondary={secondary} />)}
      </>}

      {cv.skills.length > 0 && <>
        <div style={{ fontSize: 7.5, color: primary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, fontWeight: 600 }}>Skills</div>
        <p style={{ fontSize: 8, margin: 0, color: '#555' }}>{cv.skills.join('  ·  ')}</p>
      </>}
    </div>
  );
}

// ── Compact ───────────────────────────────────────────────────────────────────

function CompactPreview({ cv, s }: { cv: CVData; s: ColorScheme }) {
  const p = cv.personal;
  const primary = `#${s.primary}`;
  const secondary = `#${s.secondary}`;
  const contact = [p.email, p.phone, p.location, p.linkedin, p.website, p.github].filter(Boolean);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 8.5, color: '#2C2C2A', lineHeight: 1.35 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: primary }}>{p.firstName || 'Your'} {p.lastName || 'Name'}</div>
          <div style={{ fontSize: 8.5, color: secondary }}>{p.jobTitle || 'Job Title'}</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 7, color: '#888' }}>
          {contact.slice(0, 3).map((c, i) => <div key={i}>{c}</div>)}
        </div>
      </div>
      <div style={{ borderBottom: `1.5px solid ${primary}`, marginBottom: 5 }} />
      {cv.summary && <p style={{ fontSize: 7.5, margin: '0 0 5px', lineHeight: 1.4, color: '#555' }}>{cv.summary}</p>}
      {cv.experience.length > 0 && <>
        <div style={{ fontSize: 8, fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Experience</div>
        <div style={{ borderBottom: `0.5px solid #ddd`, marginBottom: 4 }} />
        {cv.experience.map(exp => (
          <div key={exp.id} style={{ marginBottom: 5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 8.5 }}>{exp.title} — <span style={{ color: secondary }}>{exp.company}</span></span>
              <span style={{ fontSize: 7, color: '#888', fontStyle: 'italic' }}>{exp.startDate}–{exp.endDate}</span>
            </div>
            {exp.bullets.filter(Boolean).map((b, i) => <BulletItem key={i} text={b} primary={primary} size={7.5} />)}
          </div>
        ))}
      </>}
      {cv.education.length > 0 && <>
        <div style={{ fontSize: 8, fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2, marginTop: 4 }}>Education</div>
        <div style={{ borderBottom: `0.5px solid #ddd`, marginBottom: 4 }} />
        {cv.education.map(edu => (
          <div key={edu.id} style={{ marginBottom: 3 }}>
            <span style={{ fontWeight: 700 }}>{edu.degree}</span> — <span style={{ color: secondary }}>{edu.institution}</span> <span style={{ color: '#888', fontSize: 7.5 }}>{edu.year}</span>
          </div>
        ))}
      </>}
      {cv.skills.length > 0 && <>
        <div style={{ fontSize: 8, fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2, marginTop: 4 }}>Skills</div>
        <div style={{ borderBottom: `0.5px solid #ddd`, marginBottom: 3 }} />
        <p style={{ fontSize: 7.5, margin: 0, color: '#444' }}>{cv.skills.join('  ·  ')}</p>
      </>}
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Section({ title, primary, children }: { title: string; primary: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: primary, marginBottom: 2 }}>{title}</div>
      <div style={{ borderBottom: `1px solid ${primary}50`, marginBottom: 5 }} />
      {children}
    </div>
  );
}

function ExecSection({ title, primary, accent, children }: { title: string; primary: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 8, fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{title}</div>
      <div style={{ borderBottom: `0.5px solid ${accent}`, marginBottom: 6 }} />
      {children}
    </div>
  );
}

function ExpBlock({ exp, primary, secondary }: { exp: any; primary: string; secondary: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'baseline', marginBottom: 1 }}>
        <span style={{ fontWeight: 700, fontSize: 9 }}>{exp.title}</span>
        <span style={{ color: secondary, fontSize: 8.5 }}>— {exp.company}</span>
      </div>
      <div style={{ fontSize: 7.5, color: '#888', fontStyle: 'italic', marginBottom: 3 }}>
        {exp.startDate}–{exp.endDate}{exp.location ? ` · ${exp.location}` : ''}
      </div>
      {exp.bullets.filter(Boolean).map((b: string, i: number) => <BulletItem key={i} text={b} primary={primary} />)}
    </div>
  );
}

function EduBlock({ edu, secondary }: { edu: any; secondary: string }) {
  return (
    <div style={{ marginBottom: 5 }}>
      <div style={{ fontWeight: 700, fontSize: 9 }}>{edu.degree}</div>
      <div style={{ fontSize: 8, color: secondary }}>{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</div>
      <div style={{ fontSize: 7.5, color: '#888', fontStyle: 'italic' }}>{edu.year}</div>
    </div>
  );
}

function BulletItem({ text, primary, size = 8 }: { text: string; primary: string; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 2, paddingLeft: 4 }}>
      <span style={{ color: primary, flexShrink: 0, fontSize: size }}>•</span>
      <span style={{ fontSize: size, lineHeight: 1.4 }}>{text}</span>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function CVPreview({ cv }: { cv: CVData }) {
  const s = getScheme(cv.colorScheme);

  const renderer: Record<TemplateId, React.ReactNode> = {
    classic:       <ClassicPreview cv={cv} s={s} />,
    modern:        <ModernPreview cv={cv} s={s} />,
    compact:       <CompactPreview cv={cv} s={s} />,
    executive:     <ExecutivePreview cv={cv} s={s} />,
    minimal:       <MinimalPreview cv={cv} s={s} />,
    bold:          <BoldPreview cv={cv} s={s} />,
    'sidebar-dark': <SidebarDarkPreview cv={cv} s={s} />,
    timeline:      <TimelinePreview cv={cv} s={s} />,
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: 4,
      boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
      padding: '24px 20px',
      minHeight: 500,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Page edge decoration */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 0, height: 0,
        borderStyle: 'solid',
        borderWidth: '0 18px 18px 0',
        borderColor: `transparent #e0e0e0 transparent transparent`,
      }} />
      {renderer[cv.template] ?? renderer.classic}
    </div>
  );
}
