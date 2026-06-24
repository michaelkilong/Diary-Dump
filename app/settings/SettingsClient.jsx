'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsClient({ username }) {
  const [deleting,    setDeleting]    = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);
  const [password,    setPassword]    = useState('');
  const [error,       setError]       = useState('');
  const router = useRouter();

  async function handleDelete() {
    if (!password) { setError('Enter your password to confirm'); return; }
    setDeleting(true);
    setError('');
    try {
      const res  = await fetch('/api/auth/delete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/');
      router.refresh();
    } catch {
      setError('Network error. Try again.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="cs-page">
      <Link href={`/space/${username}`} className="cs-back">← Back to my Space</Link>

      <div className="cs-card" style={{ maxWidth: 400 }}>
        <h2 className="cs-title">Settings</h2>
        <p className="cs-hint" style={{ marginBottom: 24 }}>Logged in as <strong>{username}</strong></p>

        <ul className="settings-list">
          <li>
            <label className="settings-row">
              <span>Enable Notifications</span>
              <input type="checkbox" disabled title="Coming soon" />
            </label>
          </li>
          <li>
            <a className="settings-row link" href="mailto:support@diarydump.app">
              FAQ / Help
            </a>
          </li>
          <li>
            <a className="settings-row link" href="mailto:support@diarydump.app">
              Complaint
            </a>
          </li>
          <li>
            <span className="settings-row muted">About — Diary Dump v1.0</span>
          </li>
        </ul>

        <div className="settings-danger">
          {!confirmDel ? (
            <button className="settings-delete-btn" onClick={() => setConfirmDel(true)}>
              Delete Space
            </button>
          ) : (
            <div className="settings-confirm">
              <p>This permanently deletes your space and all notes. Enter your password:</p>
              <input
                className="cs-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
              {error && <p className="cs-error">{error}</p>}
              <div style={{ display:'flex', gap: 8, marginTop: 10 }}>
                <button
                  className="settings-cancel-btn"
                  onClick={() => { setConfirmDel(false); setError(''); }}
                >
                  Cancel
                </button>
                <button className="settings-delete-btn" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
