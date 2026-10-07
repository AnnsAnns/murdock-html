interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = 'Loading…' }: SpinnerProps) {
  return (
    <div className="loading-panel">
      <span className="spinner" aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
      <span aria-hidden="true">{label}</span>
    </div>
  );
}
