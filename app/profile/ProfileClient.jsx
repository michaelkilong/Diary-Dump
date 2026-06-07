// app/profile/ProfileClient.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Simple avatar using initials
function Avatar({ name }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="profile-avatar">
      <span>{initials}</span>
    </div>
  );
}

export default function ProfileClient({ username, displayName: initial }) {
  const [displayName,  setDisplayName]  = useState(initial);
  const [editing,      setEditing]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState('');

  const [delConfirm,   setDelConfirm]   = useState(false);
  const [delPassword,  setDelPassword]  = useState('');
  const [deleting,     setDeleting]     = useState(false);
  const [delError,     setDelError]     = useState('');

  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  async function saveDisplayName() {
    if (!displayName.trim()) { setSaveError('Cannot be empty'); return; }
    setSaving(true); setSaveError('');
    try {
      const res  = await fetch('/api/profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.error); return; }
      setEditing(false);
    } catch { setSaveError('Network error'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!delPassword) { setDelError('Enter your password'); return; }
    setDeleting(true); setDelError('');
    try {
      const res  = await fetch('/api/auth/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: delPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setDelError(data.error); return; }
      router.push('/'); router.refresh();
    } catch { setDelError('Network error'); }
    finally { setDeleting(false); }
  }

  return (
    <div className="pg-root">
      <div className="pg-topbar">
        <Link href="/settings" className="pg-back-btn">
          <i className="fa-solid fa-arrow-left" />
        </Link>
        <span className="pg-topbar-title">Profile</span>
      </div>

      <div className="pg-body profile-body">
        <Avatar name={displayName} />

        {/* Display Name */}
        {editing ? (
          <div className="profile-edit-wrap">
            <input
              className="profile-name-input"
              value={displayName}
              maxLength={40}
              onChange={(e) => { setDisplayName(e.target.value); setSaveError(''); }}
              autoFocus
            />
            {saveError && <p className="profile-error">{saveError}</p>}
            <div className="profile-edit-actions">
              <button className="profile-cancel-btn" onClick={() => { setEditing(false); setSaveError(''); }}>
                Cancel
              </button>
              <button className="profile-save-btn" onClick={saveDisplayName} disabled={saving}>
                {saving ? <i className="fa-solid fa-spinner fa-spin" /> : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <button className="profile-name-btn" onClick={() => setEditing(true)}>
            <span className="profile-display-name">{displayName}</span>
            <i className="fa-solid fa-pen-to-square profile-edit-icon" />
          </button>
        )}

        <p className="profile-username">@{username}</p>

        <div className="profile-actions">
          <button className="profile-action-btn" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket" />
            Logout
          </button>

          {!delConfirm ? (
            <button className="profile-action-btn profile-delete-btn" onClick={() => setDelConfirm(true)}>
              <i className="fa-regular fa-trash-can" />
              Delete Account
            </button>
          ) : (
            <div className="profile-del-confirm">
              <p className="profile-del-warning">
                <i className="fa-solid fa-triangle-exclamation" /> This permanently deletes your account and all notes.
              </p>
              <input
                className="profile-del-input"
                type="password"
                placeholder="Enter password to confirm"
                value={delPassword}
                onChange={(e) => { setDelPassword(e.target.value); setDelError(''); }}
              />
              {delError && <p className="profile-error">{delError}</p>}
              <div className="profile-edit-actions">
                <button className="profile-cancel-btn" onClick={() => { setDelConfirm(false); setDelError(''); }}>
                  Cancel
                </button>
                <button className="profile-del-confirm-btn" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
