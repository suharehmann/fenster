export default function DashedStepProgress({
  steps,
  activeIndex,
  onSelect,
  ariaLabel = 'Konfigurationsfortschritt'
}) {
  return (
    <ol className="fv-dashed-progress" aria-label={ariaLabel}>
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isDone = index < activeIndex;
        const isClickable = typeof onSelect === 'function' && index <= activeIndex;
        const stateClass = isActive ? 'is-active' : isDone ? 'is-done' : 'is-upcoming';
        const label = step.title ?? step.label ?? `Schritt ${index + 1}`;

        return (
          <li key={step.num ?? step.id ?? index} className={`fv-dashed-progress__item ${stateClass}`}>
            {isClickable ? (
              <button
                type="button"
                className="fv-dashed-progress__seg"
                onClick={() => onSelect(index)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${label}, Schritt ${index + 1}${
                  isDone ? ', abgeschlossen' : isActive ? ', aktuell' : ''
                }`}
              />
            ) : (
              <span
                className="fv-dashed-progress__seg"
                aria-current={isActive ? 'step' : undefined}
                aria-hidden={!isActive}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
