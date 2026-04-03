// lib/buildPdf.tsx
import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Font, pdf,
} from '@react-pdf/renderer';
import { CVData, COLOR_SCHEMES, ColorScheme } from './cvTypes';

function getScheme(id: string): ColorScheme {
  return COLOR_SCHEMES.find(c => c.id === id) ?? COLOR_SCHEMES[0];
}

// ── Classic PDF ─────────────────────────────────────────────────────────────

function ClassicPDF({ cv, scheme }: { cv: CVData; scheme: ColorScheme }) {
  const { personal: p } = cv;
  const s = StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 10, color: '#2C2C2A', padding: '0.75in' },
    name: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: `#${scheme.primary}`, marginBottom: 4 },
    title: { fontSize: 13, color: `#${scheme.secondary}`, marginBottom: 6, fontFamily: 'Helvetica-Oblique' },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 2 },
    contactItem: { fontSize: 8.5, color: '#888780' },
    sep: { color: '#CCCCCC', marginHorizontal: 4 },
    rule: { borderBottomWidth: 2, borderBottomColor: `#${scheme.primary}`, marginVertical: 8 },
    thinRule: { borderBottomWidth: 0.5, borderBottomColor: `#${scheme.accent}`, marginBottom: 8, marginTop: 2 },
    sectionHead: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: `#${scheme.primary}`, marginTop: 12, marginBottom: 2 },
    jobTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10.5 },
    jobCompany: { color: `#${scheme.secondary}`, fontSize: 10.5 },
    jobMeta: { fontSize: 8.5, color: '#888780', fontFamily: 'Helvetica-Oblique', marginBottom: 3 },
    bullet: { flexDirection: 'row', marginBottom: 2, paddingLeft: 8 },
    bulletDot: { width: 10, fontSize: 10, color: `#${scheme.primary}` },
    bulletText: { flex: 1, fontSize: 9.5 },
    summary: { fontSize: 9.5, lineHeight: 1.5, marginBottom: 4 },
    skillsText: { fontSize: 9.5, color: '#444441' },
    eduRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  });

  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.website, p.github].filter(Boolean);

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        <Text style={s.name}>{p.firstName} {p.lastName}</Text>
        <Text style={s.title}>{p.jobTitle}</Text>
        <View style={s.contactRow}>
          {contactParts.map((c, i) => (
            <React.Fragment key={i}>
              <Text style={s.contactItem}>{c}</Text>
              {i < contactParts.length - 1 && <Text style={[s.contactItem, s.sep]}>|</Text>}
            </React.Fragment>
          ))}
        </View>
        <View style={s.rule} />

        {cv.summary ? (
          <>
            <Text style={s.sectionHead}>Professional Summary</Text>
            <View style={s.thinRule} />
            <Text style={s.summary}>{cv.summary}</Text>
          </>
        ) : null}

        {cv.experience.length ? (
          <>
            <Text style={s.sectionHead}>Experience</Text>
            <View style={s.thinRule} />
            {cv.experience.map(exp => (
              <View key={exp.id} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <Text style={s.jobTitle}>{exp.title}</Text>
                  <Text style={s.jobCompany}> — {exp.company}</Text>
                </View>
                <Text style={s.jobMeta}>{exp.startDate} – {exp.endDate}{exp.location ? `  ·  ${exp.location}` : ''}</Text>
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <View key={i} style={s.bullet}>
                    <Text style={s.bulletDot}>•</Text>
                    <Text style={s.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : null}

        {cv.education.length ? (
          <>
            <Text style={s.sectionHead}>Education</Text>
            <View style={s.thinRule} />
            {cv.education.map(edu => (
              <View key={edu.id} style={{ marginBottom: 6 }}>
                <View style={s.eduRow}>
                  <Text style={s.jobTitle}>{edu.degree}</Text>
                  <Text style={s.jobMeta}>{edu.year}</Text>
                </View>
                <Text style={{ fontSize: 9.5, color: `#${scheme.secondary}` }}>{edu.institution}{edu.gpa ? `  ·  GPA: ${edu.gpa}` : ''}</Text>
              </View>
            ))}
          </>
        ) : null}

        {cv.certifications.filter(Boolean).length ? (
          <>
            <Text style={s.sectionHead}>Certifications</Text>
            <View style={s.thinRule} />
            {cv.certifications.filter(Boolean).map((c, i) => (
              <View key={i} style={s.bullet}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={s.bulletText}>{c}</Text>
              </View>
            ))}
          </>
        ) : null}

        {cv.skills.length ? (
          <>
            <Text style={s.sectionHead}>Skills</Text>
            <View style={s.thinRule} />
            <Text style={s.skillsText}>{cv.skills.join('  ·  ')}</Text>
          </>
        ) : null}
      </Page>
    </Document>
  );
}

// ── Executive PDF ───────────────────────────────────────────────────────────

function ExecutivePDF({ cv, scheme }: { cv: CVData; scheme: ColorScheme }) {
  const { personal: p } = cv;
  const s = StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 10, color: '#2C2C2A', padding: '0.75in' },
    topBar: { borderTopWidth: 6, borderTopColor: `#${scheme.primary}`, marginBottom: 16 },
    name: { fontSize: 30, fontFamily: 'Helvetica-Bold', color: `#${scheme.primary}`, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
    titleText: { fontSize: 13, color: `#${scheme.secondary}`, marginBottom: 6 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
    contactItem: { fontSize: 8.5, color: '#888780' },
    bottomBar: { borderBottomWidth: 6, borderBottomColor: `#${scheme.primary}`, marginBottom: 16 },
    sectionHead: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: `#${scheme.primary}`, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 14, marginBottom: 3 },
    rule: { borderBottomWidth: 0.5, borderBottomColor: `#${scheme.accent}`, marginBottom: 8 },
    summary: { fontSize: 9.5, lineHeight: 1.6, fontFamily: 'Helvetica-Oblique', color: '#444441', marginBottom: 8 },
    expRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    jobTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10.5 },
    jobCompany: { color: `#${scheme.secondary}`, fontSize: 10 },
    jobMeta: { fontSize: 8.5, color: '#888780', fontFamily: 'Helvetica-Oblique' },
    bullet: { flexDirection: 'row', marginBottom: 2, paddingLeft: 8 },
    bulletDot: { width: 10, fontSize: 10, color: `#${scheme.primary}` },
    bulletText: { flex: 1, fontSize: 9.5 },
  });

  const contactParts = [p.email, p.phone, p.location, p.linkedin].filter(Boolean);

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        <View style={s.topBar} />
        <Text style={s.name}>{p.firstName} {p.lastName}</Text>
        <Text style={s.titleText}>{p.jobTitle}</Text>
        <View style={s.contactRow}>
          {contactParts.map((c, i) => (
            <React.Fragment key={i}>
              <Text style={s.contactItem}>{c}</Text>
              {i < contactParts.length - 1 && <Text style={[s.contactItem, { color: '#CCCCCC' }]}> | </Text>}
            </React.Fragment>
          ))}
        </View>
        <View style={s.bottomBar} />

        {cv.summary ? <Text style={s.summary}>{cv.summary}</Text> : null}

        {cv.experience.length ? (
          <>
            <Text style={s.sectionHead}>Experience</Text>
            <View style={s.rule} />
            {cv.experience.map(exp => (
              <View key={exp.id} style={{ marginBottom: 10 }}>
                <View style={s.expRow}>
                  <Text style={s.jobTitle}>{exp.title}</Text>
                  <Text style={{ color: '#CCCCCC' }}>|</Text>
                  <Text style={s.jobCompany}>{exp.company}</Text>
                  <Text style={{ color: '#CCCCCC' }}>·</Text>
                  <Text style={s.jobMeta}>{exp.startDate} – {exp.endDate}</Text>
                </View>
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <View key={i} style={s.bullet}>
                    <Text style={s.bulletDot}>•</Text>
                    <Text style={s.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : null}

        {cv.education.length ? (
          <>
            <Text style={s.sectionHead}>Education</Text>
            <View style={s.rule} />
            {cv.education.map(edu => (
              <View key={edu.id} style={{ marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Text style={s.jobTitle}>{edu.degree}</Text>
                  <Text style={s.jobCompany}>— {edu.institution}</Text>
                  <Text style={s.jobMeta}>· {edu.year}</Text>
                </View>
              </View>
            ))}
          </>
        ) : null}

        {cv.certifications.filter(Boolean).length ? (
          <>
            <Text style={s.sectionHead}>Certifications</Text>
            <View style={s.rule} />
            {cv.certifications.filter(Boolean).map((c, i) => (
              <View key={i} style={s.bullet}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={s.bulletText}>{c}</Text>
              </View>
            ))}
          </>
        ) : null}

        {cv.skills.length ? (
          <>
            <Text style={s.sectionHead}>Core Skills</Text>
            <View style={s.rule} />
            <Text style={{ fontSize: 9.5, color: '#444441' }}>{cv.skills.join('   ·   ')}</Text>
          </>
        ) : null}
      </Page>
    </Document>
  );
}

// ── main export ─────────────────────────────────────────────────────────────

export async function buildPdf(cv: CVData): Promise<Buffer> {
  const scheme = getScheme(cv.colorScheme);

  let component: React.ReactElement;
  switch (cv.template) {
    case 'executive':
    case 'bold':
    case 'sidebar-dark':
      component = <ExecutivePDF cv={cv} scheme={scheme} />;
      break;
    default:
      component = <ClassicPDF cv={cv} scheme={scheme} />;
  }

  const blob = await pdf(component).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
