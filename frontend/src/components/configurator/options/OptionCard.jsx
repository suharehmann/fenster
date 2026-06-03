import './OptionCard.scss';
import SelectedMark from '@/components/ui/SelectedMark';

/**
 * Reusable option tile for configurator grids (studio + intro).
 */
export default function OptionCard({
  option,
  selected,
  onSelect,
  className = 'select-card',
  children
}) {
  const optionId = option.id ?? option;
  const optionLabel = option.label ?? option;
  const isSelected = optionId === selected;
  const cardClassName = `${className} ${isSelected ? 'selected' : ''}`;

  function handleSelect() {
    onSelect(optionId);
  }

  return (
    <button type="button" className={cardClassName} onClick={handleSelect}>
      {option.badge && <span className="card-badge">{option.badge}</span>}
      <SelectedMark selected={isSelected} />
      {children ?? (
        <>
          {option.image && (
            <img src={option.image} alt={optionLabel} loading="lazy" decoding="async" />
          )}
          {option.color && (
            <span className="color-chip" style={{ backgroundColor: option.color }} aria-hidden="true" />
          )}
          <strong>{optionLabel}</strong>
          {option.meta && <span>{option.meta}</span>}
          {option.metric && <span className="card-metric">{option.metric}</span>}
          {option.footer && <span className="card-footer">{option.footer}</span>}
        </>
      )}
    </button>
  );
}
