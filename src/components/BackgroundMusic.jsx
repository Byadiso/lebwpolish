import { useCallback, useEffect, useRef, useState } from 'react';
import './BackgroundMusic.css';

const STORAGE_KEY = 'lebw.backgroundMusic.enabled';
const TRACK_URL = `${import.meta.env.BASE_URL}background_songs/background.mp3`;

function getInitialEnabled() {
  try { return window.localStorage.getItem(STORAGE_KEY) !== 'false'; }
  catch { return true; }
}

/** Mounted above the router's page content so navigation never restarts the soundtrack. */
export default function BackgroundMusic() {
  const audioRef = useRef(null);
  const [enabled, setEnabled] = useState(getInitialEnabled);
  const [blocked, setBlocked] = useState(false);
  const [missing, setMissing] = useState(false);

  const tryPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !enabled || missing) return;
    try {
      await audio.play();
      setBlocked(false);
    } catch (error) {
      if (error?.name === 'NotAllowedError') setBlocked(true);
      // Missing files and unsupported formats are handled by the audio error event.
    }
  }, [enabled, missing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.22;
    if (!enabled) {
      audio.pause();
      setBlocked(false);
      return;
    }
    void tryPlay();
  }, [enabled, tryPlay]);

  useEffect(() => {
    if (!enabled || missing) return;
    // Browsers often require a gesture before allowing audible autoplay.
    const resume = () => { void tryPlay(); };
    window.addEventListener('pointerdown', resume, { passive: true });
    window.addEventListener('keydown', resume);
    return () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
  }, [enabled, missing, tryPlay]);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    try { window.localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* storage unavailable */ }
    if (!next) audioRef.current?.pause();
  };

  return <>
    <audio ref={audioRef} src={TRACK_URL} loop preload="auto" onError={() => setMissing(true)} aria-hidden="true" />
    <button type="button" className="lebw-music-toggle" onClick={toggle}
      aria-label={enabled ? 'Turn off background music' : 'Turn on background music'}
      aria-pressed={enabled} title={missing ? 'Add background.mp3 to public/background_songs' : enabled ? 'Turn off background music' : 'Turn on background music'}>
      <span aria-hidden="true">{enabled ? '♫' : '♪'}</span>
      <span>{enabled ? 'Music on' : 'Music off'}</span>
      {enabled && blocked && <span className="lebw-music-hint">Interact to start</span>}
    </button>
  </>;
}
