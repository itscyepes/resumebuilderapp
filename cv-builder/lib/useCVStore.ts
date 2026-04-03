'use client';
// lib/useCVStore.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { CVData, EMPTY_CV } from './cvTypes';

export type SavedCV = {
  id: string;
  name: string;
  updatedAt: number; // timestamp
  data: CVData;
};

const STORAGE_KEY = 'cv_builder_store_v1';

function uid() { return Math.random().toString(36).slice(2, 10); }

function defaultCV(name = 'My Resume'): SavedCV {
  return {
    id: uid(),
    name,
    updatedAt: Date.now(),
    data: { ...EMPTY_CV, experience: [], education: [] },
  };
}

function load(): SavedCV[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(cvs: SavedCV[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvs));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
}

export function useCVStore() {
  const [cvs, setCvs] = useState<SavedCV[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── boot: load from localStorage ──
  useEffect(() => {
    const stored = load();
    if (stored.length > 0) {
      setCvs(stored);
      setActiveId(stored[0].id);
    } else {
      const first = defaultCV('My Resume');
      setCvs([first]);
      setActiveId(first.id);
      persist([first]);
    }
    setSaveStatus('saved');
  }, []);

  // ── active CV ──
  const active = cvs.find(c => c.id === activeId) ?? cvs[0];

  // ── update CV data with auto-save debounce ──
  const updateCV = useCallback((data: CVData) => {
    setSaveStatus('unsaved');
    setCvs(prev => {
      const next = prev.map(c =>
        c.id === activeId ? { ...c, data, updatedAt: Date.now() } : c
      );
      // Debounce persist
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        persist(next);
        setSaveStatus('saved');
      }, 800);
      return next;
    });
  }, [activeId]);

  // ── rename active CV ──
  const renameCV = useCallback((name: string) => {
    setCvs(prev => {
      const next = prev.map(c => c.id === activeId ? { ...c, name } : c);
      persist(next);
      return next;
    });
  }, [activeId]);

  // ── create new CV ──
  const createCV = useCallback((name = 'New Resume') => {
    const fresh = defaultCV(name);
    setCvs(prev => {
      const next = [fresh, ...prev];
      persist(next);
      return next;
    });
    setActiveId(fresh.id);
    setSaveStatus('saved');
    return fresh.id;
  }, []);

  // ── duplicate active CV ──
  const duplicateCV = useCallback(() => {
    if (!active) return;
    const copy: SavedCV = {
      id: uid(),
      name: `${active.name} (copy)`,
      updatedAt: Date.now(),
      data: JSON.parse(JSON.stringify(active.data)),
    };
    setCvs(prev => {
      const idx = prev.findIndex(c => c.id === activeId);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      persist(next);
      return next;
    });
    setActiveId(copy.id);
    setSaveStatus('saved');
  }, [active, activeId]);

  // ── delete a CV ──
  const deleteCV = useCallback((id: string) => {
    setCvs(prev => {
      if (prev.length <= 1) {
        // Don't delete the last one — reset it instead
        const reset = defaultCV('My Resume');
        persist([reset]);
        setActiveId(reset.id);
        return [reset];
      }
      const next = prev.filter(c => c.id !== id);
      persist(next);
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  }, [activeId]);

  // ── switch active CV ──
  const switchCV = useCallback((id: string) => {
    setActiveId(id);
    setSaveStatus('saved');
  }, []);

  // ── import: replace active CV data ──
  const importData = useCallback((data: CVData) => {
    setCvs(prev => {
      const next = prev.map(c =>
        c.id === activeId ? { ...c, data, updatedAt: Date.now() } : c
      );
      persist(next);
      return next;
    });
    setSaveStatus('saved');
  }, [activeId]);

  return {
    cvs,
    active,
    activeId,
    saveStatus,
    updateCV,
    renameCV,
    createCV,
    duplicateCV,
    deleteCV,
    switchCV,
    importData,
  };
}
