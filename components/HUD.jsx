'use client';

export default function HUD({ mode, noteCount, viewCount, scale, onAddClick, onZoomIn, onZoomOut, onReset }) {
  return (
    <div className="hud">
      <header className="hud-header">
        <h1>Diary Dump</h1>
        <p>Write it down, let it go. Someone will find it someday</p>
        <div className="stats-bar">
          <span className="stat"><span className="stat-icon">✦</span>{noteCount} notes</span>
          <span className="stat-divider">·</span>
          <span className="stat"><span className="stat-icon">👁</span>{viewCount} seen</span>
        </div>
      </header>

      {mode === 'place' && (
        <div className="place-hint">Tap anywhere on the wall to place your note</div>
      )}

      <nav className="toolbar">
        <button
          className={`tool-btn primary${mode === 'place' ? ' active' : ''}`}
          onClick={onAddClick}
        >
          {mode === 'place' ? '✕ Cancel' : '+ Add Note'}
        </button>
        <div className="divider" />
        <button className="tool-btn icon" onClick={onZoomOut} aria-label="Zoom out">−</button>
        <span className="zoom-text">{Math.round(scale * 100)}%</span>
        <button className="tool-btn icon" onClick={onZoomIn} aria-label="Zoom in">+</button>
        <div className="divider" />
        <button className="tool-btn icon" onClick={onReset} aria-label="Reset view">⌂</button>
      </nav>
    </div>
  );
}
