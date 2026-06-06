// components/MenuSidebar.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
	<line x1="3" y1="7" x2="21" y2="7" />
	<line x1="3" y1="12" x2="21" y2="12" />
	<line x1="3" y1="17" x2="21" y2="17" />
  </svg>
);

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
	<path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const IconFeather = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
	<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
	<line x1="16" y1="8" x2="2" y2="22" />
	<line x1="17.5" y1="15" x2="9" y2="15" />
  </svg>
);

const IconPin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
	<line x1="12" y1="17" x2="12" y2="22" />
	<path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
  </svg>
);

const IconLayers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
	<polygon points="12 2 2 7 12 12 22 7 12 2" />
	<polyline points="2 17 12 22 22 17" />
	<polyline points="2 12 12 17 22 12" />
  </svg>
);

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
	<line x1="12" y1="5" x2="12" y2="19" />
	<line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconSettings = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
	<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
	<circle cx="12" cy="12" r="3" />
  </svg>
);

const IconLogOut = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
	<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
	<polyline points="16 17 21 12 16 7" />
	<line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
	<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
	<circle cx="12" cy="7" r="4" />
  </svg>
);

const IconChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
	<polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function MenuSidebar({ currentUser }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const close = () => setOpen(false);

  async function handleLogout() {
	await fetch('/api/auth/logout', { method: 'POST' });
	router.refresh();
	close();
  }

  const isActive = (href) => pathname === href;

  return (
	<>
	  <button className="hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
		<IconMenu />
	  </button>

	  {open && <div className="menu-backdrop" onClick={close} />}

	  <nav className={`menu-sidebar${open ? ' open' : ''}`} aria-label="Navigation">

		<div className="menu-header">
		  <div className="menu-brand">
			<span style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center' }}>
			  <IconFeather />
			</span>
			<span className="menu-brand-name">Diary Dump</span>
		  </div>
		  <button className="menu-close-btn" onClick={close} aria-label="Close">
			<IconClose />
		  </button>
		</div>

		{currentUser && (
		  <div className="menu-user-pill">
			<span style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center' }}>
			  <IconUser />
			</span>
			<span>@{currentUser}</span>
		  </div>
		)}

		<ul className="menu-list">

		  <li>
			<Link href="/" className={`menu-link${isActive('/') ? ' menu-link-active' : ''}`} onClick={close}>
			  <span className="menu-link-icon">
				<IconPin />
			  </span>
			  <span className="menu-link-text">
				Public Wall
				<small>Everyone's notes</small>
			  </span>
			  {isActive('/') && <IconChevronRight />}
			</Link>
		  </li>

		  {currentUser ? (
			<li>
			  <Link
				href={`/space/${currentUser}`}
				className={`menu-link${isActive(`/space/${currentUser}`) ? ' menu-link-active' : ''}`}
				onClick={close}
			  >
				<span className="menu-link-icon">
				  <IconLayers />
				</span>
				<span className="menu-link-text">
				  My Space
				  <small>Your personal wall</small>
				</span>
				{isActive(`/space/${currentUser}`) && <IconChevronRight />}
			  </Link>
			</li>
		  ) : (
			<li>
			  <Link href="/create" className="menu-link menu-link-cta" onClick={close}>
				<span className="menu-link-icon">
				  <IconPlus />
				</span>
				<span className="menu-link-text">
				  Create Your Space
				  <small>Free · Takes 10 seconds</small>
				</span>
			  </Link>
			</li>
		  )}

		</ul>

		<div className="menu-bottom">
		  <div className="menu-bottom-links">
			<Link
			  href="/settings"
			  className={`menu-bottom-link${isActive('/settings') ? ' menu-link-active' : ''}`}
			  onClick={close}
			>
			  <IconSettings />
			  Settings
			</Link>

			{currentUser && (
			  <button className="menu-bottom-link menu-bottom-logout" onClick={handleLogout}>
				<IconLogOut />
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
