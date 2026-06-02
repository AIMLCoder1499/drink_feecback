import { useState, useRef, useEffect } from 'react';

export default function VoiceRecorder({ onRecordingComplete, label, optional = false }) {
  const [status, setStatus] = useState('idle'); // idle | requesting | recording | paused | done
  const [duration, setDuration] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const streamRef        = useRef(null);
  const timerRef         = useRef(null);

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

  const handleStart = async () => {
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getMimeType();
      const options  = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        const url  = URL.createObjectURL(blob);
        setAudioURL(url);
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

  const handlePause = () => {
    mediaRecorderRef.current?.pause();
    stopTimer();
    setStatus('paused');
  };

  const handleResume = () => {
    mediaRecorderRef.current?.resume();
    startTimer();
    setStatus('recording');
  };

  const handleStop = () => {
    mediaRecorderRef.current?.stop();
    stopTimer();
    setStatus('done');
  };

  const handleReRecord = () => {
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL(null);
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
          Microphone access denied — please allow mic access in your browser settings and reload.
        </p>
      )}

      {/* IDLE */}
      {status === 'idle' && !permissionDenied && (
        <button className="btn-record-start" onClick={handleStart} type="button">
          <span className="mic-dot" />
          Tap to Record
        </button>
      )}

      {/* REQUESTING */}
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
              <button className="btn-rec btn-pause" onClick={handlePause} type="button">
                ⏸ Pause
              </button>
            ) : (
              <button className="btn-rec btn-resume" onClick={handleResume} type="button">
                ▶ Resume
              </button>
            )}
            <button className="btn-rec btn-stop" onClick={handleStop} type="button">
              ■ Stop
            </button>
          </div>
        </div>
      )}

      {/* DONE */}
      {status === 'done' && audioURL && (
        <div className="recording-done">
          <audio controls src={audioURL} className="audio-player" />
          <button className="btn-rerecord" onClick={handleReRecord} type="button">
            ↺ Re-record
          </button>
        </div>
      )}
    </div>
  );
}
