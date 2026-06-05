'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '../lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export default function MenuSidebar({ currentUser }) {
  const [open,   setOpen]   = useState(false);
  const [spaces, setSpaces] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    // Load all spaces once sidebar opens
    getDocs(query(collection(db, 'spaces'), orderBy('createdAt', 'asc')))
      .then((snap) => {
        setSpaces(snap.docs.map((d) => d.id));
      })
      .catch(() => {});
  }, [open]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
    setOpen(false);
  }

  return (
    <>
      {/* Hamburger button — top left, always visible */}
      <button
        className="hamburger"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <span /><span /><span />
      </button>

      {/* Backdrop */}
      {open && (
        <div className="menu-backdrop" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <nav className={`menu-sidebar${open ? ' open' : ''}`}>
        <div className="menu-header">
          <span className="menu-title">Menu</span>
          <button className="menu-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>

        <ul className="menu-list">
          {/* Public Wall */}
          <li className="menu-item">
            <Link href="/" className="menu-item-link public-wall" onClick={() => setOpen(false)}>
              <span className="menu-dot" />
              <span>Public Wall</span>
            </Link>
          </li>

          {/* Logged-in user's own space */}
          {currentUser && (
            <li className="menu-item">
              <Link href={`/space/${currentUser}`} className="menu-item-link own-space" onClick={() => setOpen(false)}>
                <span className="menu-dot" />
                <span>My Space</span>
              </Link>
            </li>
          )}

          {/* Section divider for other spaces */}
          {spaces.length > 0 && spaces.filter(s => s !== currentUser).length > 0 && (
            <li className="menu-divider" />
          )}

          {/* All other spaces */}
          {spaces
            .filter((s) => s !== currentUser)
            .map((username) => (
              <li key={username} className="menu-item">
                <Link href={`/space/${username}`} className="menu-item-link" onClick={() => setOpen(false)}>
                  <span className="menu-dot" />
                  <span>{username}'s Space</span>
                </Link>
              </li>
            ))}
        </ul>

        <div className="menu-create-section">
          <Link href="/create" className="menu-create-btn" onClick={() => setOpen(false)}>
            + New Space
          </Link>
        </div>

        {/* Settings pinned at bottom */}
        <div className="menu-bottom">
          {currentUser ? (
            <>
              <Link
                href="/settings"
                className="menu-settings-btn"
                onClick={() => setOpen(false)}
              >
                Settings
              </Link>
              <button className="menu-logout-btn" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/create"
              className="menu-login-btn"
              onClick={() => setOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
