// app/create/CreateClient.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function CreateClient() {
  const [tab,      setTab]      = useState('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avail,    setAvail]    = useState(null);
  const [checking, setChecking] = useState(false);
  const nameRef = useRef(null);
  const debouncedUsername = useDebounce(username.toLowerCase().trim(), 400);
  const router = useRouter();

  useEffect(() => {
    if (tab !== 'register' || debouncedUsername.length < 3) { setAvail(null); return; }
    setChecking(true);
    fetch(`/api/auth/check?u=${encodeURIComponent(debouncedUsername)}`)
      .then((r) => r.json())
      .then((d) => { setAvail(d); setChecking(false); })
      .catch(() => setChecking(false));
  }, [debouncedUsername, tab]);

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 80);
  }, [tab]);

  async function handleSubmit() {
    setError('');
    const u = username.toLowerCase().trim();
    if (!u || !password) { setError('Please fill in both fields'); return; }
    if (tab === 'register' && avail && !avail.available) { setError(avail.reason); return; }
    setLoading(true);
    try {
      const res  = await fetch(tab === 'register' ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password, displayName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/space/${data.username}`);
      router.refresh();
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  const statusIcon = () => {
    if (tab !== 'register' || username.trim().length < 3) return null;
    if (checking) return <span className="auth-status checking"><i className="fa-solid fa-spinner fa-spin" /> Checking</span>;
    if (!avail)   return null;
    if (avail.available) return <span className="auth-status ok"><i className="fa-solid fa-circle-check" /> Available</span>;
    return <span className="auth-status err"><i className="fa-solid fa-circle-xmark" /> {avail.reason}</span>;
  };

  return (
    <div className="auth-backdrop">
      {/* Close — back to wall */}
      <Link href="/" className="auth-close" aria-label="Back to wall">
        <i className="fa-solid fa-xmark" />
      </Link>

      <div className="auth-card">

        {/* Brand */}
        <div className="auth-brand">
          <i className="fa-solid fa-feather-pointed auth-brand-icon" />
          <span>Diary Dump</span>
        </div>

        <h2 className="auth-title">
          {tab === 'register' ? 'Create Your Space' : 'Welcome back'}
        </h2>
        <p className="auth-sub">
          {tab === 'register'
            ? 'Your own wall. Free forever.'
            : 'Sign in to your space.'}
        </p>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === 'register' ? ' active' : ''}`}
            onClick={() => { setTab('register'); setError(''); setAvail(null); }}
          >
            Create
          </button>
          <button
            className={`auth-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => { setTab('login'); setError(''); setAvail(null); }}
          >
            Log In
          </button>
        </div>

        {/* Username */}
        <div className="auth-field">
          <label className="auth-label">
            <i className="fa-solid fa-at" /> Username
          </label>
          <div className="auth-input-row">
            <input
              ref={nameRef}
              className={`auth-input${avail && !avail.available ? ' auth-input-err' : ''}`}
              type="text" placeholder="yourname" value={username} maxLength={24}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoComplete="off" autoCapitalize="none" spellCheck="false"
            />
            {statusIcon()}
          </div>
          {tab === 'register' && (
            <p className="auth-hint">
              <i className="fa-solid fa-circle-info" /> Letters, numbers, _ · 3–24 chars · Early sign-up means better name choices
            </p>
          )}
        </div>

        {/* Display Name — register only */}
        {tab === 'register' && (
          <div className="auth-field">
            <label className="auth-label">
              <i className="fa-solid fa-id-card" /> Display Name <span style={{color:'#bbb',fontWeight:400}}>optional</span>
            </label>
            <input
              className="auth-input"
              type="text" placeholder="e.g. Gracy, The Diary, My Wall"
              value={displayName} maxLength={40}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="off"
            />
            <p className="auth-hint">
              <i className="fa-solid fa-circle-info" /> This is what visitors see — e.g. "Gracy's Space". Defaults to your username.
            </p>
          </div>
        )}

        {/* Password */}
        <div className="auth-field">
          <label className="auth-label">
            <i className="fa-solid fa-lock" /> Password
          </label>
          <div className="auth-input-row">
            <input
              className="auth-input"
              type={showPass ? 'text' : 'password'}
              placeholder={tab === 'register' ? 'Min 6 characters' : '••••••'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
            />
            <button className="auth-eye" type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
              <i className={`fa-solid fa-eye${showPass ? '-slash' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="auth-error">
            <i className="fa-solid fa-triangle-exclamation" /> {error}
          </div>
        )}

        <button
          className="auth-submit"
          onClick={handleSubmit}
          disabled={loading || (tab === 'register' && avail && !avail.available)}
        >
          {loading
            ? <><i className="fa-solid fa-spinner fa-spin" /> Please wait…</>
            : tab === 'register'
              ? <><i className="fa-solid fa-wand-magic-sparkles" /> Create Space</>
              : <><i className="fa-solid fa-right-to-bracket" /> Log In</>
          }
        </button>

        <p className="auth-switch">
          {tab === 'register' ? 'Already have a space? ' : "Don't have a space? "}
          <button
            className="auth-switch-btn"
            onClick={() => { setTab(tab === 'register' ? 'login' : 'register'); setError(''); setAvail(null); }}
          >
            {tab === 'register' ? 'Log in' : 'Create one'}
          </button>
        </p>

      </div>
    </div>
  );
}
  
