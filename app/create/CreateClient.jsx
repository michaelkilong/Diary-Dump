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
  const [tab,      setTab]      = useState('register'); // 'register' | 'login'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Username availability
  const [avail,    setAvail]    = useState(null); // null | {available, reason}
  const [checking, setChecking] = useState(false);
  const debouncedUsername = useDebounce(username.toLowerCase().trim(), 400);
  const router = useRouter();

  useEffect(() => {
    if (tab !== 'register' || debouncedUsername.length < 3) {
      setAvail(null); return;
    }
    setChecking(true);
    fetch(`/api/auth/check?u=${encodeURIComponent(debouncedUsername)}`)
      .then((r) => r.json())
      .then((d) => { setAvail(d); setChecking(false); })
      .catch(() => setChecking(false));
  }, [debouncedUsername, tab]);

  async function handleSubmit() {
    setError('');
    const u = username.toLowerCase().trim();
    if (!u || !password) { setError('Fill in both fields'); return; }
    if (tab === 'register' && avail && !avail.available) {
      setError(avail.reason); return;
    }

    setLoading(true);
    const endpoint = tab === 'register' ? '/api/auth/register' : '/api/auth/login';
    try {
      const res  = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username: u, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/space/${data.username}`);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  const usernameStatus = () => {
    if (tab !== 'register' || username.trim().length < 3) return null;
    if (checking) return <span className="cs-status checking">Checking…</span>;
    if (!avail)   return null;
    if (avail.available) return <span className="cs-status available">✓ Available</span>;
    return <span className="cs-status taken">✗ {avail.reason}</span>;
  };

  return (
    <div className="cs-page">
      {/* Back to wall */}
      <Link href="/" className="cs-back">← Back to wall</Link>

      <div className="cs-card">
        <h2 className="cs-title">
          {tab === 'register' ? 'Creating Space' : 'Welcome Back'}
        </h2>

        {/* Tab switcher */}
        <div className="cs-tabs">
          <button
            className={`cs-tab${tab === 'register' ? ' active' : ''}`}
            onClick={() => { setTab('register'); setError(''); setAvail(null); }}
          >
            Create
          </button>
          <button
            className={`cs-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => { setTab('login'); setError(''); setAvail(null); }}
          >
            Log In
          </button>
        </div>

        <div className="cs-field">
          <label className="cs-label">User Name</label>
          <div className="cs-input-wrap">
            <input
              className={`cs-input${avail && !avail.available ? ' cs-input-error' : ''}`}
              type="text"
              placeholder="yourname"
              value={username}
              maxLength={24}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              onKeyDown={onKey}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck="false"
            />
            {usernameStatus()}
          </div>
          {tab === 'register' && (
            <p className="cs-hint">Letters, numbers, _ · 3–24 chars · Early signup = better chances</p>
          )}
        </div>

        <div className="cs-field">
          <label className="cs-label">Password</label>
          <input
            className="cs-input"
            type="password"
            placeholder={tab === 'register' ? 'Min 6 characters' : '••••••'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            onKeyDown={onKey}
            autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
          />
        </div>

        {error && <p className="cs-error">{error}</p>}

        <button
          className="cs-submit"
          onClick={handleSubmit}
          disabled={loading || (tab === 'register' && avail && !avail.available)}
        >
          {loading ? '…' : tab === 'register' ? 'CREATE' : 'LOG IN'}
        </button>
      </div>
    </div>
  );
}
