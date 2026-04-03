// app/api/improve-cv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CVData } from '@/lib/cvTypes';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function POST(req: NextRequest) {
  const { cv, section }: { cv: CVData; section: string } = await req.json();

  const prompts: Record<string, string> = {
    summary: `You are an expert resume writer. Rewrite this professional summary to be more impactful, ATS-friendly, and achievement-focused. Lead with years of experience and biggest impact. Keep it 3-5 sentences. Return only the improved summary, no explanation.\n\nOriginal: ${cv.summary}`,
    bullets: `You are an expert resume writer. Improve these job experience bullet points to be more impactful using strong action verbs and quantifiable results. Return only the improved bullets, one per line, starting with a dash.\n\nBullets:\n${cv.experience.flatMap(e => e.bullets).join('\n')}`,
    skills: `You are a technical recruiter. Given this job title "${cv.personal.jobTitle}" and existing skills, suggest 8-10 additional relevant skills that would improve ATS matching. Return only a comma-separated list of skills, nothing else.\n\nExisting: ${cv.skills.join(', ')}`,
  };

  const prompt = prompts[section] ?? prompts.summary;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text ?? '';
    return NextResponse.json({ result: text });
  } catch (err) {
    console.error('Claude API error:', err);
    return NextResponse.json({ error: 'AI improvement failed' }, { status: 500 });
  }
}
