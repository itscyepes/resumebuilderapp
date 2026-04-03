// lib/buildDocx.ts
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, BorderStyle, WidthType, ShadingType,
  VerticalAlign, UnderlineType, ExternalHyperlink,
} from 'docx';
import { CVData, COLOR_SCHEMES, ColorScheme } from './cvTypes';

// ── helpers ────────────────────────────────────────────────────────────────

function hex(s: string) { return s.replace('#', ''); }

function getScheme(id: string): ColorScheme {
  return COLOR_SCHEMES.find(c => c.id === id) ?? COLOR_SCHEMES[0];
}

function rule(color: string, size = 8): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size, color: hex(color), space: 1 } },
    spacing: { before: 0, after: 120 },
    children: [],
  });
}

function sectionHeading(text: string, scheme: ColorScheme, opts: { caps?: boolean } = {}): Paragraph[] {
  return [
    new Paragraph({
      spacing: { before: 240, after: 60 },
      children: [
        new TextRun({
          text: opts.caps ? text.toUpperCase() : text,
          bold: true,
          size: 26,
          font: 'Arial',
          color: scheme.primary,
          allCaps: opts.caps,
        }),
      ],
    }),
    rule(scheme.primary, 6),
  ];
}

function bulletParagraph(text: string, font = 'Arial', size = 20): Paragraph {
  return new Paragraph({
    numbering: { reference: 'cv-bullets', level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font, size })],
  });
}

function contact(icon: string, text: string, font: string): Paragraph {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({ text: `${icon}  ${text}`, font, size: 18, color: '444441' }),
    ],
  });
}

const NOOP_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NO_BORDERS = { top: NOOP_BORDER, bottom: NOOP_BORDER, left: NOOP_BORDER, right: NOOP_BORDER };

// ── template builders ──────────────────────────────────────────────────────

function buildClassic(cv: CVData, scheme: ColorScheme): Paragraph[] {
  const { personal: p, summary, experience, education, certifications, skills } = cv;
  const blocks: Paragraph[] = [];

  // Header
  blocks.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
    children: [new TextRun({ text: `${p.firstName} ${p.lastName}`, bold: true, size: 52, font: 'Arial', color: scheme.primary })],
  }));
  blocks.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
    children: [new TextRun({ text: p.jobTitle, size: 26, font: 'Arial', color: scheme.secondary, italics: true })],
  }));

  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.website, p.github].filter(Boolean);
  blocks.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 40 },
    children: contactParts.flatMap((val, i) => [
      new TextRun({ text: val, size: 18, font: 'Arial', color: '444441' }),
      ...(i < contactParts.length - 1 ? [new TextRun({ text: '  |  ', size: 18, font: 'Arial', color: 'AAAAAA' })] : []),
    ]),
  }));
  blocks.push(rule(scheme.primary, 10));

  // Summary
  if (summary) {
    blocks.push(...sectionHeading('Professional Summary', scheme));
    blocks.push(new Paragraph({ spacing: { before: 40, after: 80 }, children: [new TextRun({ text: summary, font: 'Arial', size: 20 })] }));
  }

  // Experience
  if (experience.length) {
    blocks.push(...sectionHeading('Experience', scheme));
    for (const exp of experience) {
      blocks.push(new Paragraph({
        spacing: { before: 120, after: 20 },
        children: [
          new TextRun({ text: exp.title, bold: true, font: 'Arial', size: 22 }),
          new TextRun({ text: `  —  ${exp.company}`, font: 'Arial', size: 22, color: scheme.secondary }),
        ],
      }));
      blocks.push(new Paragraph({
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({ text: `${exp.startDate} – ${exp.endDate}`, font: 'Arial', size: 18, color: '888780', italics: true }),
          ...(exp.location ? [new TextRun({ text: `  ·  ${exp.location}`, font: 'Arial', size: 18, color: '888780' })] : []),
        ],
      }));
      for (const bullet of exp.bullets.filter(Boolean)) {
        blocks.push(bulletParagraph(bullet));
      }
    }
  }

  // Education
  if (education.length) {
    blocks.push(...sectionHeading('Education', scheme));
    for (const edu of education) {
      blocks.push(new Paragraph({
        spacing: { before: 100, after: 20 },
        children: [
          new TextRun({ text: edu.degree, bold: true, font: 'Arial', size: 22 }),
          new TextRun({ text: `  —  ${edu.institution}`, font: 'Arial', size: 22, color: scheme.secondary }),
        ],
      }));
      blocks.push(new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({ text: edu.year, font: 'Arial', size: 18, color: '888780', italics: true }),
          ...(edu.gpa ? [new TextRun({ text: `  ·  GPA: ${edu.gpa}`, font: 'Arial', size: 18, color: '888780' })] : []),
        ],
      }));
    }
  }

  // Certifications
  if (certifications.length) {
    blocks.push(...sectionHeading('Certifications', scheme));
    for (const cert of certifications.filter(Boolean)) {
      blocks.push(bulletParagraph(cert));
    }
  }

  // Skills
  if (skills.length) {
    blocks.push(...sectionHeading('Skills', scheme));
    blocks.push(new Paragraph({
      spacing: { before: 40, after: 80 },
      children: [new TextRun({ text: skills.join('  ·  '), font: 'Arial', size: 20, color: '444441' })],
    }));
  }

  return blocks;
}

