// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CV Builder — TSA Friendly',
  description: 'Create ATS-optimized resumes with multiple templates. Export to PDF or DOCX.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif', background: '#fafaf8' }}>
        {children}
      </body>
    </html>
  );
}
