import { useState, useRef, useEffect } from 'react';

// All common audio formats — covers iPhone (.m4a), Android (.ogg/.mp4), browser (.webm)
const ACCEPT = [
  'audio/m4a', 'audio/x-m4a', 'audio/mp4', 'audio/aac',
  'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg',
  '.m4a', '.mp3', '.wav', '.webm', '.ogg', '.aac', '.caf', '.flac',
].join(',');

const getExt = (file) => {
  if (file instanceof File && file.name) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext && ext.length <= 5) return ext;
  }
  const map = {
    'audio/webm': 'webm', 'audio/mp4': 'mp4', 'audio/x-m4a': 'm4a',
    'audio/m4a': 'm4a',   'audio/aac': 'aac', 'audio/mpeg': 'mp3',
    'audio/wav': 'wav',   'audio/ogg': 'ogg',
  };
  return map[file?.type] || 'audio';
};

export default function VoiceRecorder({ onRecordingComplete, label, optional = false }) {
  const [status,          setStatus]          = useState('idle');
  const [duration,        setDuration]        = useState(0);
  const [audioURL,        setAudioURL]        = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [uploadedName,    setUploadedName]    = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const streamRef        = useRef(null);
  const timerRef         = useRef(null);
  const fileInputRef     = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
  };
  const stopTimer = () => clearInterval(timerRef.current);

  const fmt = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const getMimeType = () => {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
    return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
  };

  // ── Record flow ───────────────────────────────────────────
  const handleStart = async () => {
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = getMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        const url  = URL.createObjectURL(blob);
        setAudioURL(url);
        setUploadedName(null);
        if (onRecordingComplete) onRecordingComplete(blob);
        streamRef.current?.getTracks().forEach(t => t.stop());
      };

      recorder.start(100);
      setStatus('recording');
      setDuration(0);
      startTimer();
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
      }
      setStatus('idle');
    }
  };

  const handlePause  = () => { mediaRecorderRef.current?.pause();  stopTimer();  setStatus('paused');    };
  const handleResume = () => { mediaRecorderRef.current?.resume(); startTimer(); setStatus('recording'); };
  const handleStop   = () => { mediaRecorderRef.current?.stop();   stopTimer();  setStatus('done');      };

  // ── File upload flow ──────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (audioURL) URL.revokeObjectURL(audioURL);
    const url = URL.createObjectURL(file);
    setAudioURL(url);
    setUploadedName(file.name);
    setStatus('done');
    if (onRecordingComplete) onRecordingComplete(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  // ── Re-record / re-upload ─────────────────────────────────
  const handleReset = () => {
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL(null);
    setUploadedName(null);
    setDuration(0);
    setStatus('idle');
    if (onRecordingComplete) onRecordingComplete(null);
  };

  return (
    <div className={`voice-recorder ${optional ? 'optional-recorder' : ''}`}>
      {/* Label */}
      <div className="voice-top">
        <span className="voice-icon">🎙</span>
        <p className="voice-label-text">
          {label}
          {optional && <span className="optional-badge">optional</span>}
        </p>
      </div>

      {/* Permission error */}
      {permissionDenied && (
        <p className="permission-error">
          Microphone access denied — allow mic access in browser settings and reload.
        </p>
      )}

      {/* IDLE — show record + upload */}
      {status === 'idle' && !permissionDenied && (
        <div className="recorder-idle-options">
          <button className="btn-record-start" onClick={handleStart} type="button">
            <span className="mic-dot" />
            Record
          </button>
          <div className="recorder-or">or</div>
          <button
            className="btn-upload-audio"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            ↑ Upload file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* REQUESTING MIC */}
      {status === 'requesting' && (
        <p className="requesting-mic">Requesting microphone access…</p>
      )}

      {/* RECORDING / PAUSED */}
      {(status === 'recording' || status === 'paused') && (
        <div>
          <div className={`recording-indicator ${status === 'recording' ? 'recording-active' : ''}`}>
            <div className="rec-dot" />
            <span className="rec-timer">{fmt(duration)}</span>
            <span className="rec-status">
              {status === 'recording' ? 'Recording…' : 'Paused'}
            </span>
          </div>
          <div className="rec-buttons">
            {status === 'recording' ? (
              <button className="btn-rec btn-pause"  onClick={handlePause}  type="button">⏸ Pause</button>
            ) : (
              <button className="btn-rec btn-resume" onClick={handleResume} type="button">▶ Resume</button>
            )}
            <button className="btn-rec btn-stop" onClick={handleStop} type="button">■ Stop</button>
          </div>
        </div>
      )}

      {/* DONE */}
      {status === 'done' && audioURL && (
        <div className="recording-done">
          {uploadedName && (
            <p className="uploaded-filename">📎 {uploadedName}</p>
          )}
          <audio controls src={audioURL} className="audio-player" />
          <button className="btn-rerecord" onClick={handleReset} type="button">
            ↺ {uploadedName ? 'Change file' : 'Re-record'}
          </button>
        </div>
      )}
    </div>
  );
}
