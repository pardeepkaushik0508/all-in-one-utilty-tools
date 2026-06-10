import { useEffect, useRef, useState } from 'react';
import { NumberField, PrimaryButton, ToolPanel } from '../shared';

function CountdownTimer() {
  const [minutes, setMinutes] = useState(5);
  const [remaining, setRemaining] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const start = () => {
    clearInterval(timerRef.current);
    let secs = Number(minutes) * 60;
    setRemaining(secs);
    timerRef.current = setInterval(() => {
      secs -= 1;
      setRemaining(secs);
      if (secs <= 0) clearInterval(timerRef.current);
    }, 1000);
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-4 text-center">
      <NumberField label="Minutes" value={minutes} onChange={setMinutes} min={1} max={180} />
      <p className="font-display text-5xl font-bold text-heading">{remaining !== null ? fmt(remaining) : fmt(minutes * 60)}</p>
      <PrimaryButton onClick={start}>Start countdown</PrimaryButton>
    </div>
  );
}

function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const startRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const toggle = () => {
    if (running) {
      clearInterval(timerRef.current);
      setRunning(false);
      return;
    }
    startRef.current = Date.now() - elapsed;
    setRunning(true);
    timerRef.current = setInterval(() => setElapsed(Date.now() - startRef.current), 50);
  };

  const reset = () => {
    clearInterval(timerRef.current);
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  };

  const lap = () => setLaps((prev) => [elapsed, ...prev]);

  const fmt = (ms) => {
    const s = Math.floor(ms / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 text-center">
      <p className="font-display text-5xl font-bold text-heading">{fmt(elapsed)}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <PrimaryButton onClick={toggle}>{running ? 'Pause' : 'Start'}</PrimaryButton>
        <button type="button" className="btn-secondary" onClick={lap}>Lap</button>
        <button type="button" className="btn-secondary" onClick={reset}>Reset</button>
      </div>
      {laps.length > 0 && (
        <ul className="mx-auto max-w-sm space-y-1 text-left text-sm text-muted">
          {laps.map((lapMs, i) => (
            <li key={i}>Lap {laps.length - i}: {fmt(lapMs)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function UtilityInteractiveShell({ config }) {
  return (
    <ToolPanel>
      {config.mode === 'countdown' && <CountdownTimer />}
      {config.mode === 'stopwatch' && <Stopwatch />}
    </ToolPanel>
  );
}
