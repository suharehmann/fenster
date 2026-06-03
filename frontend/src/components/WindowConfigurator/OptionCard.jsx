import SelectedMark from '@/components/ui/SelectedMark';

/**
 * Selection card for the standalone window configurator (material, system, profile, etc.).
 */
export default function OptionCard({ option, selected, onSelect, disabled = false }) {
  const isSelected = option.id === selected;
  const priceImpact = option.priceImpact;
  const isRowLayout = !option.image;
  const cardClassName = [
    'wc-card',
    isRowLayout ? 'wc-card--row' : '',
    isSelected ? 'is-selected' : '',
    disabled ? 'is-disabled' : ''
  ]
    .filter(Boolean)
    .join(' ');

  function handleSelect() {
    if (disabled) {
      return;
    }
    onSelect(option.id);
  }

  return (
    <button
      type="button"
      className={cardClassName}
      onClick={handleSelect}
      disabled={disabled}
      aria-disabled={disabled}
    >
      <SelectedMark selected={isSelected} />

      {option.image && (
        <img src={option.image} alt="" className="wc-card-shape" loading="lazy" decoding="async" />
      )}

      {option.color !== undefined && !option.image && (
        <span className="wc-card-swatch" style={{ backgroundColor: option.color }} aria-hidden="true" />
      )}

      <span className="wc-card-body">
        <strong className="wc-card-label">{option.label}</strong>
        {disabled && <span className="wc-card-sub">bald verfügbar</span>}
        {option.startingPrice != null && (
          <span className="wc-card-start">ab {option.startingPrice} €</span>
        )}
      </span>

      {priceImpact ? <span className="wc-card-price">+ {priceImpact} €</span> : null}
    </button>
  );
}
