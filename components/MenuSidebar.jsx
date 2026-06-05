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
          <span className="menu-title">MENU</span>
          <button className="menu-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>

        <div className="menu-section-label">
          <Link href="/create" className="menu-create-btn" onClick={() => setOpen(false)}>
            + CREATE YOUR SPACE
          </Link>
        </div>

        <ul className="menu-list">
          {/* PINNED = public wall */}
          <li className="menu-item pinned">
            <Link href="/" onClick={() => setOpen(false)}>
              <span className="menu-dot" />
              PINNED
            </Link>
          </li>

          {/* Logged-in user's own space first */}
          {currentUser && (
            <li className="menu-item own">
              <Link href={`/space/${currentUser}`} onClick={() => setOpen(false)}>
                <span className="menu-dot" />
                {currentUser}'s Space
              </Link>
            </li>
          )}

          {/* All other spaces */}
          {spaces
            .filter((s) => s !== currentUser)
            .map((username) => (
              <li key={username} className="menu-item">
                <Link href={`/space/${username}`} onClick={() => setOpen(false)}>
                  <span className="menu-dot" />
                  {username}'s Space
                </Link>
              </li>
            ))}
        </ul>

        {spaces.length === 0 && (
          <p className="menu-empty">
            {'{ Space page created\npinned at top }'}
          </p>
        )}

        {/* Settings pinned at bottom */}
        <div className="menu-bottom">
          {currentUser ? (
            <>
              <Link
                href="/settings"
                className="menu-settings-btn"
                onClick={() => setOpen(false)}
              >
                SETTINGS
              </Link>
              <button className="menu-logout-btn" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/create"
              className="menu-settings-btn"
              onClick={() => setOpen(false)}
            >
              LOG IN / SIGN UP
            </Link>
          )}
        </div>
      </nav>
    </>
  );
                    }