function buildExecutive(cv: CVData, scheme: ColorScheme): Paragraph[] {
  const { personal: p, summary, experience, education, certifications, skills } = cv;
  const blocks: Paragraph[] = [];

  // Thick top rule
  blocks.push(new Paragraph({
    border: { top: { style: BorderStyle.SINGLE, size: 30, color: scheme.primary, space: 1 } },
    spacing: { before: 0, after: 80 },
    children: [],
  }));

  blocks.push(new Paragraph({
    spacing: { before: 0, after: 60 },
    children: [new TextRun({ text: `${p.firstName} ${p.lastName}`.toUpperCase(), bold: true, size: 56, font: 'Arial', color: scheme.primary, allCaps: true })],
  }));
  blocks.push(new Paragraph({
    spacing: { before: 0, after: 40 },
    children: [new TextRun({ text: p.jobTitle, size: 28, font: 'Arial', color: scheme.secondary })],
  }));

  const contactParts = [p.email, p.phone, p.location, p.linkedin].filter(Boolean);
  blocks.push(new Paragraph({
    spacing: { before: 0, after: 40 },
    children: contactParts.flatMap((val, i) => [
      new TextRun({ text: val, size: 18, font: 'Arial', color: '888780' }),
      ...(i < contactParts.length - 1 ? [new TextRun({ text: '   |   ', size: 18, font: 'Arial', color: 'CCCCCC' })] : []),
    ]),
  }));

  blocks.push(new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 30, color: scheme.primary, space: 1 } },
    spacing: { before: 80, after: 160 },
    children: [],
  }));

  if (summary) {
    blocks.push(new Paragraph({
      spacing: { before: 0, after: 160 },
      children: [new TextRun({ text: summary, font: 'Arial', size: 20, color: '444441', italics: true })],
    }));
  }

  const execHeading = (text: string) => [
    new Paragraph({
      spacing: { before: 240, after: 60 },
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, font: 'Arial', color: scheme.primary, allCaps: true, characterSpacing: 60 })],
    }),
    rule(scheme.accent, 4),
  ];

  if (experience.length) {
    blocks.push(...execHeading('Experience'));
    for (const exp of experience) {
      blocks.push(new Paragraph({
        spacing: { before: 140, after: 20 },
        children: [
          new TextRun({ text: exp.title, bold: true, font: 'Arial', size: 22 }),
          new TextRun({ text: `  |  ${exp.company}`, font: 'Arial', size: 22, color: scheme.secondary }),
          new TextRun({ text: `  ·  ${exp.startDate} – ${exp.endDate}`, font: 'Arial', size: 18, color: '888780', italics: true }),
        ],
      }));
      for (const bullet of exp.bullets.filter(Boolean)) blocks.push(bulletParagraph(bullet));
    }
  }

  if (education.length) {
    blocks.push(...execHeading('Education'));
    for (const edu of education) {
      blocks.push(new Paragraph({
        spacing: { before: 100, after: 20 },
        children: [
          new TextRun({ text: edu.degree, bold: true, font: 'Arial', size: 22 }),
          new TextRun({ text: `  —  ${edu.institution}  ·  ${edu.year}`, font: 'Arial', size: 20, color: '888780' }),
        ],
      }));
    }
  }

  if (certifications.length) {
    blocks.push(...execHeading('Certifications'));
    for (const cert of certifications.filter(Boolean)) blocks.push(bulletParagraph(cert));
  }

  if (skills.length) {
    blocks.push(...execHeading('Core Skills'));
    blocks.push(new Paragraph({
      spacing: { before: 40, after: 80 },
      children: [new TextRun({ text: skills.join('   ·   '), font: 'Arial', size: 20 })],
    }));
  }

  return blocks;
}

