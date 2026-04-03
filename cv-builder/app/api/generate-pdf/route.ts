// app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { buildPdf } from '@/lib/buildPdf';
import { CVData } from '@/lib/cvTypes';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  try {
    const cv: CVData = await req.json();
    const buffer = await buildPdf(cv);
    const name = `${cv.personal.firstName || 'CV'}_${cv.personal.lastName || ''}_Resume.pdf`
      .replace(/\s+/g, '_');

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${name}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('PDF error:', err);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
