# CV Builder — TSA Friendly

ATS-optimized CV builder with step-by-step wizard, 8 templates, 10 color schemes, and export to PDF + DOCX.

## Stack

- **Next.js 14** (App Router) — frontend + API routes
- **`docx`** — generates `.docx` files server-side
- **`@react-pdf/renderer`** — generates PDF files server-side
- **Claude API** — optional AI improvement suggestions
- **Vercel** — deploy in one command

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Add env variables (only needed for AI feature)
cp .env.local.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# 3. Run locally
npm run dev
# → http://localhost:3000

# 4. Deploy to Vercel
npx vercel
# or connect repo in vercel.com dashboard
```

## Features

### Templates (8)
| Template | ATS Score | Layout |
|----------|-----------|--------|
| Classic | 100% | Single-column |
| Minimal | 100% | Single-column, generous whitespace |
| Compact | 95% | Single-column, dense |
| Executive | 95% | Single-column, bold header |
| Bold | 90% | Single-column, dark hero header |
| Modern | 85% | Two-column sidebar |
| Timeline | 88% | Single-column with visual timeline |
| Sidebar Dark | 80% | Two-column dark sidebar |

### Color Schemes (10)
Ocean, Forest, Slate, Crimson, Violet, Amber, Rose, Teal, Midnight, Sage

### Wizard Steps
1. Template selection with live miniature previews
2. Color scheme picker
3. Personal info (name, title, email, phone, LinkedIn, GitHub, portfolio)
4. Professional summary + AI improvement button
5. Work experience (repeatable blocks with bullet points)
6. Education + certifications
7. Skills with quick-add for QA/SDET roles
8. Export (PDF / DOCX) + ATS checklist

### Export
- `POST /api/generate-pdf` — returns PDF binary
- `POST /api/generate-docx` — returns DOCX binary
- `POST /api/improve-cv` — returns Claude AI suggestions

## Adding Templates

Edit `lib/buildDocx.ts` (DOCX) and `lib/buildPdf.tsx` (PDF).
Add the template ID to `lib/cvTypes.ts` → `TemplateId` and `TEMPLATE_META`.
Add SVG preview in `components/CVWizard.tsx` → `TemplateMini`.

## TSA / ATS Rules Enforced

- No images or graphics embedded in document
- Standard section headings (Experience, Education, Skills)
- No tables used for layout in single-column templates
- Proper bullet formatting (no unicode hacks)
- US Letter page size (8.5" × 11")
- Arial font (universally supported by ATS)
- Correct margins (0.75")