function buildMinimal(cv: CVData, scheme: ColorScheme): Paragraph[] {
  const { personal: p, summary, experience, education, certifications, skills } = cv;
  const blocks: Paragraph[] = [];

  blocks.push(new Paragraph({
    spacing: { before: 0, after: 40 },
    children: [new TextRun({ text: `${p.firstName} ${p.lastName}`, bold: true, size: 64, font: 'Arial', color: '2C2C2A' })],
  }));
  blocks.push(new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [new TextRun({ text: p.jobTitle, size: 24, font: 'Arial', color: scheme.primary })],
  }));

  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean);
  blocks.push(new Paragraph({
    spacing: { before: 0, after: 20 },
    children: contactParts.flatMap((val, i) => [
      new TextRun({ text: val, size: 17, font: 'Arial', color: '888780' }),
      ...(i < contactParts.length - 1 ? [new TextRun({ text: '  ·  ', size: 17, font: 'Arial', color: 'CCCCCC' })] : []),
    ]),
  }));
  blocks.push(rule(scheme.primary, 4));

  const minHeading = (text: string) => new Paragraph({
    spacing: { before: 280, after: 80 },
    children: [new TextRun({ text: text.toUpperCase(), size: 18, font: 'Arial', bold: true, color: scheme.primary, allCaps: true, characterSpacing: 80 })],
  });

  if (summary) {
    blocks.push(minHeading('Summary'));
    blocks.push(new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: summary, font: 'Arial', size: 20, color: '444441' })] }));
  }

  if (experience.length) {
    blocks.push(minHeading('Experience'));
    for (const exp of experience) {
      blocks.push(new Paragraph({
        spacing: { before: 120, after: 20 },
        children: [new TextRun({ text: exp.title, bold: true, font: 'Arial', size: 22 })],
      }));
      blocks.push(new Paragraph({
        spacing: { before: 0, after: 30 },
        children: [
          new TextRun({ text: exp.company, font: 'Arial', size: 20, color: scheme.secondary }),
          new TextRun({ text: `  ·  ${exp.startDate} – ${exp.endDate}`, font: 'Arial', size: 18, color: 'AAAAAA' }),
        ],
      }));
      for (const bullet of exp.bullets.filter(Boolean)) blocks.push(bulletParagraph(bullet));
    }
  }

  if (education.length) {
    blocks.push(minHeading('Education'));
    for (const edu of education) {
      blocks.push(new Paragraph({
        spacing: { before: 80, after: 20 },
        children: [new TextRun({ text: edu.degree, bold: true, font: 'Arial', size: 22 })],
      }));
      blocks.push(new Paragraph({
        spacing: { before: 0, after: 40 },
        children: [new TextRun({ text: `${edu.institution}  ·  ${edu.year}`, font: 'Arial', size: 20, color: '888780' })],
      }));
    }
  }

  if (certifications.length) {
    blocks.push(minHeading('Certifications'));
    for (const cert of certifications.filter(Boolean)) blocks.push(bulletParagraph(cert));
  }

  if (skills.length) {
    blocks.push(minHeading('Skills'));
    blocks.push(new Paragraph({
      spacing: { before: 40, after: 80 },
      children: [new TextRun({ text: skills.join('  ·  '), font: 'Arial', size: 20, color: '444441' })],
    }));
  }

  return blocks;
}

// ── main export ─────────────────────────────────────────────────────────────

// ── Timeline DOCX ────────────────────────────────────────────────────────────
// Note: True two-column with sidebar isn't possible in pure docx-js without
// section columns, so sidebar-dark falls back to classic with dark accent styling.
// Timeline uses left-border accent to simulate the vertical line.

