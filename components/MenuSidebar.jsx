// components/MenuSidebar.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MenuSidebar({ currentUser }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function close() { setOpen(false); }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
    close();
  }

  return (
    <>
      {/* Hamburger — top left */}
      <button className="hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
        <span /><span /><span />
      </button>

      {open && <div className="menu-backdrop" onClick={close} />}

      <nav className={`menu-sidebar${open ? ' open' : ''}`} aria-label="Main navigation">

        {/* Header */}
        <div className="menu-header">
          <span className="menu-logo">✦ Diary Dump</span>
          <button className="menu-x" onClick={close} aria-label="Close menu">✕</button>
        </div>

        {/* Nav list */}
        <ul className="menu-list">

          {/* Public wall — always pinned at top */}
          <li className="menu-item">
            <Link href="/" className="menu-link menu-link-pinned" onClick={close}>
              <span className="menu-link-icon">📌</span>
              <span className="menu-link-label">
                Public Wall
                <span className="menu-link-sub">Everyone's notes</span>
              </span>
            </Link>
          </li>

          {/* Divider */}
          <li className="menu-divider" role="separator" />

          {/* Your space (if logged in) */}
          {currentUser ? (
            <li className="menu-item">
              <Link href={`/space/${currentUser}`} className="menu-link menu-link-space" onClick={close}>
                <span className="menu-link-icon">🪴</span>
                <span className="menu-link-label">
                  My Space
                  <span className="menu-link-sub">@{currentUser}</span>
                </span>
              </Link>
            </li>
          ) : (
            <li className="menu-item">
              <Link href="/create" className="menu-link menu-link-create" onClick={close}>
                <span className="menu-link-icon">✏️</span>
                <span className="menu-link-label">
                  Create Your Space
                  <span className="menu-link-sub">Free · Takes 10 seconds</span>
                </span>
              </Link>
            </li>
          )}

        </ul>

        {/* Bottom actions */}
        <div className="menu-bottom">
          {currentUser ? (
            <>
              <Link href="/settings" className="menu-action-btn" onClick={close}>
                ⚙️ Settings
              </Link>
              <button className="menu-action-btn menu-logout" onClick={handleLogout}>
                ↩ Log Out
              </button>
            </>
          ) : (
            <Link href="/create" className="menu-action-btn menu-action-primary" onClick={close}>
              Log In / Sign Up
            </Link>
          )}
          <p className="menu-footer">Write it down, let it go.</p>
        </div>

      </nav>
    </>
  );
}

