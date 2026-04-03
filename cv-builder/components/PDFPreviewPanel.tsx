'use client';
// components/PDFPreviewPanel.tsx
// Renders a real PDF using @react-pdf/renderer on the client side
// and displays it inside an iframe via a blob URL.

import { useEffect, useRef, useState, useCallback } from 'react';
import { CVData } from '@/lib/cvTypes';

// We lazy-load the PDF renderer to avoid SSR issues
type PdfRenderer = typeof import('@react-pdf/renderer');

let rendererPromise: Promise<PdfRenderer> | null = null;
function getRenderer(): Promise<PdfRenderer> {
  if (!rendererPromise) {
    rendererPromise = import('@react-pdf/renderer');
  }
  return rendererPromise;
}

// We also lazy-load the PDF builder (it imports React JSX)
type BuildPdfFn = (cv: CVData) => Promise<Buffer>;
let builderPromise: Promise<BuildPdfFn> | null = null;
function getBuilder(): Promise<BuildPdfFn> {
  if (!builderPromise) {
    builderPromise = import('@/lib/buildPdf').then(m => m.buildPdf);
  }
  return builderPromise;
}

type Props = {
  cv: CVData;
  visible: boolean;
};

export default function PDFPreviewPanel({ cv, visible }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'rendering' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  const render = useCallback(async (data: CVData) => {
    setStatus('rendering');
    setError('');
    try {
      const buildPdf = await getBuilder();
      const buffer = await buildPdf(data);

      // Revoke old blob URL to avoid memory leaks
      if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current);

      const blob = new Blob([buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      currentUrlRef.current = url;
      setBlobUrl(url);
      setStatus('done');
    } catch (e: any) {
      console.error('PDF render error:', e);
      setError(e?.message ?? 'Render failed');
      setStatus('error');
    }
  }, []);

  // Debounce re-renders on CV changes
  useEffect(() => {
    if (!visible) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => render(cv), 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [cv, visible, render]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => { if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current); };
  }, []);

  if (!visible) return null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 400, background: '#e0e0de' }}>
      {status === 'rendering' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 2,
          background: 'rgba(240,240,238,0.85)',
        }}>
          <div style={{ fontSize: 20 }}>⟳</div>
          <span style={{ fontSize: 12, color: '#888' }}>Rendering PDF…</span>
        </div>
      )}

      {status === 'error' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 6, padding: 16,
        }}>
          <span style={{ fontSize: 13, color: '#A32D2D', textAlign: 'center' }}>
            Preview unavailable in this environment.<br />
            <span style={{ fontSize: 11, color: '#888' }}>The PDF will still download correctly.</span>
          </span>
        </div>
      )}

      {blobUrl && status === 'done' && (
        <iframe
          src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          style={{ width: '100%', height: '100%', border: 'none', minHeight: 400 }}
          title="CV Preview"
        />
      )}

      {status === 'idle' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 200, fontSize: 12, color: '#888',
        }}>
          Loading preview…
        </div>
      )}
    </div>
  );
}
