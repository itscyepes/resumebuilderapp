// app/api/import-linkedin/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 20;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    // Convert file to base64 for Claude's document API
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const prompt = `You are a resume parser. Extract structured data from this LinkedIn PDF or resume PDF.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "personal": {
    "firstName": "",
    "lastName": "",
    "jobTitle": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": "",
    "github": ""
  },
  "summary": "",
  "experience": [
    {
      "id": "exp1",
      "company": "",
      "title": "",
      "startDate": "",
      "endDate": "",
      "location": "",
      "bullets": ["", "", ""]
    }
  ],
  "education": [
    {
      "id": "edu1",
      "institution": "",
      "degree": "",
      "year": "",
      "gpa": ""
    }
  ],
  "certifications": [],
  "skills": []
}

Rules:
- Extract ALL experience entries, most recent first
- Convert experience descriptions into 2-4 concise bullet points with action verbs
- Extract all skills as a flat array of strings
- For dates use format like "Jan 2022" or "2022"
- If a field is not found, use empty string ""
- IDs must be unique strings like "exp1", "exp2", "edu1"
- Return ONLY the JSON, nothing else`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Claude API error:', err);
      return NextResponse.json({ error: 'AI parsing failed. Check ANTHROPIC_API_KEY.' }, { status: 500 });
    }

    const data = await res.json();
    const raw = data.content?.[0]?.text ?? '{}';

    // Strip any accidental markdown fences
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({ cv: parsed });
  } catch (err) {
    console.error('Import error:', err);
    return NextResponse.json({ error: 'Failed to parse PDF. Make sure it is a valid LinkedIn or resume PDF.' }, { status: 500 });
  }
}
