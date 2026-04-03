// app/api/generate-docx/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { buildDocx } from '@/lib/buildDocx';
import { CVData } from '@/lib/cvTypes';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  try {
    const cv: CVData = await req.json();
    const buffer = await buildDocx(cv);
    const name = `${cv.personal.firstName || 'CV'}_${cv.personal.lastName || ''}_Resume.docx`
      .replace(/\s+/g, '_');

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${name}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('DOCX error:', err);
    return NextResponse.json({ error: 'Failed to generate DOCX' }, { status: 500 });
  }
}
