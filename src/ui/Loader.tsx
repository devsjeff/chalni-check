export function Loader({ progress }: { progress: number }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <p className="loader-text">Chaand sajaya ja raha hai…</p>
      <div className="loader-bar" aria-hidden="true">
        <span style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
      </div>
      <span className="sr-only">{Math.round(progress * 100)} percent</span>
    </div>
  );
}
