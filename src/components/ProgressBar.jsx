const LABELS = ['Who You Are', 'The Effect', 'Product'];

export default function ProgressBar({ current, total }) {
  return (
    <div className="progress-wrap">
      <p className="progress-label">
        Step {current} of {total} — {LABELS[current - 1]}
      </p>
      <div className="progress-segments">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`progress-seg ${
              i + 1 < current ? 'done' : i + 1 === current ? 'active' : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
}
