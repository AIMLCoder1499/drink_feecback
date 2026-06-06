import { useState, useEffect, useRef } from 'react';

const CORRECT = (import.meta.env.VITE_ACCESS_CODE || '').toLowerCase().trim();
const SESSION_KEY = 'form_unlocked';

export default function PinGate({ onUnlock }) {
  const [code,    setCode]    = useState('');
  const [error,   setError]   = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef(null);

  // Already unlocked this session?
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') onUnlock();
    else inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!CORRECT) { onUnlock(); return; } // no env var set — open access
    if (code.toLowerCase().trim() === CORRECT) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      onUnlock();
    } else {
      setError(true);
      setShaking(true);
      setCode('');
      setTimeout(() => setShaking(false), 500);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit();
    if (error) setError(false);
  };

  return (
    <div className="pin-gate">
      <div className="pin-box">
        <div className="brand-mark pin-mark">✦</div>
        <h2 className="pin-title">Enter access code</h2>
        <p className="pin-hint">Get the code from the host.</p>

        <div className={`pin-input-wrap ${shaking ? 'shake' : ''} ${error ? 'pin-error' : ''}`}>
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value); setError(false); }}
            onKeyDown={handleKey}
            placeholder="••••••"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            className="pin-input"
          />
        </div>

        {error && <p className="pin-error-msg">Incorrect code — try again</p>}

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!code.trim()}
          type="button"
        >
          Unlock →
        </button>
      </div>
    </div>
  );
}
