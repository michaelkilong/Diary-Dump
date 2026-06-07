'use client';
import { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useCamera } from '../../../hooks/useCamera';
import { useToast }  from '../../../hooks/useToast';
import { COLOR_MAP, COLOR_KEYS, REACTION_KEYS, REACTIONS } from '../../../lib/constants';
import Note          from '../../../components/Note';
import HUD           from '../../../components/HUD';
import WriteModal    from '../../../components/WriteModal';
import DetailModal   from '../../../components/DetailModal';
import MenuSidebar   from '../../../components/MenuSidebar';
import Toast         from '../../../components/Toast';

function formatDate(ts) {
  try { return ts?.toDate().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }); }
  catch { return 'Just now'; }
}

export default function SpaceWall({ spaceOwner, currentUser, isOwner }) {
  const [notes,      setNotes]      = useState(new Map());
  const [loading,    setLoading]    = useState(true);
  const [mode,       setMode]       = useState('navigate');
  const [pendingPos, setPendingPos] = useState({ x: 0, y: 0 });
  const [modalOpen,  setModalOpen]  = useState(false);
  const [detailNote, setDetailNote] = useState(null);
  const [panning,    setPanning]    = useState(false);
  const { camera, initView, zoomAround, getViewportHandlers } = useCamera();
  const { toasts, addToast } = useToast();

  useEffect(() => { initView(); }, [initView]);

  // Load space notes from subcollection
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'spaces', spaceOwner, 'notes'),
      (snap) => {
        setLoading(false);
        setNotes((prev) => {
          const next = new Map(prev);
          snap.docChanges().forEach((c) => {
            if (c.type === 'added' || c.type === 'modified') {
              const d = c.doc.data();
              next.set(c.doc.id, {
                id: c.doc.id,
                x: d.x ?? 2000, y: d.y ?? 2000,
                name: d.name || 'Anonymous',
                message: d.message || '',
                for: d.for || '',
                colorKey: d.colorKey || null,
                style: d.style ?? 0,
                rotation: d.rotation ?? 0,
                reactions: d.reactions || {},
                views: d.views || 0,
                date: formatDate(d.createdAt),
              });
            }
            if (c.type === 'removed') next.delete(c.doc.id);
          });
          return next;
        });
      },
      () => { setLoading(false); addToast('Failed to load notes', 'error'); }
    );
    return unsub;
  }, [spaceOwner]);

  function handleTap(e) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target?.closest('.note')) return;
    if (target?.closest('.hud'))  return;
    if (mode === 'place') {
      setPendingPos({
        x: (e.clientX - camera.tx) / camera.scale,
        y: (e.clientY - camera.ty) / camera.scale,
      });
      setModalOpen(true);
    }
  }

  const rawHandlers = getViewportHandlers({ onTap: handleTap, disabled: modalOpen || !!detailNote });
  const vpHandlers  = {
    ...rawHandlers,
    onPointerDown(e) { setPanning(true);  rawHandlers.onPointerDown?.(e); },
    onPointerUp(e)   { setPanning(false); rawHandlers.onPointerUp?.(e);   },
    onPointerCancel(e) { setPanning(false); rawHandlers.onPointerCancel?.(e); },
  };

  // Write note for space uses the API route (server validates ownership etc.)
  async function handleSpaceSubmit(formData) {
    const res  = await fetch('/api/space/note', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ spaceOwner, ...formData }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
  }

  return (
    <>
      <div
        className={`viewport${mode === 'place' ? ' placing' : panning ? ' panning' : ''}`}
        style={{ touchAction: 'none' }}
        onPointerMove={(e) => {
          if (mode === 'place') {
            const g = document.getElementById('space-ghost');
            if (g) { g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; g.style.display = 'block'; }
          }
        }}
        onPointerLeave={() => {
          const g = document.getElementById('space-ghost');
          if (g) g.style.display = 'none';
        }}
        {...vpHandlers}
      >
        <div className="wall" style={{
          transform: `translate3d(${camera.tx.toFixed(1)}px,${camera.ty.toFixed(1)}px,0) scale(${camera.scale.toFixed(5)})`
        }}>
          {!loading && notes.size === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <h3>{spaceOwner}'s Space</h3>
              <p>No notes yet — be the first to leave one</p>
            </div>
          )}
          {loading && <div className="wall-loading"><div className="wall-spinner" /></div>}
          {[...notes.values()].map((note) => (
            <Note
              key={note.id}
              note={note}
              scale={camera.scale}
              onTap={(n) => { if (mode === 'navigate') setDetailNote(n); }}
            />
          ))}
        </div>
      </div>

      {/* Ghost */}
      <div id="space-ghost" className="note ghost note-cream"
        style={{ position:'fixed', display:'none', pointerEvents:'none', zIndex:99998, transform:'translate(-50%,-50%)', opacity:0.55 }}>
        <div className="note-name">Your Name</div>
        <div className="note-message">Your message…</div>
      </div>

      <HUD
        mode={mode}
        noteCount={notes.size}
        viewCount={null}
        scale={camera.scale}
        spaceTitle={`${spaceOwner}'s Space`}
        onAddClick={() => setMode(mode === 'place' ? 'navigate' : 'place')}
        onZoomIn={() => zoomAround(camera.scale * 1.3, window.innerWidth/2, window.innerHeight/2)}
        onZoomOut={() => zoomAround(camera.scale * 0.7, window.innerWidth/2, window.innerHeight/2)}
        onReset={initView}
      />

      <MenuSidebar currentUser={currentUser} />

      <WriteModal
        open={modalOpen}
        pendingPos={pendingPos}
        spaceOwner={spaceOwner}
        onSubmit={handleSpaceSubmit}
        onClose={() => { setModalOpen(false); setMode('navigate'); }}
        onSuccess={(msg) => addToast(msg, 'success')}
      />
      <DetailModal
        note={detailNote}
        open={!!detailNote}
        spaceOwner={spaceOwner}
        onClose={() => setDetailNote(null)}
      />
      <Toast toasts={toasts} />
    </>
  );
}
