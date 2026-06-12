export default function StepProgressBar({ activeIndex, stepCount, className = '' }) {
  const progressPct = Math.round(((activeIndex + 1) / stepCount) * 100);

  return (
    <div
      className={`fv-step-progress-bar${className ? ` ${className}` : ''}`}
      role="progressbar"
      aria-valuenow={activeIndex + 1}
      aria-valuemin={1}
      aria-valuemax={stepCount}
      aria-label={`Fortschritt ${progressPct} Prozent`}
    >
      <span className="fv-step-progress-bar__fill" style={{ width: `${progressPct}%` }} />
    </div>
  );
}
