// components/MenuSidebar.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function MenuSidebar({ currentUser }) {
  const [open, setOpen] = useState(false);
  const router   = useRouter();
  const pathname = usePathname();

  function close() { setOpen(false); }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
    close();
  }

  function isActive(href) {
    return pathname === href;
  }

  return (
    <>
      {/* Hamburger */}
      <button className="hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
        <i className="fa-solid fa-bars" />
      </button>

      {open && <div className="menu-backdrop" onClick={close} />}

      <nav className={`menu-sidebar${open ? ' open' : ''}`} aria-label="Navigation">

        {/* Header */}
        <div className="menu-header">
          <div className="menu-brand">
            <i className="fa-solid fa-feather-pointed menu-brand-icon" />
            <span className="menu-brand-name">Diary Dump</span>
          </div>
          <button className="menu-close-btn" onClick={close} aria-label="Close">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* User pill — if logged in */}
        {currentUser && (
          <div className="menu-user-pill">
            <i className="fa-solid fa-circle-user" />
            <span>@{currentUser}</span>
          </div>
        )}

        {/* Nav items */}
        <ul className="menu-list">

          <li>
            <Link href="/" className={`menu-link${isActive('/') ? ' menu-link-active' : ''}`} onClick={close}>
              <i className="fa-solid fa-thumbtack menu-link-icon" />
              <span className="menu-link-text">
                Public Wall
                <small>Everyone's notes</small>
              </span>
              {isActive('/') && <i className="fa-solid fa-chevron-right menu-link-arrow" />}
            </Link>
          </li>

          {currentUser ? (
            <li>
              <Link
                href={`/space/${currentUser}`}
                className={`menu-link${isActive(`/space/${currentUser}`) ? ' menu-link-active' : ''}`}
                onClick={close}
              >
                <i className="fa-solid fa-layer-group menu-link-icon" />
                <span className="menu-link-text">
                  My Space
                  <small>Your personal wall</small>
                </span>
                {isActive(`/space/${currentUser}`) && <i className="fa-solid fa-chevron-right menu-link-arrow" />}
              </Link>
            </li>
          ) : (
            <li>
              <Link href="/create" className="menu-link menu-link-cta" onClick={close}>
                <i className="fa-solid fa-plus menu-link-icon" />
                <span className="menu-link-text">
                  Create Your Space
                  <small>Free · Takes 10 seconds</small>
                </span>
              </Link>
            </li>
          )}

        </ul>

        {/* Bottom section — settings always visible */}
        <div className="menu-bottom">
          <div className="menu-bottom-links">
            <Link
              href="/settings"
              className={`menu-bottom-link${isActive('/settings') ? ' menu-link-active' : ''}`}
              onClick={close}
            >
              <i className="fa-solid fa-gear" />
              Settings
            </Link>

            {currentUser && (
              <button className="menu-bottom-link menu-bottom-logout" onClick={handleLogout}>
                <i className="fa-solid fa-arrow-right-from-bracket" />
                Log Out
              </button>
            )}
          </div>

          <p className="menu-tagline">Write it down, let it go.</p>
        </div>

      </nav>
    </>
  );
}
