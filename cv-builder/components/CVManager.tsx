'use client';
// components/CVManager.tsx
import { useState } from 'react';
import { SavedCV } from '@/lib/useCVStore';

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

type Props = {
  cvs: SavedCV[];
  activeId: string;
  onSwitch: (id: string) => void;
  onCreate: () => void;
  onDuplicate: () => void;
  onDelete: (id: string) => void;
  onRename: (name: string) => void;
  activeName: string;
};

export default function CVManager({
  cvs, activeId, onSwitch, onCreate, onDuplicate, onDelete, onRename, activeName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(activeName);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleRename = () => {
    if (nameVal.trim()) onRename(nameVal.trim());
    setEditingName(false);
  };

  return (
    <>
      <style>{`
        .mgr-trigger { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .mgr-name { font-size: 15px; font-weight: 500; color: var(--color-text-primary); }
        .mgr-name-input { font-size: 15px; font-weight: 500; border: none; border-bottom: 1.5px solid #185FA5; background: transparent; color: var(--color-text-primary); outline: none; padding: 0; font-family: var(--font-sans); width: 200px; }
        .mgr-edit-btn { font-size: 11px; color: var(--color-text-secondary); background: none; border: none; cursor: pointer; padding: 2px 6px; }
        .mgr-chevron { font-size: 11px; color: var(--color-text-secondary); cursor: pointer; background: none; border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); padding: 4px 8px; display: flex; align-items: center; gap: 4px; font-family: var(--font-sans); }
        .mgr-chevron:hover { background: var(--color-background-secondary); }

        /* drawer */
        .mgr-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 100; }
        .mgr-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: 320px; background: var(--color-background-primary); z-index: 101; display: flex; flex-direction: column; box-shadow: 4px 0 24px rgba(0,0,0,0.15); }
        .mgr-drawer-header { padding: 1rem 1.25rem; border-bottom: 0.5px solid var(--color-border-tertiary); display: flex; align-items: center; justify-content: space-between; }
        .mgr-drawer-title { font-size: 15px; font-weight: 500; color: var(--color-text-primary); }
        .mgr-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--color-text-secondary); padding: 4px 8px; border-radius: var(--border-radius-md); }
        .mgr-close:hover { background: var(--color-background-secondary); }

        .mgr-actions { padding: .75rem 1.25rem; display: flex; gap: 8px; border-bottom: 0.5px solid var(--color-border-tertiary); }
        .mgr-action-btn { flex: 1; font-size: 12px; padding: 7px 10px; border: 0.5px solid var(--color-border-secondary); border-radius: var(--border-radius-md); background: none; cursor: pointer; color: var(--color-text-primary); font-family: var(--font-sans); }
        .mgr-action-btn:hover { background: var(--color-background-secondary); }
        .mgr-action-btn.primary { background: #185FA5; color: white; border-color: #185FA5; }
        .mgr-action-btn.primary:hover { background: #0C447C; }

        .mgr-list { flex: 1; overflow-y: auto; padding: .5rem; }
        .mgr-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--border-radius-md); cursor: pointer; margin-bottom: 2px; border: 0.5px solid transparent; transition: background .1s; }
        .mgr-item:hover { background: var(--color-background-secondary); }
        .mgr-item.active { background: #E6F1FB; border-color: #185FA5; }
        .mgr-item-icon { width: 32px; height: 40px; background: var(--color-background-secondary); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; border: 0.5px solid var(--color-border-tertiary); }
        .mgr-item.active .mgr-item-icon { background: #dbeafe; border-color: #185FA5; }
        .mgr-item-info { flex: 1; min-width: 0; }
        .mgr-item-name { font-size: 13px; font-weight: 500; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mgr-item.active .mgr-item-name { color: #185FA5; }
        .mgr-item-meta { font-size: 11px; color: var(--color-text-secondary); margin-top: 1px; }
        .mgr-item-del { background: none; border: none; font-size: 14px; cursor: pointer; color: var(--color-text-secondary); padding: 4px 6px; border-radius: 4px; opacity: 0; }
        .mgr-item:hover .mgr-item-del { opacity: 1; }
        .mgr-item-del:hover { background: var(--color-background-danger); color: var(--color-text-danger); }

        /* confirm delete */
        .mgr-confirm { padding: .75rem 1.25rem; background: var(--color-background-danger); border-top: 0.5px solid var(--color-border-danger); display: flex; align-items: center; gap: 8px; font-size: 12px; }
        .mgr-confirm-text { flex: 1; color: var(--color-text-danger); }
        .mgr-confirm-yes { font-size: 12px; padding: 5px 12px; background: var(--color-text-danger); color: white; border: none; border-radius: var(--border-radius-md); cursor: pointer; font-family: var(--font-sans); }
        .mgr-confirm-no { font-size: 12px; padding: 5px 12px; background: none; border: 0.5px solid var(--color-border-secondary); border-radius: var(--border-radius-md); cursor: pointer; color: var(--color-text-primary); font-family: var(--font-sans); }
      `}</style>

      {/* Trigger */}
      <div className="mgr-trigger">
        {editingName ? (
          <input
            className="mgr-name-input"
            value={nameVal}
            autoFocus
            onChange={e => setNameVal(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false); }}
          />
        ) : (
          <>
            <span className="mgr-name">{activeName}</span>
            <button className="mgr-edit-btn" onClick={() => { setNameVal(activeName); setEditingName(true); }} title="Rename">✎</button>
          </>
        )}
        <button className="mgr-chevron" onClick={() => setOpen(true)}>
          All CVs ({cvs.length}) ▾
        </button>
      </div>

      {/* Drawer */}
      {open && (
        <>
          <div className="mgr-overlay" onClick={() => setOpen(false)} />
          <div className="mgr-drawer">
            <div className="mgr-drawer-header">
              <span className="mgr-drawer-title">My CVs</span>
              <button className="mgr-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="mgr-actions">
              <button className="mgr-action-btn primary" onClick={() => { onCreate(); setOpen(false); }}>
                + New CV
              </button>
              <button className="mgr-action-btn" onClick={() => { onDuplicate(); setOpen(false); }}>
                Duplicate active
              </button>
            </div>

            <div className="mgr-list">
              {cvs.map(cv => (
                <div
                  key={cv.id}
                  className={`mgr-item${cv.id === activeId ? ' active' : ''}`}
                  onClick={() => { onSwitch(cv.id); setOpen(false); }}
                >
                  <div className="mgr-item-icon">📄</div>
                  <div className="mgr-item-info">
                    <div className="mgr-item-name">{cv.name}</div>
                    <div className="mgr-item-meta">
                      {cv.data.template} · {cv.data.colorScheme} · {timeAgo(cv.updatedAt)}
                    </div>
                  </div>
                  <button
                    className="mgr-item-del"
                    title="Delete"
                    onClick={e => { e.stopPropagation(); setConfirmDelete(cv.id); }}
                  >✕</button>
                </div>
              ))}
            </div>

            {confirmDelete && (
              <div className="mgr-confirm">
                <span className="mgr-confirm-text">Delete "{cvs.find(c => c.id === confirmDelete)?.name}"?</span>
                <button className="mgr-confirm-no" onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button className="mgr-confirm-yes" onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }}>Delete</button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
