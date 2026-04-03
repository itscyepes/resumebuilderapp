// app/page.tsx
import CVWizard from '@/components/CVWizard';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', padding: '1.5rem 1.5rem 3rem' }}>
      <CVWizard />
    </main>
  );
}