function buildTimeline(cv: CVData, scheme: ColorScheme): Paragraph[] {
  const { personal: p, summary, experience, education, certifications, skills } = cv;
  const blocks: Paragraph[] = [];

  // Header — left-aligned minimal
  blocks.push(new Paragraph({
    spacing: { before: 0, after: 60 },
    children: [new TextRun({ text: `${p.firstName} ${p.lastName}`, bold: true, size: 48, font: 'Arial', color: '2C2C2A' })],
  }));
  blocks.push(new Paragraph({
    spacing: { before: 0, after: 40 },
    children: [new TextRun({ text: p.jobTitle, size: 24, font: 'Arial', color: scheme.primary })],
  }));
  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.website, p.github].filter(Boolean);
  blocks.push(new Paragraph({
    spacing: { before: 0, after: 20 },
    children: contactParts.flatMap((val, i) => [
      new TextRun({ text: val, size: 17, font: 'Arial', color: '888780' }),
      ...(i < contactParts.length - 1 ? [new TextRun({ text: '  ·  ', size: 17, font: 'Arial', color: 'CCCCCC' })] : []),
    ]),
  }));
  blocks.push(rule(scheme.primary, 8));

  if (summary) {
    blocks.push(...sectionHeading('Summary', scheme));
    blocks.push(new Paragraph({ spacing: { before: 40, after: 80 }, children: [new TextRun({ text: summary, font: 'Arial', size: 20 })] }));
  }

  if (experience.length) {
    blocks.push(...sectionHeading('Experience', scheme));
    for (const exp of experience) {
      // Timeline dot effect: left border on job title paragraph
      blocks.push(new Paragraph({
        spacing: { before: 140, after: 20 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: scheme.primary, space: 8 } },
        indent: { left: 240 },
        children: [
          new TextRun({ text: exp.title, bold: true, font: 'Arial', size: 22 }),
          new TextRun({ text: `  —  ${exp.company}`, font: 'Arial', size: 22, color: scheme.secondary }),
        ],
      }));
      blocks.push(new Paragraph({
        spacing: { before: 0, after: 40 },
        indent: { left: 240 },
        children: [
          new TextRun({ text: `${exp.startDate} – ${exp.endDate}`, font: 'Arial', size: 18, color: '888780', italics: true }),
          ...(exp.location ? [new TextRun({ text: `  ·  ${exp.location}`, font: 'Arial', size: 18, color: '888780' })] : []),
        ],
      }));
      for (const bullet of exp.bullets.filter(Boolean)) {
        blocks.push(new Paragraph({
          numbering: { reference: 'cv-bullets', level: 0 },
          spacing: { before: 40, after: 40 },
          indent: { left: 480 + 240, hanging: 240 },
          children: [new TextRun({ text: bullet, font: 'Arial', size: 20 })],
        }));
      }
    }
  }

  if (education.length) {
    blocks.push(...sectionHeading('Education', scheme));
    for (const edu of education) {
      blocks.push(new Paragraph({
        spacing: { before: 100, after: 20 },
        children: [
          new TextRun({ text: edu.degree, bold: true, font: 'Arial', size: 22 }),
          new TextRun({ text: `  —  ${edu.institution}`, font: 'Arial', size: 22, color: scheme.secondary }),
        ],
      }));
      blocks.push(new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: `${edu.year}${edu.gpa ? `  ·  GPA: ${edu.gpa}` : ''}`, font: 'Arial', size: 18, color: '888780', italics: true })],
      }));
    }
  }

  if (certifications.length) {
    blocks.push(...sectionHeading('Certifications', scheme));
    for (const cert of certifications.filter(Boolean)) blocks.push(bulletParagraph(cert));
  }

  if (skills.length) {
    blocks.push(...sectionHeading('Skills', scheme));
    blocks.push(new Paragraph({
      spacing: { before: 40, after: 80 },
      children: [new TextRun({ text: skills.join('  ·  '), font: 'Arial', size: 20, color: '444441' })],
    }));
  }

  return blocks;
}

export async function buildDocx(cv: CVData): Promise<Buffer> {
  const scheme = getScheme(cv.colorScheme);

  let children: Paragraph[];
  switch (cv.template) {
    case 'executive':
    case 'bold':
      children = buildExecutive(cv, scheme);
      break;
    case 'minimal':
    case 'compact':
      children = buildMinimal(cv, scheme);
      break;
    case 'timeline':
      children = buildTimeline(cv, scheme);
      break;
    case 'modern':
    case 'sidebar-dark':
      // Two-column sidebar not natively supported in docx-js; use classic with accent
      children = buildClassic(cv, scheme);
      break;
    default:
      children = buildClassic(cv, scheme);
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'cv-bullets',
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '\u2022',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 480, hanging: 240 }, spacing: { before: 40, after: 40 } } },
          }],
        },
      ],
    },
    styles: {
      default: {
        document: { run: { font: 'Arial', size: 20, color: '2C2C2A' } },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
        },
      },
      children,
    }],
  });

  return Packer.toBuffer(doc);
}
